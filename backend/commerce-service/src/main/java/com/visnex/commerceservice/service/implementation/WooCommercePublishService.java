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
import org.springframework.web.client.RestTemplate;
import java.time.LocalDateTime;
import java.util.*;
@Slf4j @Service @RequiredArgsConstructor
public class WooCommercePublishService {
    private final ProductRepository productRepository;
    private final PublishChannelRepository channelRepository;
    private final ProductPublishRepository publishRepository;
    private final ProductImageRepository productImageRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;
    @SuppressWarnings("unchecked")
    public ResultDTO publishProduct(Long productId, Long channelId, String language) {
        try {
            Optional<Product> optP = productRepository.findById(productId);
            if (optP.isEmpty()) return new ResultDTO(false, "Product not found", 102);
            Optional<PublishChannel> optC = channelRepository.findById(channelId);
            if (optC.isEmpty()) return new ResultDTO(false, "Channel not found", 102);
            Product product = optP.get();

            // Bug #15: Validate basePrice is not null before publishing
            if (product.getBasePrice() == null) {
                return new ResultDTO(false, "Product must have a base price before publishing", 102);
            }

            // Bug #14: Check if ProductPublish already exists for this product+channel
            Optional<ProductPublish> existingPub = publishRepository.findFirstByIdProductAndIdChannelAndActive(productId, channelId, true);
            if (existingPub.isPresent()) {
                return new ResultDTO(false, "Product is already published to this channel. External ID: " + existingPub.get().getExternalId(), 101);
            }

            Map<String, String> cfg = objectMapper.readValue(optC.get().getConfig(), Map.class);
            Map<String, Object> wc = new LinkedHashMap<>();
            String title = product.getEnrichedTitle() != null ? product.getEnrichedTitle() : product.getTitle();
            wc.put("name", title);
            wc.put("type", "simple");
            String price = product.getSellingPrice() != null ? product.getSellingPrice().toString() : product.getBasePrice() != null ? product.getBasePrice().toString() : "0";
            wc.put("regular_price", price);
            wc.put("description", product.getEnrichedDescription() != null ? product.getEnrichedDescription() : product.getDescription() != null ? product.getDescription() : "");
            wc.put("short_description", product.getBulletPoints() != null ? product.getBulletPoints() : "");
            wc.put("status", "publish");

            // SEO meta data (Yoast SEO)
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

            // Tags from product tags JSON
            if (product.getTags() != null && !product.getTags().isBlank()) {
                try {
                    List<String> tagList = objectMapper.readValue(product.getTags(), List.class);
                    List<Map<String, String>> wcTags = tagList.stream()
                        .map(t -> Map.of("name", t.toString().trim()))
                        .toList();
                    wc.put("tags", wcTags);
                } catch (Exception ignored) {}
            }

            // Images with auto-generated alt text for accessibility
            List<ProductImage> images = productImageRepository
                .findByIdProductAndActiveOrderBySortOrderAsc(productId, true);
            if (!images.isEmpty()) {
                List<Map<String, Object>> wcImages = new ArrayList<>();
                for (ProductImage img : images) {
                    Map<String, Object> imgMap = new LinkedHashMap<>();
                    imgMap.put("src", img.getUrl());
                    // Auto alt text: use product title + image source for accessibility
                    String altText = img.getAltText() != null && !img.getAltText().isBlank()
                        ? img.getAltText()
                        : title + " - " + (img.getSource() != null ? img.getSource() : "imagen");
                    imgMap.put("alt", altText);
                    imgMap.put("name", title);
                    wcImages.add(imgMap);
                }
                wc.put("images", wcImages);
            }
            HttpHeaders headers = new HttpHeaders();
            headers.setBasicAuth(cfg.get("consumerKey"), cfg.get("consumerSecret"));
            headers.setContentType(MediaType.APPLICATION_JSON);
            ResponseEntity<String> resp;
            try {
                resp = restTemplate.exchange(cfg.get("siteUrl") + "/wp-json/wc/v3/products", HttpMethod.POST, new HttpEntity<>(wc, headers), String.class);
            } catch (Exception apiEx) {
                // Bug #16: If API call fails, save FAILED status, don't mark product as PUBLISHED
                ProductPublish failedPub = new ProductPublish();
                failedPub.setIdProduct(productId);
                failedPub.setIdChannel(channelId);
                failedPub.setSyncStatus("FAILED");
                failedPub.setLastError(apiEx.getMessage());
                failedPub.setLastSync(LocalDateTime.now());
                failedPub.setCompanyId(product.getCompanyId());
                failedPub.setSubsidiaryId(product.getSubsidiaryId());
                failedPub.setIdModifiedBy(product.getIdModifiedBy());
                failedPub.setActive(true);
                publishRepository.save(failedPub);
                return new ResultDTO(false, "WC API call failed: " + apiEx.getMessage(), 103);
            }
            if (!resp.getStatusCode().is2xxSuccessful()) {
                // Bug #16: Save FAILED status on non-2xx response
                ProductPublish failedPub = new ProductPublish();
                failedPub.setIdProduct(productId);
                failedPub.setIdChannel(channelId);
                failedPub.setSyncStatus("FAILED");
                failedPub.setLastError("WC API returned status: " + resp.getStatusCode());
                failedPub.setLastSync(LocalDateTime.now());
                failedPub.setCompanyId(product.getCompanyId());
                failedPub.setSubsidiaryId(product.getSubsidiaryId());
                failedPub.setIdModifiedBy(product.getIdModifiedBy());
                failedPub.setActive(true);
                publishRepository.save(failedPub);
                return new ResultDTO(false, "WC error: " + resp.getStatusCode(), 103);
            }
            JsonNode wcR = objectMapper.readTree(resp.getBody());
            ProductPublish pub = new ProductPublish();
            pub.setIdProduct(productId);
            pub.setIdChannel(channelId);
            pub.setExternalId(wcR.path("id").asText());
            pub.setExternalUrl(wcR.path("permalink").asText());
            pub.setSyncStatus("SYNCED");
            pub.setLastSync(LocalDateTime.now());
            pub.setCompanyId(product.getCompanyId());
            pub.setSubsidiaryId(product.getSubsidiaryId());
            pub.setIdModifiedBy(product.getIdModifiedBy());
            pub.setActive(true);
            publishRepository.save(pub);
            // Bug #16: Only set PUBLISHED after successful WC API call
            product.setStatus("PUBLISHED");
            productRepository.save(product);
            return new ResultDTO(Map.of("wcProductId", wcR.path("id").asText(), "permalink", wcR.path("permalink").asText()));
        } catch (Exception e) { log.error("Publish error: {}", e.getMessage()); return new ResultDTO(false, "Error: " + e.getMessage(), 103); }
    }
    @SuppressWarnings("unchecked")
    public ResultDTO testConnection(Long channelId, String language) {
        try {
            Optional<PublishChannel> opt = channelRepository.findById(channelId);
            if (opt.isEmpty()) return new ResultDTO(false, "Channel not found", 102);
            Map<String, String> cfg = objectMapper.readValue(opt.get().getConfig(), Map.class);
            HttpHeaders h = new HttpHeaders();
            h.setBasicAuth(cfg.get("consumerKey"), cfg.get("consumerSecret"));
            ResponseEntity<String> r = restTemplate.exchange(cfg.get("siteUrl") + "/wp-json/wc/v3/products?per_page=1", HttpMethod.GET, new HttpEntity<>(h), String.class);
            opt.get().setStatus(r.getStatusCode().is2xxSuccessful() ? "CONNECTED" : "ERROR");
            opt.get().setLastSync(LocalDateTime.now());
            channelRepository.save(opt.get());
            return new ResultDTO(Map.of("connected", r.getStatusCode().is2xxSuccessful()));
        } catch (Exception e) { return new ResultDTO(false, "Connection failed: " + e.getMessage(), 103); }
    }
}
