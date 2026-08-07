package com.visnex.commerceservice.supplier;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.visnex.commerceservice.entity.SalesOrder;
import com.visnex.commerceservice.entity.SalesOrderItem;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.*;

/**
 * Adaptador de Dropi.
 *
 * Dropi es el lider del dropshipping contraentrega en Colombia: mas de 50.000
 * emprendedores, 160.000 productos locales, entrega en 24-72 horas y pago el
 * mismo dia en que se entrega. Es la infraestructura del modelo de negocio.
 *
 * AVISO IMPORTANTE SOBRE ESTE ARCHIVO
 * -----------------------------------
 * La API de Dropi NO tiene documentacion publica completa: se obtiene al abrir
 * cuenta. Los endpoints y los nombres de campo de aqui estan construidos a
 * partir del patron que sigue su integracion (autenticacion por header
 * `dropi-integration-key`, endpoints REST bajo /api), pero DEBEN verificarse
 * contra la documentacion real antes de operar con dinero.
 *
 * Lo que si esta cerrado y no depende de Dropi es la FORMA: el contrato
 * SupplierAdapter, el mapeo del pedido, el manejo de errores y los tests. Si
 * un endpoint no coincide, se cambia una constante y una ruta de JSON, no la
 * arquitectura.
 *
 * Mientras `dropi.api-key` este vacio, isConfigured() devuelve false y el
 * router de pedidos no intenta despachar por aqui.
 */
@Slf4j
@Component
public class DropiAdapter implements SupplierAdapter {

    public static final String CODE = "DROPI";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private final String baseUrl;
    private final String apiKey;

    public DropiAdapter(RestTemplate restTemplate,
                        ObjectMapper objectMapper,
                        @Value("${dropi.base-url:https://api.dropi.co}") String baseUrl,
                        @Value("${dropi.api-key:}") String apiKey) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    @Override
    public String getCode() {
        return CODE;
    }

