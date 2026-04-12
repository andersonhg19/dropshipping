package com.visnex.commerceservice.service.implementation;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.visnex.commerceservice.dto.output.ResultDTO;
import com.visnex.commerceservice.entity.EnrichmentConfig;
import com.visnex.commerceservice.entity.Product;
import com.visnex.commerceservice.entity.PromptTemplate;
import com.visnex.commerceservice.repository.EnrichmentConfigRepository;
import com.visnex.commerceservice.repository.ProductRepository;
import com.visnex.commerceservice.repository.PromptTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiEnrichmentService {

    private final ProductRepository productRepository;
    private final EnrichmentConfigRepository enrichmentConfigRepository;
    private final PromptTemplateRepository promptTemplateRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    // Bug #20: Rate limiting - max 5 concurrent enrichments
    private static final AtomicInteger concurrentEnrichments = new AtomicInteger(0);
    private static final int MAX_CONCURRENT_ENRICHMENTS = 5;

    /**
     * Enrich a single product using AI - generates title, description, bullets, SEO in one call.
     */
    public ResultDTO enrichProduct(Long productId, Long companyId, String language) {
        return enrichProduct(productId, companyId, language, false);
    }

    /**
     * Enrich a single product using AI with optional force flag.
     */
    public ResultDTO enrichProduct(Long productId, Long companyId, String language, boolean force) {
        // Bug #20: Check concurrent enrichment limit
        if (concurrentEnrichments.get() >= MAX_CONCURRENT_ENRICHMENTS) {
            return new ResultDTO(false, "Too many concurrent enrichments. Please try again later.", 103);
        }
        concurrentEnrichments.incrementAndGet();
        try {
            Optional<Product> optProduct = productRepository.findById(productId);
            if (optProduct.isEmpty()) {
                return new ResultDTO(false, "Product not found", 102);
            }

            Product product = optProduct.get();

            // Bug #26: Skip if already enriched (unless force=true)
            if ("ENRICHED".equals(product.getStatus()) && !force) {
                return new ResultDTO(false, "Product is already enriched. Use force=true to re-enrich.", 101);
            }

            List<EnrichmentConfig> configs = enrichmentConfigRepository
                    .findAll().stream()
                    .filter(c -> c.getCompanyId() != null && c.getCompanyId().equals(companyId) && Boolean.TRUE.equals(c.getActive()))
                    .toList();

            if (configs.isEmpty()) {
                return new ResultDTO(false, "No active AI enrichment config found for this company", 102);
            }

            EnrichmentConfig config = configs.get(0);

            // Bug #25: Reset monthly spend if lastSpendReset is null or in a different month
            YearMonth currentMonth = YearMonth.now();
            if (config.getLastSpendReset() == null
                    || !YearMonth.from(config.getLastSpendReset()).equals(currentMonth)) {
                config.setCurrentMonthSpend(BigDecimal.ZERO);
                config.setLastSpendReset(LocalDateTime.now());
                enrichmentConfigRepository.save(config);
            }

            // Check budget
            if (config.getMonthlyBudget() != null && config.getCurrentMonthSpend() != null
                    && config.getCurrentMonthSpend().compareTo(config.getMonthlyBudget()) >= 0) {
                return new ResultDTO(false, "Monthly AI budget exceeded", 102);
            }

            // Build prompt
            String prompt = buildEnrichmentPrompt(product, companyId);

            // Call AI API
            Map<String, Object> aiResponse = callAiApi(config, prompt);
            if (aiResponse == null) {
                return new ResultDTO(false, "AI API call failed", 103);
            }

            // Bug #21: Validate that AI response contains "enrichedTitle"
            if (!aiResponse.containsKey("enrichedTitle")) {
                return new ResultDTO(false, "AI response missing required 'enrichedTitle' field", 103);
            }

            // Apply enrichment to product
            applyEnrichment(product, aiResponse);
            product.setStatus("ENRICHED");
            productRepository.save(product);

            // Update spend tracking
            BigDecimal estimatedCost = estimateCost(config, prompt, aiResponse.toString());
            if (config.getCurrentMonthSpend() == null) {
                config.setCurrentMonthSpend(estimatedCost);
            } else {
                config.setCurrentMonthSpend(config.getCurrentMonthSpend().add(estimatedCost));
            }
            enrichmentConfigRepository.save(config);

            return new ResultDTO(Map.of(
                    "productId", product.getId(),
                    "status", "ENRICHED",
                    "enrichedTitle", product.getEnrichedTitle() != null ? product.getEnrichedTitle() : "",
                    "estimatedCost", estimatedCost
            ));

        } catch (Exception e) {
            log.error("Error enriching product {}: {}", productId, e.getMessage());
            return new ResultDTO(false, "Error: " + e.getMessage(), 103);
        } finally {
            // Bug #20: Always decrement concurrent counter
            concurrentEnrichments.decrementAndGet();
        }
    }

    /**
     * Enrich multiple products in batch.
     */
    public ResultDTO enrichBatch(List<Long> productIds, Long companyId, String language) {
        int success = 0;
        int failed = 0;
        for (Long id : productIds) {
            ResultDTO result = enrichProduct(id, companyId, language);
            if (result.isCorrect()) success++;
            else failed++;
        }
        return new ResultDTO(Map.of("success", success, "failed", failed, "total", productIds.size()));
    }

    private String buildEnrichmentPrompt(Product product, Long companyId) {
        // Try to find a template for the product's category
        List<PromptTemplate> templates = promptTemplateRepository.findAll().stream()
                .filter(t -> t.getCompanyId() != null && t.getCompanyId().equals(companyId) && Boolean.TRUE.equals(t.getActive()))
                .toList();

        String promptText;
        if (!templates.isEmpty()) {
            promptText = templates.get(0).getPromptText();
            // Replace variables
            promptText = promptText.replace("{{title}}", product.getTitle() != null ? product.getTitle() : "")
                    .replace("{{description}}", product.getDescription() != null ? product.getDescription() : "")
                    .replace("{{price}}", product.getBasePrice() != null ? product.getBasePrice().toString() : "")
                    .replace("{{category}}", product.getIdCategory() != null ? product.getIdCategory().toString() : "General")
                    .replace("{{tags}}", product.getTags() != null ? product.getTags() : "");
        } else {
            // Default prompt in Spanish for Colombian market. For multi-language support, use PromptTemplate entity.
            promptText = String.format("""
                    Eres un experto en ecommerce de moda. Genera contenido comercial para este producto en espanol.

                    Producto original:
                    - Titulo: %s
                    - Descripcion: %s
                    - Precio base: %s USD
                    - Tags: %s

                    Responde SOLO con un JSON valido (sin markdown, sin explicacion) con esta estructura exacta:
                    {
                      "enrichedTitle": "titulo mejorado SEO-friendly, max 70 caracteres",
                      "enrichedDescription": "descripcion comercial persuasiva, 2-3 parrafos",
                      "bulletPoints": ["punto 1", "punto 2", "punto 3", "punto 4"],
                      "seoTitle": "titulo SEO max 60 caracteres",
                      "seoDescription": "meta description max 160 caracteres",
                      "seoKeywords": "keyword1, keyword2, keyword3, keyword4, keyword5",
                      "suggestedCategory": "categoria sugerida"
                    }
                    """,
                    product.getTitle() != null ? product.getTitle() : "Sin titulo",
                    product.getDescription() != null ? product.getDescription() : "Sin descripcion",
                    product.getBasePrice() != null ? product.getBasePrice().toString() : "N/A",
                    product.getTags() != null ? product.getTags() : "");
        }

        return promptText;
    }

    private Map<String, Object> callAiApi(EnrichmentConfig config, String prompt) {
        try {
            String provider = config.getProvider();
            String apiKey = config.getApiKey();
            String model = config.getModel();

            if (provider == null || apiKey == null) return null;

            String url;
            Map<String, Object> requestBody;

            if ("OPENAI".equalsIgnoreCase(provider)) {
                url = "https://api.openai.com/v1/chat/completions";
                requestBody = Map.of(
                        "model", model != null ? model : "gpt-4o-mini",
                        "messages", List.of(
                                Map.of("role", "system", "content", "Eres un asistente de ecommerce. Responde solo con JSON valido."),
                                Map.of("role", "user", "content", prompt)
                        ),
                        "temperature", 0.7,
                        "max_tokens", 1000
                );
            } else if ("CLAUDE".equalsIgnoreCase(provider)) {
                url = "https://api.anthropic.com/v1/messages";
                requestBody = Map.of(
                        "model", model != null ? model : "claude-haiku-4-5-20251001",
                        "max_tokens", 1000,
                        "messages", List.of(
                                Map.of("role", "user", "content", prompt)
                        )
                );
            } else {
                log.warn("Unsupported AI provider: {}", provider);
                return null;
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            if ("OPENAI".equalsIgnoreCase(provider)) {
                headers.setBearerAuth(apiKey);
            } else if ("CLAUDE".equalsIgnoreCase(provider)) {
                headers.set("x-api-key", apiKey);
                headers.set("anthropic-version", "2023-06-01");
            }

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                log.error("AI API returned status: {}", response.getStatusCode());
                return null;
            }

            // Parse response based on provider
            JsonNode root = objectMapper.readTree(response.getBody());
            String content;

            if ("OPENAI".equalsIgnoreCase(provider)) {
                content = root.path("choices").path(0).path("message").path("content").asText();
            } else {
                content = root.path("content").path(0).path("text").asText();
            }

            // Parse the JSON content from AI response
            content = content.trim();
            if (content.startsWith("```json")) content = content.substring(7);
            if (content.startsWith("```")) content = content.substring(3);
            if (content.endsWith("```")) content = content.substring(0, content.length() - 3);
            content = content.trim();

            return objectMapper.readValue(content, Map.class);

        } catch (Exception e) {
            log.error("AI API call error: {}", e.getMessage());
            return null;
        }
    }

    private void applyEnrichment(Product product, Map<String, Object> aiResponse) {
        if (aiResponse.containsKey("enrichedTitle")) {
            product.setEnrichedTitle((String) aiResponse.get("enrichedTitle"));
        }
        if (aiResponse.containsKey("enrichedDescription")) {
            product.setEnrichedDescription((String) aiResponse.get("enrichedDescription"));
        }
        if (aiResponse.containsKey("bulletPoints")) {
            try {
                product.setBulletPoints(objectMapper.writeValueAsString(aiResponse.get("bulletPoints")));
            } catch (Exception e) {
                log.warn("Error serializing bullet points");
            }
        }
        if (aiResponse.containsKey("seoTitle")) {
            product.setSeoTitle((String) aiResponse.get("seoTitle"));
        }
        if (aiResponse.containsKey("seoDescription")) {
            product.setSeoDescription((String) aiResponse.get("seoDescription"));
        }
        if (aiResponse.containsKey("seoKeywords")) {
            product.setSeoKeywords((String) aiResponse.get("seoKeywords"));
        }
    }

    private BigDecimal estimateCost(EnrichmentConfig config, String prompt, String response) {
        // Rough token estimation: ~4 chars per token
        int inputTokens = prompt.length() / 4;
        int outputTokens = response.length() / 4;

        String provider = config.getProvider();
        if ("OPENAI".equalsIgnoreCase(provider)) {
            // GPT-4o-mini: $0.15/1M input, $0.60/1M output
            return BigDecimal.valueOf(inputTokens * 0.00000015 + outputTokens * 0.0000006);
        } else if ("CLAUDE".equalsIgnoreCase(provider)) {
            // Haiku: $1.00/1M input, $5.00/1M output
            return BigDecimal.valueOf(inputTokens * 0.000001 + outputTokens * 0.000005);
        }
        return BigDecimal.ZERO;
    }
}
