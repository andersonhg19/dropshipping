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
            Map<String, String> cfg = objectMapper.readValue(optC.get().getConfig(), Map.class);
            Map<String, Object> wc = new LinkedHashMap<>();
            wc.put("name", product.getEnrichedTitle() != null ? product.getEnrichedTitle() : product.getTitle());
            wc.put("type", "simple");
            String price = product.getSellingPrice() != null ? product.getSellingPrice().toString() : product.getBasePrice() != null ? product.getBasePrice().toString() : "0";
            wc.put("regular_price", price);
            wc.put("description", product.getEnrichedDescription() != null ? product.getEnrichedDescription() : product.getDescription() != null ? product.getDescription() : "");
            wc.put("status", "publish");
            HttpHeaders headers = new HttpHeaders();
            headers.setBasicAuth(cfg.get("consumerKey"), cfg.get("consumerSecret"));
            headers.setContentType(MediaType.APPLICATION_JSON);
            ResponseEntity<String> resp = restTemplate.exchange(cfg.get("siteUrl") + "/wp-json/wc/v3/products", HttpMethod.POST, new HttpEntity<>(wc, headers), String.class);
            if (!resp.getStatusCode().is2xxSuccessful()) return new ResultDTO(false, "WC error", 103);
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
