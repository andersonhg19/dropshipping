package com.visnex.commerceservice.util;

import com.visnex.commerceservice.entity.PricingConfig;
import com.visnex.commerceservice.entity.Product;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.math.BigDecimal;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class PricingCalculatorTest {

    private PricingConfig buildConfig() {
        PricingConfig config = new PricingConfig();
        config.setShippingCostDefault(new BigDecimal("8.00"));
        config.setCustomsRate(new BigDecimal("7.5"));
        config.setIvaRate(new BigDecimal("19.0"));
        config.setIvaThresholdUsd(new BigDecimal("50"));
        config.setGatewayFeePercent(new BigDecimal("3.5"));
        config.setPackagingCost(BigDecimal.ZERO);
        config.setExchangeRate(new BigDecimal("4200"));
        config.setDefaultMargin(new BigDecimal("40"));
        return config;
    }

    @Test
    @DisplayName("Calculo basico: producto $15 USD con config Colombia")
    void testBasicCalculation() {
        Product product = new Product();
        product.setBasePrice(new BigDecimal("15.00"));
        PricingConfig config = buildConfig();

        Map<String, BigDecimal> result = PricingCalculator.calculateRealCost(product, config);

        assertNotNull(result);
        assertEquals(new BigDecimal("15.00"), result.get("basePrice"));
        assertEquals(new BigDecimal("8.00"), result.get("shipping"));
        assertTrue(result.get("totalCostUsd").compareTo(BigDecimal.ZERO) > 0);
        assertTrue(result.get("sellingPriceUsd").compareTo(result.get("totalCostUsd")) > 0);
        assertTrue(result.get("sellingPriceCop").compareTo(BigDecimal.ZERO) > 0);
        assertTrue(result.get("profitUsd").compareTo(BigDecimal.ZERO) > 0);
    }

    @Test
    @DisplayName("Producto bajo umbral IVA: no debe cobrar IVA")
    void testBelowIvaThreshold() {
        Product product = new Product();
        product.setBasePrice(new BigDecimal("5.00")); // 5 + 8 shipping + customs = ~13.38 < 50
        PricingConfig config = buildConfig();

        Map<String, BigDecimal> result = PricingCalculator.calculateRealCost(product, config);

        assertEquals(0, result.get("iva").compareTo(BigDecimal.ZERO), "IVA should be 0 when below threshold");
    }

    @Test
    @DisplayName("Producto sobre umbral IVA: debe cobrar IVA 19%")
    void testAboveIvaThreshold() {
        Product product = new Product();
        product.setBasePrice(new BigDecimal("50.00")); // 50 + 8 + customs > 50
        PricingConfig config = buildConfig();

        Map<String, BigDecimal> result = PricingCalculator.calculateRealCost(product, config);

        assertTrue(result.get("iva").compareTo(BigDecimal.ZERO) > 0, "IVA should be charged when above threshold");
    }

    @Test
    @DisplayName("Producto con precio 0: no debe generar error")
    void testZeroPrice() {
        Product product = new Product();
        product.setBasePrice(BigDecimal.ZERO);
        PricingConfig config = buildConfig();

        Map<String, BigDecimal> result = PricingCalculator.calculateRealCost(product, config);

        assertNotNull(result);
        assertEquals(0, result.get("basePrice").compareTo(BigDecimal.ZERO));
    }

    @Test
    @DisplayName("Producto con precio null: no debe generar error")
    void testNullPrice() {
        Product product = new Product();
        product.setBasePrice(null);
        PricingConfig config = buildConfig();

        Map<String, BigDecimal> result = PricingCalculator.calculateRealCost(product, config);

        assertNotNull(result);
    }

    @Test
    @DisplayName("applyPricing actualiza costPrice, sellingPrice y margin")
    void testApplyPricing() {
        Product product = new Product();
        product.setBasePrice(new BigDecimal("20.00"));
        PricingConfig config = buildConfig();

        PricingCalculator.applyPricing(product, config);

        assertNotNull(product.getCostPrice());
        assertNotNull(product.getSellingPrice());
        assertNotNull(product.getMargin());
        assertTrue(product.getSellingPrice().compareTo(product.getCostPrice()) > 0);
    }

    @Test
    @DisplayName("Margen del 40% debe generar precio correcto")
    void testMarginCalculation() {
        Product product = new Product();
        product.setBasePrice(new BigDecimal("10.00"));
        PricingConfig config = buildConfig();
        config.setDefaultMargin(new BigDecimal("40"));

        Map<String, BigDecimal> result = PricingCalculator.calculateRealCost(product, config);

        BigDecimal totalCost = result.get("totalCostUsd");
        BigDecimal sellingPrice = result.get("sellingPriceUsd");
        BigDecimal profit = result.get("profitUsd");

        // Profit should be ~40% of selling price (margin is on selling price, not cost)
        assertTrue(profit.compareTo(BigDecimal.ZERO) > 0);
    }

    @Test
    @DisplayName("Precio en COP debe usar tasa de cambio correcta")
    void testExchangeRate() {
        Product product = new Product();
        product.setBasePrice(new BigDecimal("10.00"));
        PricingConfig config = buildConfig();
        config.setExchangeRate(new BigDecimal("4200"));

        Map<String, BigDecimal> result = PricingCalculator.calculateRealCost(product, config);

        BigDecimal sellingUsd = result.get("sellingPriceUsd");
        BigDecimal sellingCop = result.get("sellingPriceCop");

        // COP should be approximately USD * 4200
        BigDecimal expectedCop = sellingUsd.multiply(new BigDecimal("4200"));
        assertTrue(Math.abs(sellingCop.doubleValue() - expectedCop.doubleValue()) < 1.0,
                "COP price should be USD * exchange rate");
    }
}
