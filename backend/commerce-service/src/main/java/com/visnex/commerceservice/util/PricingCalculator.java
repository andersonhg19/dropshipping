package com.visnex.commerceservice.util;

import com.visnex.commerceservice.entity.PricingConfig;
import com.visnex.commerceservice.entity.Product;
import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
public class PricingCalculator {

    public static Map<String, BigDecimal> calculateRealCost(Product product, PricingConfig config) {
        BigDecimal basePrice = product.getBasePrice() != null ? product.getBasePrice() : BigDecimal.ZERO;
        BigDecimal shipping = config.getShippingCostDefault() != null ? config.getShippingCostDefault() : BigDecimal.ZERO;
        BigDecimal customsRate = config.getCustomsRate() != null ? config.getCustomsRate() : BigDecimal.ZERO;
        BigDecimal ivaRate = config.getIvaRate() != null ? config.getIvaRate() : BigDecimal.ZERO;
        BigDecimal ivaThreshold = config.getIvaThresholdUsd() != null ? config.getIvaThresholdUsd() : new BigDecimal("50");
        BigDecimal gatewayFee = config.getGatewayFeePercent() != null ? config.getGatewayFeePercent() : BigDecimal.ZERO;
        BigDecimal packaging = config.getPackagingCost() != null ? config.getPackagingCost() : BigDecimal.ZERO;
        BigDecimal exchangeRate = config.getExchangeRate() != null ? config.getExchangeRate() : new BigDecimal("4200");
        BigDecimal marginPercent = config.getDefaultMargin() != null ? config.getDefaultMargin() : new BigDecimal("40");

        BigDecimal customs = basePrice.multiply(customsRate).divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
        BigDecimal subtotal = basePrice.add(shipping).add(customs).add(packaging);
        BigDecimal iva = subtotal.compareTo(ivaThreshold) > 0 ? subtotal.multiply(ivaRate).divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        BigDecimal gateway = subtotal.add(iva).multiply(gatewayFee).divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
        BigDecimal totalCost = subtotal.add(iva).add(gateway);
        BigDecimal marginMultiplier = BigDecimal.ONE.subtract(marginPercent.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
        BigDecimal sellingPriceUsd = marginMultiplier.compareTo(BigDecimal.ZERO) > 0 ? totalCost.divide(marginMultiplier, 2, RoundingMode.HALF_UP) : totalCost;
        BigDecimal profit = sellingPriceUsd.subtract(totalCost);
        BigDecimal sellingPriceCop = sellingPriceUsd.multiply(exchangeRate).setScale(0, RoundingMode.HALF_UP);

        Map<String, BigDecimal> result = new LinkedHashMap<>();
        result.put("basePrice", basePrice);
        result.put("shipping", shipping);
        result.put("customs", customs);
        result.put("iva", iva);
        result.put("gatewayFee", gateway);
        result.put("packaging", packaging);
        result.put("totalCostUsd", totalCost);
        result.put("sellingPriceUsd", sellingPriceUsd);
        result.put("sellingPriceCop", sellingPriceCop);
        result.put("profitUsd", profit);
        result.put("marginPercent", marginPercent);
        result.put("exchangeRate", exchangeRate);
        return result;
    }

    public static void applyPricing(Product product, PricingConfig config) {
        Map<String, BigDecimal> calc = calculateRealCost(product, config);
        product.setCostPrice(calc.get("totalCostUsd"));
        product.setSellingPrice(calc.get("sellingPriceUsd"));
        product.setMargin(calc.get("marginPercent"));
    }
}
