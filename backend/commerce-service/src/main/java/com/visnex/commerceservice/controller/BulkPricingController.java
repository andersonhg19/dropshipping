package com.visnex.commerceservice.controller;

import com.visnex.commerceservice.dto.output.ResultDTO;
import com.visnex.commerceservice.entity.PricingConfig;
import com.visnex.commerceservice.entity.Product;
import com.visnex.commerceservice.repository.PricingConfigRepository;
import com.visnex.commerceservice.repository.ProductRepository;
import com.visnex.commerceservice.util.PricingCalculator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/v2/bulk-pricing")
@RequiredArgsConstructor
@Tag(name = "Bulk Pricing", description = "Apply pricing rules to multiple products")
public class BulkPricingController {

    private final ProductRepository productRepository;
    private final PricingConfigRepository pricingConfigRepository;

    @PostMapping("/apply-config")
    @Operation(summary = "Apply PricingConfig auto-calculation to all products without manual price")
    public ResultDTO applyConfig(@RequestBody Map<String, Object> body, @RequestHeader(name = "lng", defaultValue = "es") String lng) {
        Long companyId = Long.valueOf(body.get("idCompany").toString());
        Optional<PricingConfig> optConfig = pricingConfigRepository.findAll().stream()
                .filter(c -> companyId.equals(c.getCompanyId()) && Boolean.TRUE.equals(c.getActive()))
                .findFirst();
        if (optConfig.isEmpty()) return new ResultDTO(false, "No PricingConfig found", 102);

        PricingConfig config = optConfig.get();
        List<Product> products = productRepository.findAll().stream()
                .filter(p -> companyId.equals(p.getCompanyId()) && Boolean.TRUE.equals(p.getActive()) && !Boolean.TRUE.equals(p.getManualPrice()) && p.getBasePrice() != null)
                .toList();

        int updated = 0;
        for (Product p : products) {
            PricingCalculator.applyPricing(p, config);
            productRepository.save(p);
            updated++;
        }
        return new ResultDTO(Map.of("updated", updated, "total", products.size()));
    }

    @PostMapping("/apply-percentage")
    @Operation(summary = "Apply a percentage markup over base price to filtered products")
    public ResultDTO applyPercentage(@RequestBody Map<String, Object> body, @RequestHeader(name = "lng", defaultValue = "es") String lng) {
        Long companyId = Long.valueOf(body.get("idCompany").toString());
        BigDecimal percentage = new BigDecimal(body.get("percentage").toString());
        String statusFilter = body.get("status") != null ? body.get("status").toString() : null;
        Long categoryFilter = body.get("idCategory") != null ? Long.valueOf(body.get("idCategory").toString()) : null;

        List<Product> products = productRepository.findAll().stream()
                .filter(p -> companyId.equals(p.getCompanyId()) && Boolean.TRUE.equals(p.getActive()) && p.getBasePrice() != null)
                .filter(p -> statusFilter == null || statusFilter.equals(p.getStatus()))
                .filter(p -> categoryFilter == null || categoryFilter.equals(p.getIdCategory()))
                .toList();

        int updated = 0;
        for (Product p : products) {
            BigDecimal markup = p.getBasePrice().multiply(percentage).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            p.setSellingPrice(p.getBasePrice().add(markup));
            p.setMargin(percentage);
            p.setManualPrice(false);
            productRepository.save(p);
            updated++;
        }
        return new ResultDTO(Map.of("updated", updated, "percentage", percentage, "filter", statusFilter != null ? statusFilter : "ALL"));
    }

    @PostMapping("/set-manual")
    @Operation(summary = "Set manual price on specific products")
    public ResultDTO setManualPrice(@RequestBody Map<String, Object> body, @RequestHeader(name = "lng", defaultValue = "es") String lng) {
        List<Long> productIds = ((List<?>) body.get("productIds")).stream().map(i -> Long.valueOf(i.toString())).toList();
        BigDecimal price = new BigDecimal(body.get("sellingPrice").toString());

        int updated = 0;
        for (Long id : productIds) {
            Optional<Product> opt = productRepository.findById(id);
            if (opt.isPresent()) {
                Product p = opt.get();
                p.setSellingPrice(price);
                p.setManualPrice(true);
                if (p.getBasePrice() != null && p.getBasePrice().compareTo(BigDecimal.ZERO) > 0) {
                    p.setMargin(price.subtract(p.getBasePrice()).divide(price, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")));
                }
                productRepository.save(p);
                updated++;
            }
        }
        return new ResultDTO(Map.of("updated", updated, "price", price, "manualPrice", true));
    }
}
