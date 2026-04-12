package com.visnex.acquisitionservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.visnex.acquisitionservice.dto.output.ResultDTO;
import com.visnex.acquisitionservice.entity.SourceProduct;
import com.visnex.acquisitionservice.repository.SourceProductRepository;
import com.visnex.acquisitionservice.security.ConnectInternalApi;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@RestController
@RequestMapping("/v2/send-to-commerce")
@RequiredArgsConstructor
@Tag(name = "Send to Commerce", description = "Transfer products from acquisition to commerce service")
public class SendToCommerceController {

    private final SourceProductRepository sourceProductRepository;
    private final ConnectInternalApi connectInternalApi;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${commerceMicroserviceUrl:http://gateway-service:8841/COMMERCE-SERVICE/vn-api/v2/}")
    private String commerceUrl;

    @PostMapping("/single")
    @Operation(summary = "Send a single source product to commerce service")
    public ResultDTO sendSingle(@RequestBody Map<String, Object> body, @RequestHeader(name = "lng", defaultValue = "es") String lng, @RequestHeader("Authorization") String auth) {
        Long sourceProductId = Long.valueOf(body.get("sourceProductId").toString());
        return transferProduct(sourceProductId, auth, lng);
    }

    @PostMapping("/batch")
    @Operation(summary = "Send multiple source products to commerce service")
    public ResultDTO sendBatch(@RequestBody Map<String, Object> body, @RequestHeader(name = "lng", defaultValue = "es") String lng, @RequestHeader("Authorization") String auth) {
        List<Long> ids = ((List<?>) body.get("sourceProductIds")).stream().map(i -> Long.valueOf(i.toString())).toList();
        int ok = 0, fail = 0;
        for (Long id : ids) {
            ResultDTO r = transferProduct(id, auth, lng);
            if (r.isCorrect()) ok++; else fail++;
        }
        return new ResultDTO(Map.of("success", ok, "failed", fail, "total", ids.size()));
    }

    private ResultDTO transferProduct(Long sourceProductId, String authHeader, String lng) {
        try {
            Optional<SourceProduct> opt = sourceProductRepository.findById(sourceProductId);
            if (opt.isEmpty()) return new ResultDTO(false, "Source product not found", 102);

            SourceProduct sp = opt.get();
            if (Boolean.TRUE.equals(sp.getImported())) return new ResultDTO(false, "Product already sent to commerce", 101);

            Map<String, Object> productDto = new LinkedHashMap<>();
            productDto.put("idCompany", sp.getCompanyId());
            productDto.put("idSubsidiary", sp.getSubsidiaryId());
            productDto.put("idModifiedBy", sp.getIdModifiedBy());
            productDto.put("title", sp.getTitle());
            productDto.put("description", sp.getDescription());
            productDto.put("basePrice", sp.getPrice());
            productDto.put("currency", sp.getCurrency() != null ? sp.getCurrency() : "USD");
            productDto.put("status", "DRAFT");
            productDto.put("sourceProvider", sp.getSourceProvider());
            productDto.put("sourceId", sp.getSourceId());
            productDto.put("sourceUrl", sp.getSourceUrl());
            productDto.put("tags", sp.getTags());
            productDto.put("active", true);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", authHeader);
            headers.set("lng", lng);

            String url = commerceUrl + "product/save";
            HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(productDto), headers);
            ResponseEntity<String> resp = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            if (resp.getStatusCode().is2xxSuccessful()) {
                sp.setImported(true);
                sourceProductRepository.save(sp);
                return new ResultDTO(Map.of("sourceProductId", sourceProductId, "status", "SENT", "commerceResponse", objectMapper.readTree(resp.getBody())));
            } else {
                return new ResultDTO(false, "Commerce service error: " + resp.getStatusCode(), 103);
            }
        } catch (Exception e) {
            log.error("Error transferring product {}: {}", sourceProductId, e.getMessage());
            return new ResultDTO(false, "Transfer error: " + e.getMessage(), 103);
        }
    }
}
