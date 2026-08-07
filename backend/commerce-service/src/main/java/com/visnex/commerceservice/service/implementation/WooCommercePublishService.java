package com.visnex.commerceservice.service.implementation;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.visnex.commerceservice.dto.output.ResultDTO;
import com.visnex.commerceservice.entity.*;
import com.visnex.commerceservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class WooCommercePublishService {

    private static final String STATUS_SYNCED = "SYNCED";
    private static final String STATUS_FAILED = "FAILED";

    private final ProductRepository productRepository;
    private final PublishChannelRepository channelRepository;
    private final ProductPublishRepository publishRepository;
    private final ProductImageRepository productImageRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    // =========================================================================
    //  PUBLICAR (crear en WooCommerce)
    // =========================================================================

    @Transactional
    public ResultDTO publishProduct(Long productId, Long channelId, String language) {
        try {
            Optional<Product> optP = productRepository.findById(productId);
            if (optP.isEmpty()) return new ResultDTO(false, "Product not found", 102);
            Optional<PublishChannel> optC = channelRepository.findById(channelId);
            if (optC.isEmpty()) return new ResultDTO(false, "Channel not found", 102);
            Product product = optP.get();

            if (product.getBasePrice() == null) {
                return new ResultDTO(false, "Product must have a base price before publishing", 102);
            }

            // Solo bloquea si ya hay una publicacion EXITOSA. Antes se consultaba
            // por active=true, que tambien encuentra los intentos FALLIDOS (se
            // guardan con active=true), y eso dejaba el producto imposible de
            // republicar para siempre tras un unico fallo de red.
            Optional<ProductPublish> synced = publishRepository
                    .findFirstByIdProductAndIdChannelAndSyncStatusAndActive(productId, channelId, STATUS_SYNCED, true);
            if (synced.isPresent()) {
                return new ResultDTO(false,
                        "Product is already published to this channel. External ID: " + synced.get().getExternalId()
                                + ". Use /update to re-sync.", 101);
            }

            // Si hubo intentos fallidos previos, se REUTILIZA la fila en vez de
            // acumular una nueva por cada reintento.
            ProductPublish pub = publishRepository
                    .findFirstByIdProductAndIdChannelAndSyncStatusAndActive(productId, channelId, STATUS_FAILED, true)
                    .orElseGet(ProductPublish::new);

            Map<String, String> cfg = readConfig(optC.get());
            Map<String, Object> wc = buildPayload(product, productId);

            ResponseEntity<String> resp;
            try {
                resp = restTemplate.exchange(
                        cfg.get("siteUrl") + "/wp-json/wc/v3/products",
                        HttpMethod.POST,
                        new HttpEntity<>(wc, authHeaders(cfg)),
                        String.class);
            } catch (Exception apiEx) {
                log.error("WC publish failed for product {}: {}", productId, apiEx.getMessage(), apiEx);
                saveFailure(pub, product, productId, channelId, apiEx.getMessage());
                return new ResultDTO(false, "WC API call failed: " + apiEx.getMessage(), 103);
            }

            if (!resp.getStatusCode().is2xxSuccessful()) {
                saveFailure(pub, product, productId, channelId, "WC API returned status: " + resp.getStatusCode());
                return new ResultDTO(false, "WC error: " + resp.getStatusCode(), 103);
            }

            JsonNode wcR = objectMapper.readTree(resp.getBody());
            fillOwnership(pub, product, productId, channelId);
            pub.setExternalId(wcR.path("id").asText());
            pub.setExternalUrl(wcR.path("permalink").asText());
            pub.setSyncStatus(STATUS_SYNCED);
            pub.setLastError(null);
            pub.setLastSync(LocalDateTime.now());
            publishRepository.save(pub);

            product.setStatus("PUBLISHED");
            productRepository.save(product);

            return new ResultDTO(Map.of(
                    "wcProductId", wcR.path("id").asText(),
                    "permalink", wcR.path("permalink").asText()));
        } catch (Exception e) {
            log.error("Publish error for product {}: {}", productId, e.getMessage(), e);
            return new ResultDTO(false, "Error: " + e.getMessage(), 103);
        }
    }

    // =========================================================================
    //  ACTUALIZAR (re-sincronizar un producto ya publicado)
    // =========================================================================

    /**
     * Reenvia a WooCommerce el estado actual del producto (precio, titulo,
     * descripcion, imagenes, SEO) mediante PUT.
     *
     * Antes solo existia el POST de creacion: cambiar el precio de un producto
     * ya publicado no llegaba nunca a la tienda.
     */
    @Transactional
    public ResultDTO updateProduct(Long productId, Long channelId, String language) {
        try {
            Optional<Product> optP = productRepository.findById(productId);
            if (optP.isEmpty()) return new ResultDTO(false, "Product not found", 102);
            Optional<PublishChannel> optC = channelRepository.findById(channelId);
            if (optC.isEmpty()) return new ResultDTO(false, "Channel not found", 102);

            Optional<ProductPublish> optPub = publishRepository
                    .findFirstByIdProductAndIdChannelAndSyncStatusAndActive(productId, channelId, STATUS_SYNCED, true);
            if (optPub.isEmpty()) {
                return new ResultDTO(false, "Product is not published to this channel yet. Use /publish first.", 102);
            }

            Product product = optP.get();
            ProductPublish pub = optPub.get();
            Map<String, String> cfg = readConfig(optC.get());
            Map<String, Object> wc = buildPayload(product, productId);

            ResponseEntity<String> resp;
            try {
                resp = restTemplate.exchange(
                        cfg.get("siteUrl") + "/wp-json/wc/v3/products/" + pub.getExternalId(),
                        HttpMethod.PUT,
                        new HttpEntity<>(wc, authHeaders(cfg)),
                        String.class);
            } catch (Exception apiEx) {
                log.error("WC update failed for product {}: {}", productId, apiEx.getMessage(), apiEx);
                pub.setLastError(apiEx.getMessage());
                pub.setLastSync(LocalDateTime.now());
                publishRepository.save(pub);
                return new ResultDTO(false, "WC API call failed: " + apiEx.getMessage(), 103);
            }

            if (!resp.getStatusCode().is2xxSuccessful()) {
                pub.setLastError("WC API returned status: " + resp.getStatusCode());
                pub.setLastSync(LocalDateTime.now());
                publishRepository.save(pub);
                return new ResultDTO(false, "WC error: " + resp.getStatusCode(), 103);
            }

            JsonNode wcR = objectMapper.readTree(resp.getBody());
            pub.setExternalUrl(wcR.path("permalink").asText());
            pub.setSyncStatus(STATUS_SYNCED);
            pub.setLastError(null);
            pub.setLastSync(LocalDateTime.now());
            publishRepository.save(pub);

            return new ResultDTO(Map.of(
                    "wcProductId", pub.getExternalId(),
                    "permalink", wcR.path("permalink").asText(),
                    "updated", true));
        } catch (Exception e) {
            log.error("Update error for product {}: {}", productId, e.getMessage(), e);
            return new ResultDTO(false, "Error: " + e.getMessage(), 103);
        }
    }

    // =========================================================================
    //  TEST DE CONEXION
    // =========================================================================

    public ResultDTO testConnection(Long channelId, String language) {
        try {
            Optional<PublishChannel> opt = channelRepository.findById(channelId);
            if (opt.isEmpty()) return new ResultDTO(false, "Channel not found", 102);
            Map<String, String> cfg = readConfig(opt.get());
            ResponseEntity<String> r = restTemplate.exchange(
                    cfg.get("siteUrl") + "/wp-json/wc/v3/products?per_page=1",
                    HttpMethod.GET,
                    new HttpEntity<>(authHeaders(cfg)),
                    String.class);
            boolean ok = r.getStatusCode().is2xxSuccessful();
            opt.get().setStatus(ok ? "CONNECTED" : "ERROR");
            opt.get().setLastSync(LocalDateTime.now());
            channelRepository.save(opt.get());
            return new ResultDTO(Map.of("connected", ok));
        } catch (Exception e) {
            log.warn("WC connection test failed for channel {}: {}", channelId, e.getMessage());
            return new ResultDTO(false, "Connection failed: " + e.getMessage(), 103);
        }
    }

    // =========================================================================
    //  HELPERS
    // =========================================================================

    @SuppressWarnings("unchecked")
    private Map<String, String> readConfig(PublishChannel channel) throws Exception {
        return objectMapper.readValue(channel.getConfig(), Map.class);
    }

    private HttpHeaders authHeaders(Map<String, String> cfg) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth(cfg.get("consumerKey"), cfg.get("consumerSecret"));
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    /** Construye el cuerpo que espera la REST API de WooCommerce. */
    @SuppressWarnings("unchecked")
    private Map<String, Object> buildPayload(Product product, Long productId) {
        Map<String, Object> wc = new LinkedHashMap<>();
        String title = product.getEnrichedTitle() != null ? product.getEnrichedTitle() : product.getTitle();
        wc.put("name", title);
        wc.put("type", "simple");

        String price = product.getSellingPrice() != null
                ? product.getSellingPrice().toString()
                : product.getBasePrice() != null ? product.getBasePrice().toString() : "0";
        wc.put("regular_price", price);

        wc.put("description", product.getEnrichedDescription() != null
                ? product.getEnrichedDescription()
                : product.getDescription() != null ? product.getDescription() : "");
        wc.put("short_description", product.getBulletPoints() != null ? product.getBulletPoints() : "");
        wc.put("status", "publish");

        // SEO (Yoast)
        List<Map<String, String>> metaData = new ArrayList<>();
        if (product.getSeoTitle() != null && !product.getSeoTitle().isBlank()) {
            metaData.add(Map.of("key", "_yoast_wpseo_title", "value", product.getSeoTitle()));
        }
        if (product.getSeoDescription() != null && !product.getSeoDescription().isBlank()) {
            metaData.add(Map.of("key", "_yoast_wpseo_metadesc", "value", product.getSeoDescription()));
        }
        if (product.getSeoKeywords() != null && !product.getSeoKeywords().isBlank()) {
            metaData.add(Map.of("key", "_yoast_wpseo_focuskw", "value", product.getSeoKeywords().split(",")[0].trim()));
        }
        if (!metaData.isEmpty()) wc.put("meta_data", metaData);

        if (product.getTags() != null && !product.getTags().isBlank()) {
            try {
                List<String> tagList = objectMapper.readValue(product.getTags(), List.class);
                wc.put("tags", tagList.stream().map(t -> Map.of("name", t.toString().trim())).toList());
            } catch (Exception e) {
                log.debug("Tags no parseables para el producto {}: {}", productId, e.getMessage());
            }
        }

        List<ProductImage> images = productImageRepository
                .findByIdProductAndActiveOrderBySortOrderAsc(productId, true);
        if (!images.isEmpty()) {
            List<Map<String, Object>> wcImages = new ArrayList<>();
            for (ProductImage img : images) {
                Map<String, Object> imgMap = new LinkedHashMap<>();
                imgMap.put("src", img.getUrl());
                String altText = img.getAltText() != null && !img.getAltText().isBlank()
                        ? img.getAltText()
                        : title + " - " + (img.getSource() != null ? img.getSource() : "imagen");
                imgMap.put("alt", altText);
                imgMap.put("name", title);
                wcImages.add(imgMap);
            }
            wc.put("images", wcImages);
        }
        return wc;
    }

    private void fillOwnership(ProductPublish pub, Product product, Long productId, Long channelId) {
        pub.setIdProduct(productId);
        pub.setIdChannel(channelId);
        pub.setCompanyId(product.getCompanyId());
        pub.setSubsidiaryId(product.getSubsidiaryId());
        pub.setIdModifiedBy(product.getIdModifiedBy());
        pub.setActive(true);
    }

    private void saveFailure(ProductPublish pub, Product product, Long productId, Long channelId, String error) {
        fillOwnership(pub, product, productId, channelId);
        pub.setSyncStatus(STATUS_FAILED);
        pub.setLastError(error);
        pub.setLastSync(LocalDateTime.now());
        publishRepository.save(pub);
    }
}
