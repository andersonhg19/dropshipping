package com.visnex.commerceservice.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.visnex.commerceservice.domain.OrderStatus;
import com.visnex.commerceservice.entity.SalesOrder;
import com.visnex.commerceservice.entity.SalesOrderItem;
import com.visnex.commerceservice.repository.SalesOrderRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Optional;

/**
 * Recibe los pedidos de WooCommerce.
 *
 * Esta es la pieza que faltaba para cerrar el circuito. Hasta ahora VISNEX
 * publicaba productos en la tienda pero la tienda nunca le contaba nada de
 * vuelta: cuando un cliente compraba, no pasaba absolutamente nada.
 *
 * Configuracion en WooCommerce:
 *   Ajustes > Avanzado > Webhooks > Anadir webhook
 *   Tema:    Pedido creado  (y otro para Pedido actualizado)
 *   URL:     https://tu-saas/vn-api/v2/webhook/woocommerce/order
 *   Secreto: el mismo valor que woocommerce.webhook-secret
 */
@Slf4j
@RestController
@RequestMapping("/v2/webhook/woocommerce")
@RequiredArgsConstructor
@Tag(name = "Webhooks", description = "Entrada de eventos desde WooCommerce")
public class WooCommerceWebhookController {

    private final SalesOrderRepository orderRepository;
    private final ObjectMapper objectMapper;

    @Value("${woocommerce.webhook-secret:}")
    private String webhookSecret;

    @Value("${woocommerce.default-company-id:1}")
    private Long defaultCompanyId;

    @PostMapping("/order")
    @Operation(summary = "Recibe pedidos creados o actualizados en WooCommerce")
    @Transactional
    public ResponseEntity<String> onOrder(
            @RequestBody String payload,
            @RequestHeader(value = "X-WC-Webhook-Signature", required = false) String signature,
            @RequestHeader(value = "X-WC-Webhook-Topic", required = false) String topic) {

        // Sin verificar la firma, cualquiera que conozca la URL puede inyectar
        // pedidos falsos y hacer que se despache mercancia gratis.
        if (!isSignatureValid(payload, signature)) {
            log.warn("Webhook de WooCommerce con firma invalida. Topic: {}", topic);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("invalid signature");
        }

        try {
            JsonNode json = objectMapper.readTree(payload);
            String externalId = json.path("id").asText(null);

            if (externalId == null || externalId.isBlank()) {
                return ResponseEntity.badRequest().body("missing order id");
            }

            Long channelId = json.path("_visnex_channel_id").asLong(0L);

            // Idempotencia: WooCommerce reintenta las entregas fallidas, asi que
            // el mismo pedido puede llegar varias veces. Sin esto se duplicarian
            // los pedidos y se despacharia dos veces.
            Optional<SalesOrder> existing = orderRepository
                    .findFirstByExternalOrderIdAndIdChannelAndActive(externalId, channelId, true);

            if (existing.isPresent()) {
                log.debug("Pedido {} ya registrado, se ignora el reintento", externalId);
                return ResponseEntity.ok("already processed");
            }

            SalesOrder order = buildOrder(json, externalId, channelId);
            orderRepository.save(order);

            log.info("Pedido {} recibido de WooCommerce ({} {})",
                    externalId, order.getTotal(), order.getCurrency());

            return ResponseEntity.ok("ok");

        } catch (Exception e) {
            log.error("Error procesando webhook de WooCommerce: {}", e.getMessage(), e);
            // 500 a proposito: WooCommerce reintentara, y la idempotencia de
            // arriba hace que reintentar sea seguro.
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("error");
        }
    }

    /* =====================================================================
       Mapeo del payload
       ================================================================== */

