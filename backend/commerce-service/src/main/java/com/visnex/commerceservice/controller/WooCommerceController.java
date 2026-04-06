package com.visnex.commerceservice.controller;
import com.visnex.commerceservice.dto.output.ResultDTO;
import com.visnex.commerceservice.service.implementation.WooCommercePublishService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
@RestController @RequestMapping("/v2/woocommerce") @RequiredArgsConstructor
@Tag(name = "WooCommerce", description = "Publish products to WooCommerce")
public class WooCommerceController {
    private final WooCommercePublishService wooCommerceService;
    @PostMapping("/publish")
    @Operation(summary = "Publish single product to WooCommerce")
    public ResultDTO publish(@RequestBody Map<String, Object> body, @RequestHeader(name = "lng", defaultValue = "es") String lng) {
        Long productId = Long.valueOf(body.get("productId").toString());
        Long channelId = Long.valueOf(body.get("channelId").toString());
        return wooCommerceService.publishProduct(productId, channelId, lng);
    }
    @PostMapping("/publish-batch")
    @Operation(summary = "Publish multiple products")
    public ResultDTO publishBatch(@RequestBody Map<String, Object> body, @RequestHeader(name = "lng", defaultValue = "es") String lng) {
        List<Long> ids = ((List<?>) body.get("productIds")).stream().map(i -> Long.valueOf(i.toString())).toList();
        Long channelId = Long.valueOf(body.get("channelId").toString());
        int ok = 0, fail = 0;
        for (Long id : ids) { if (wooCommerceService.publishProduct(id, channelId, lng).isCorrect()) ok++; else fail++; }
        return new ResultDTO(Map.of("success", ok, "failed", fail, "total", ids.size()));
    }
    @PostMapping("/test-connection")
    @Operation(summary = "Test WooCommerce connection")
    public ResultDTO testConnection(@RequestBody Map<String, Object> body, @RequestHeader(name = "lng", defaultValue = "es") String lng) {
        Long channelId = Long.valueOf(body.get("channelId").toString());
        return wooCommerceService.testConnection(channelId, lng);
    }
}
