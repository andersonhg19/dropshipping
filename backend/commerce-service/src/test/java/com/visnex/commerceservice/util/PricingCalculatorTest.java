package com.visnex.commerceservice.util;

import com.visnex.commerceservice.entity.PricingConfig;
import com.visnex.commerceservice.entity.Product;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests de la formula de precios.
 *
 * Esta clase decide el margen del negocio: si la formula se rompe, se vende a
 * perdida sin que nada avise. Por eso las aserciones son de VALOR EXACTO y no
 * de "mayor que cero" — una comprobacion de `> 0` pasa igual de verde con la
 * formula correcta que con una que cobre la mitad.
 *
 * Escenario base (config Colombia):
 *   flete $8.00 · arancel 7,5% · IVA 19% sobre umbral de $50 · pasarela 3,5%
 *   TRM 4200 · margen 40% SOBRE PRECIO DE VENTA (no sobre costo)
 */
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

    private Product product(String basePrice) {
        Product p = new Product();
        p.setBasePrice(basePrice == null ? null : new BigDecimal(basePrice));
        return p;
    }

    private static void assertValue(String expected, BigDecimal actual, String field) {
        assertEquals(0, new BigDecimal(expected).compareTo(actual),
                () -> field + " esperado " + expected + " pero fue " + actual);
    }

    // =========================================================================
    //  VALORES EXACTOS - el corazon del test
    // =========================================================================

    @Nested
    @DisplayName("Producto de $15 USD (por debajo del umbral de IVA)")
    class Producto15 {

        // customs   = 15.00 * 7,5%              = 1.1250
        // subtotal  = 15.00 + 8.00 + 1.1250     = 24.1250
        // iva       = 24.1250 <= 50 -> sin IVA  = 0
        // gateway   = 24.1250 * 3,5%            = 0.8444
        // totalCost = 24.1250 + 0.8444          = 24.9694
        // venta     = 24.9694 / (1 - 0,40)      = 41.62
        // COP       = 41.62 * 4200              = 174804

        @Test
        @DisplayName("desglosa cada componente del costo con el valor exacto")
        void desglosaCostos() {
            Map<String, BigDecimal> r = PricingCalculator.calculateRealCost(product("15.00"), buildConfig());

            assertValue("15.00", r.get("basePrice"), "basePrice");
            assertValue("8.00", r.get("shipping"), "shipping");
            assertValue("1.1250", r.get("customs"), "customs");
            assertValue("0", r.get("iva"), "iva");
            assertValue("0.8444", r.get("gatewayFee"), "gatewayFee");
            assertValue("24.9694", r.get("totalCostUsd"), "totalCostUsd");
        }

        @Test
        @DisplayName("calcula el precio de venta exacto en USD y en COP")
        void calculaPrecioVenta() {
            Map<String, BigDecimal> r = PricingCalculator.calculateRealCost(product("15.00"), buildConfig());

            assertValue("41.62", r.get("sellingPriceUsd"), "sellingPriceUsd");
            assertValue("174804", r.get("sellingPriceCop"), "sellingPriceCop");
            assertValue("16.6506", r.get("profitUsd"), "profitUsd");
        }
    }

    @Nested
    @DisplayName("Producto de $50 USD (por encima del umbral de IVA)")
    class Producto50 {

        // customs   = 50.00 * 7,5%                    = 3.7500
        // subtotal  = 50.00 + 8.00 + 3.7500           = 61.7500
        // iva       = 61.75 > 50 -> 61.7500 * 19%     = 11.7325
        // gateway   = (61.7500 + 11.7325) * 3,5%      = 2.5719
        // totalCost = 61.7500 + 11.7325 + 2.5719      = 76.0544
        // venta     = 76.0544 / 0,60                  = 126.76

        @Test
        @DisplayName("aplica el IVA del 19% y lo refleja en el precio final")
        void aplicaIva() {
            Map<String, BigDecimal> r = PricingCalculator.calculateRealCost(product("50.00"), buildConfig());

            assertValue("3.7500", r.get("customs"), "customs");
            assertValue("11.7325", r.get("iva"), "iva");
            assertValue("2.5719", r.get("gatewayFee"), "gatewayFee");
            assertValue("76.0544", r.get("totalCostUsd"), "totalCostUsd");
            assertValue("126.76", r.get("sellingPriceUsd"), "sellingPriceUsd");
            assertValue("532392", r.get("sellingPriceCop"), "sellingPriceCop");
        }
    }

    // =========================================================================
    //  PROPIEDADES DE LA FORMULA
    // =========================================================================

    @Test
    @DisplayName("El margen se calcula SOBRE EL PRECIO DE VENTA, no sobre el costo")
    void margenSobrePrecioDeVenta() {
        // Este es el error clasico: calcular costo * 1,40 en vez de
        // costo / (1 - 0,40). Con margen 40% la diferencia es 41.62 vs 34.96,
        // es decir un 16% menos de ingreso por venta.
        Map<String, BigDecimal> r = PricingCalculator.calculateRealCost(product("15.00"), buildConfig());

        BigDecimal venta = r.get("sellingPriceUsd");
        BigDecimal utilidad = r.get("profitUsd");

        BigDecimal margenReal = utilidad.divide(venta, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));

        // Tolerancia de 0,05 puntos: el precio de venta se redondea a 2 decimales
        // (41.62 en vez de 41.6157), asi que el margen efectivo es 40,01%.
        // Un margen sobre COSTO daria 28,57% y este assert lo cazaria.
        BigDecimal desviacion = margenReal.subtract(new BigDecimal("40")).abs();
        assertTrue(desviacion.compareTo(new BigDecimal("0.05")) < 0,
                "La utilidad debe ser el 40% del PRECIO DE VENTA, no del costo. Fue " + margenReal + "%");

        BigDecimal costoPorMargenIncorrecto = r.get("totalCostUsd").multiply(new BigDecimal("1.40"));
        assertNotEquals(0, costoPorMargenIncorrecto.setScale(2, RoundingMode.HALF_UP).compareTo(venta),
                "El precio no debe ser costo * 1,40 (eso seria margen sobre costo)");
    }

    @Test
    @DisplayName("El umbral de IVA se evalua sobre el subtotal, no sobre el precio base")
    void umbralIvaSobreSubtotal() {
        // Base 45 esta por debajo de 50, pero el subtotal con flete y arancel
        // (45 + 8 + 3.375 = 56.375) lo supera: SI debe llevar IVA.
        Map<String, BigDecimal> r = PricingCalculator.calculateRealCost(product("45.00"), buildConfig());

        assertTrue(r.get("iva").compareTo(BigDecimal.ZERO) > 0,
                "El subtotal (56.375) supera el umbral de 50, deberia cobrar IVA");
        assertValue("10.7113", r.get("iva"), "iva");
    }

    @Test
    @DisplayName("Exactamente en el umbral NO cobra IVA (la condicion es estrictamente mayor)")
    void enElUmbralNoCobraIva() {
        PricingConfig config = buildConfig();
        config.setShippingCostDefault(BigDecimal.ZERO);
        config.setCustomsRate(BigDecimal.ZERO);

        Map<String, BigDecimal> r = PricingCalculator.calculateRealCost(product("50.00"), config);

        assertValue("0", r.get("iva"), "iva");
    }

    @Test
    @DisplayName("La conversion a COP usa la TRM configurada")
    void conversionCop() {
        PricingConfig config = buildConfig();
        config.setExchangeRate(new BigDecimal("3900"));

        Map<String, BigDecimal> r = PricingCalculator.calculateRealCost(product("15.00"), config);

        // 41.62 * 3900 = 162318
        assertValue("162318", r.get("sellingPriceCop"), "sellingPriceCop");
    }

    @Test
    @DisplayName("El costo de empaque entra en el subtotal y sube el precio final")
    void empaqueSumaAlCosto() {
        PricingConfig config = buildConfig();
        config.setPackagingCost(new BigDecimal("2.00"));

        Map<String, BigDecimal> conEmpaque = PricingCalculator.calculateRealCost(product("15.00"), config);
        Map<String, BigDecimal> sinEmpaque = PricingCalculator.calculateRealCost(product("15.00"), buildConfig());

        assertValue("2.00", conEmpaque.get("packaging"), "packaging");
        assertTrue(conEmpaque.get("totalCostUsd").compareTo(sinEmpaque.get("totalCostUsd")) > 0,
                "El empaque debe aumentar el costo total");
    }

    // =========================================================================
    //  CASOS BORDE
    // =========================================================================

    @Test
    @DisplayName("Margen del 100% no puede dividir por cero: devuelve el costo")
    void margenCienPorCiento() {
        PricingConfig config = buildConfig();
        config.setDefaultMargin(new BigDecimal("100"));

        Map<String, BigDecimal> r = PricingCalculator.calculateRealCost(product("15.00"), config);

        assertEquals(0, r.get("sellingPriceUsd").compareTo(r.get("totalCostUsd")),
                "Con margen 100% el multiplicador es 0; debe devolver el costo, no reventar");
    }

    @Test
    @DisplayName("Precio base nulo se trata como cero, sin excepcion")
    void precioBaseNulo() {
        Map<String, BigDecimal> r = PricingCalculator.calculateRealCost(product(null), buildConfig());

        assertNotNull(r);
        assertValue("0", r.get("basePrice"), "basePrice");
        // Sigue habiendo costo: flete + pasarela.
        assertTrue(r.get("totalCostUsd").compareTo(BigDecimal.ZERO) > 0);
    }

    @Test
    @DisplayName("Config vacia usa los valores por defecto documentados")
    void configVacia() {
        PricingConfig vacia = new PricingConfig();

        Map<String, BigDecimal> r = PricingCalculator.calculateRealCost(product("10.00"), vacia);

        assertValue("4200", r.get("exchangeRate"), "exchangeRate por defecto");
        assertValue("40", r.get("marginPercent"), "margen por defecto");
        assertValue("0", r.get("iva"), "sin IVA configurado no debe cobrarse");
        // 10 / 0,60 = 16.67
        assertValue("16.67", r.get("sellingPriceUsd"), "sellingPriceUsd");
    }

    @Test
    @DisplayName("applyPricing escribe costo, precio y margen en el producto")
    void applyPricingEscribeEnElProducto() {
        Product p = product("15.00");

        PricingCalculator.applyPricing(p, buildConfig());

        assertValue("24.9694", p.getCostPrice(), "costPrice");
        assertValue("41.62", p.getSellingPrice(), "sellingPrice");
        assertValue("40", p.getMargin(), "margin");
    }
}