    private SalesOrder buildOrder(JsonNode json, String externalId, Long channelId) {
        JsonNode billing = json.path("billing");
        JsonNode shipping = json.path("shipping");

        String paymentMethod = json.path("payment_method").asText("");
        boolean isCod = paymentMethod.contains("cod");

        SalesOrder order = SalesOrder.builder()
                .companyId(defaultCompanyId)
                .externalOrderId(externalId)
                .idChannel(channelId)
                .source("TIENDA")
                .status(OrderStatus.NUEVA)
                .customerName(join(billing.path("first_name").asText(""), billing.path("last_name").asText("")))
                .customerPhone(billing.path("phone").asText(null))
                .customerEmail(emptyToNull(billing.path("email").asText("")))
                .shippingAddress(firstNonBlank(
                        shipping.path("address_1").asText(""),
                        billing.path("address_1").asText("")))
                .shippingCity(firstNonBlank(
                        shipping.path("city").asText(""),
                        billing.path("city").asText("")))
                .shippingState(firstNonBlank(
                        shipping.path("state").asText(""),
                        billing.path("state").asText("")))
                .shippingNotes(emptyToNull(json.path("customer_note").asText("")))
                .subtotal(decimal(json.path("total").asText("0")).subtract(decimal(json.path("shipping_total").asText("0"))))
                .shippingCost(decimal(json.path("shipping_total").asText("0")))
                .total(decimal(json.path("total").asText("0")))
                .currency(json.path("currency").asText("COP"))
                .paymentMethod(isCod ? "COD" : "ONLINE")
                .active(true)
                .build();

        // Atribucion de pauta: WooCommerce la guarda en meta_data.
        for (JsonNode meta : json.path("meta_data")) {
            String key = meta.path("key").asText("");
            String value = meta.path("value").asText("");
            switch (key) {
                case "_vn_utm_source" -> order.setUtmSource(value);
                case "_vn_utm_campaign" -> order.setUtmCampaign(value);
                case "_vn_utm_content" -> order.setUtmContent(value);
                case "_vn_source" -> order.setSource(value.toUpperCase());
                default -> { /* ignorado */ }
            }
        }

        for (JsonNode line : json.path("line_items")) {
            SalesOrderItem item = SalesOrderItem.builder()
                    .productName(line.path("name").asText("Producto"))
                    .supplierSku(emptyToNull(line.path("sku").asText("")))
                    .quantity(Math.max(1, line.path("quantity").asInt(1)))
                    .unitPrice(decimal(line.path("price").asText("0")))
                    .lineTotal(decimal(line.path("total").asText("0")))
                    .build();
            order.addItem(item);
        }

        return order;
    }

    /* =====================================================================
       Firma
       ================================================================== */

    /**
     * WooCommerce firma el cuerpo con HMAC-SHA256 y lo envia en base64.
     *
     * Si no hay secreto configurado se acepta todo, pero se avisa: sirve para
     * desarrollo local, y NO debe quedar asi en produccion.
     */
    boolean isSignatureValid(String payload, String signature) {
        if (webhookSecret == null || webhookSecret.isBlank()) {
            log.warn("woocommerce.webhook-secret sin configurar: se aceptan webhooks SIN verificar. "
                    + "No dejar asi en produccion.");
            return true;
        }
        if (signature == null || signature.isBlank()) {
            return false;
        }
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            String expected = Base64.getEncoder()
                    .encodeToString(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
            // Comparacion en tiempo constante: evita filtrar la firma correcta
            // midiendo cuanto tarda en fallar.
            return java.security.MessageDigest.isEqual(
                    expected.getBytes(StandardCharsets.UTF_8),
                    signature.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            log.error("No se pudo verificar la firma del webhook: {}", e.getMessage());
            return false;
        }
    }

    /* =====================================================================
       Utilidades
       ================================================================== */

    private static BigDecimal decimal(String value) {
        try {
            return new BigDecimal(value == null || value.isBlank() ? "0" : value);
        } catch (NumberFormatException e) {
            return BigDecimal.ZERO;
        }
    }

    private static String join(String a, String b) {
        return (a + " " + b).trim();
    }

    private static String emptyToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private static String firstNonBlank(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) {
                return v;
            }
        }
        return null;
    }
}
