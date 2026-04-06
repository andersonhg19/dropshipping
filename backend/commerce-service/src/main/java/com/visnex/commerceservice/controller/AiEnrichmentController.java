package com.visnex.commerceservice.controller;

import com.visnex.commerceservice.dto.output.ResultDTO;
import com.visnex.commerceservice.service.implementation.AiEnrichmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v2/ai-enrichment")
@RequiredArgsConstructor
@Tag(name = "AI Enrichment", description = "Enrich products using AI (OpenAI/Claude)")
public class AiEnrichmentController {

    private final AiEnrichmentService aiEnrichmentService;

    @PostMapping("/enrich")
    @Operation(summary = "Enrich a single product with AI-generated content")
    public ResultDTO enrichProduct(
            @RequestBody Map<String, Object> body,
            @RequestHeader(name = "lng", defaultValue = "es") String language) {

        Long productId = body.get("productId") != null ? Long.valueOf(body.get("productId").toString()) : null;
        Long companyId = body.get("idCompany") != null ? Long.valueOf(body.get("idCompany").toString()) : null;

        if (productId == null || companyId == null) {
            return new ResultDTO(false, "productId and idCompany are required", 120);
        }

        return aiEnrichmentService.enrichProduct(productId, companyId, language);
    }

    @PostMapping("/enrich-batch")
    @Operation(summary = "Enrich multiple products with AI-generated content")
    public ResultDTO enrichBatch(
            @RequestBody Map<String, Object> body,
            @RequestHeader(name = "lng", defaultValue = "es") String language) {

        List<Long> productIds = ((List<?>) body.get("productIds")).stream()
                .map(id -> Long.valueOf(id.toString()))
                .toList();
        Long companyId = body.get("idCompany") != null ? Long.valueOf(body.get("idCompany").toString()) : null;

        if (productIds.isEmpty() || companyId == null) {
            return new ResultDTO(false, "productIds and idCompany are required", 120);
        }

        return aiEnrichmentService.enrichBatch(productIds, companyId, language);
    }
}