    @Override
    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    private HttpHeaders headers() {
        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.APPLICATION_JSON);
        h.set("dropi-integration-key", apiKey);
        return h;
    }

    private void requireConfigured() throws SupplierException {
        if (!isConfigured()) {
            throw new SupplierException("Dropi no esta configurado: falta dropi.api-key");
        }
    }

    /* =====================================================================
       Crear pedido
       ================================================================== */

    @Override
    public String createOrder(SalesOrder order) throws SupplierException {
        requireConfigured();

        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new SupplierException("El pedido no tiene lineas");
        }

        // Sin telefono el proveedor no puede coordinar la entrega y el pedido
        // se pierde. Se falla aqui, antes de gastar el flete.
        if (order.getCustomerPhone() == null || order.getCustomerPhone().isBlank()) {
            throw new SupplierException("El pedido no tiene telefono de contacto");
        }

        List<Map<String, Object>> products = new ArrayList<>();
        for (SalesOrderItem item : order.getItems()) {
            if (item.getSupplierSku() == null || item.getSupplierSku().isBlank()) {
                throw new SupplierException(
                        "La linea '" + item.getProductName() + "' no tiene SKU de proveedor");
            }
            products.add(Map.of(
                    "id", item.getSupplierSku(),
                    "quantity", item.getQuantity()
            ));
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("name", order.getCustomerName());
        body.put("phone", normalizePhone(order.getCustomerPhone()));
        body.put("dir", order.getShippingAddress());
        body.put("city", order.getShippingCity());
        body.put("state", order.getShippingState());
        body.put("notes", order.getShippingNotes());
        body.put("products", products);
        // El total con recaudo: en contraentrega es lo que el transportador
        // debe cobrar al cliente.
        body.put("total_order", order.getTotal());
        body.put("type", order.isCashOnDelivery() ? "CONTRAENTREGA" : "PAGADO");
        // Referencia cruzada para poder conciliar despues.
        body.put("reference", "VISNEX-" + order.getId());

        try {
            ResponseEntity<String> resp = restTemplate.exchange(
                    baseUrl + "/api/orders",
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers()),
                    String.class);

            if (!resp.getStatusCode().is2xxSuccessful()) {
                throw new SupplierException("Dropi respondio " + resp.getStatusCode());
            }

            JsonNode json = objectMapper.readTree(resp.getBody());
            String id = firstText(json, "id", "order_id", "data/id");

            if (id == null) {
                throw new SupplierException("Dropi no devolvio identificador de pedido: " + resp.getBody());
            }

            log.info("Pedido {} enviado a Dropi con id {}", order.getId(), id);
            return id;

        } catch (SupplierException e) {
            throw e;
        } catch (Exception e) {
            throw new SupplierException("Error creando pedido en Dropi: " + e.getMessage(), e);
        }
    }

    /* =====================================================================
       Seguimiento
       ================================================================== */

    @Override
    public Optional<TrackingInfo> getTracking(String supplierOrderId) throws SupplierException {
        requireConfigured();
        try {
            ResponseEntity<String> resp = restTemplate.exchange(
                    baseUrl + "/api/orders/" + supplierOrderId,
                    HttpMethod.GET,
                    new HttpEntity<>(headers()),
                    String.class);

            if (resp.getStatusCode() == HttpStatus.NOT_FOUND) {
                return Optional.empty();
            }
            if (!resp.getStatusCode().is2xxSuccessful()) {
                throw new SupplierException("Dropi respondio " + resp.getStatusCode());
            }

            JsonNode json = objectMapper.readTree(resp.getBody());
            String status = Optional.ofNullable(firstText(json, "status", "data/status")).orElse("");
            String guide = firstText(json, "guide", "tracking_number", "data/guide");
            String carrier = firstText(json, "carrier", "shipping_company", "data/carrier");
            String url = firstText(json, "tracking_url", "data/tracking_url");

            String upper = status.toUpperCase(Locale.ROOT);
            boolean delivered = upper.contains("ENTREGADO") || upper.contains("DELIVERED");
            boolean returned = upper.contains("DEVOLUCION") || upper.contains("DEVUELTO")
                    || upper.contains("RETURNED") || upper.contains("RECHAZADO");

            return Optional.of(new TrackingInfo(guide, carrier, status, url, delivered, returned));

        } catch (SupplierException e) {
            throw e;
        } catch (Exception e) {
            throw new SupplierException("Error consultando seguimiento en Dropi: " + e.getMessage(), e);
        }
    }

    /* =====================================================================
       Stock y flete
       ================================================================== */

    @Override
    public Optional<Integer> getStock(String supplierSku) throws SupplierException {
        requireConfigured();
        try {
            ResponseEntity<String> resp = restTemplate.exchange(
                    baseUrl + "/api/products/" + supplierSku,
                    HttpMethod.GET,
                    new HttpEntity<>(headers()),
                    String.class);

            if (!resp.getStatusCode().is2xxSuccessful()) {
                return Optional.empty();
            }

            JsonNode json = objectMapper.readTree(resp.getBody());
            String stock = firstText(json, "stock", "quantity", "data/stock");
            if (stock == null) {
                return Optional.empty();
            }
            return Optional.of((int) Double.parseDouble(stock));

        } catch (Exception e) {
            log.warn("No se pudo consultar stock de {} en Dropi: {}", supplierSku, e.getMessage());
            return Optional.empty();
        }
    }

    @Override
    public Optional<BigDecimal> quoteShipping(String supplierSku, String city, String state) throws SupplierException {
        requireConfigured();
        try {
            Map<String, Object> body = Map.of(
                    "product_id", supplierSku,
                    "city", city == null ? "" : city,
                    "state", state == null ? "" : state);

            ResponseEntity<String> resp = restTemplate.exchange(
                    baseUrl + "/api/shipping/quote",
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers()),
                    String.class);

            if (!resp.getStatusCode().is2xxSuccessful()) {
                return Optional.empty();
            }

            JsonNode json = objectMapper.readTree(resp.getBody());
            String cost = firstText(json, "shipping_cost", "cost", "value", "data/shipping_cost");
            return cost == null ? Optional.empty() : Optional.of(new BigDecimal(cost));

        } catch (Exception e) {
            log.warn("No se pudo cotizar flete en Dropi: {}", e.getMessage());
            return Optional.empty();
        }
    }

    @Override
    public boolean cancelOrder(String supplierOrderId) throws SupplierException {
        requireConfigured();
        try {
            ResponseEntity<String> resp = restTemplate.exchange(
                    baseUrl + "/api/orders/" + supplierOrderId + "/cancel",
                    HttpMethod.POST,
                    new HttpEntity<>(headers()),
                    String.class);
            return resp.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            throw new SupplierException("Error cancelando pedido en Dropi: " + e.getMessage(), e);
        }
    }

    /* =====================================================================
       Utilidades
       ================================================================== */

    /**
     * Busca el primer campo presente entre varios candidatos.
     *
     * Existe porque las APIs de proveedores cambian los nombres de campo entre
     * versiones y a veces envuelven la respuesta en `data`. Tolerarlo aqui
     * evita que un renombrado tumbe toda la integracion.
     */
    static String firstText(JsonNode node, String... paths) {
        for (String path : paths) {
            JsonNode current = node;
            for (String part : path.split("/")) {
                if (current == null) {
                    break;
                }
                current = current.get(part);
            }
            if (current != null && !current.isNull()) {
                String value = current.asText();
                if (!value.isBlank()) {
                    return value;
                }
            }
        }
        return null;
    }

    /** Deja el celular en 10 digitos, quitando el indicativo 57 si viene. */
    static String normalizePhone(String raw) {
        String digits = raw == null ? "" : raw.replaceAll("\\D", "");
        if (digits.length() == 12 && digits.startsWith("57")) {
            return digits.substring(2);
        }
        return digits;
    }
}
