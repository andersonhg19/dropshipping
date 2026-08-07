package com.visnex.commerceservice.supplier;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.visnex.commerceservice.entity.SalesOrder;
import com.visnex.commerceservice.entity.SalesOrderItem;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests del adaptador de Dropi contra respuestas simuladas.
 *
 * Se prueba contra mocks a proposito: la API real de Dropi exige credenciales
 * de una cuenta activa, y aun asi lo que hay que blindar es el comportamiento
 * ante respuestas raras. Un proveedor que devuelve el campo con otro nombre no
 * puede tumbar el despacho de toda la operacion.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class DropiAdapterTest {

    @Mock private RestTemplate restTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private DropiAdapter adapter;

    @BeforeEach
    void setUp() {
        adapter = new DropiAdapter(restTemplate, objectMapper, "https://api.dropi.co", "clave-de-prueba");
    }

    private SalesOrder validOrder() {
        SalesOrder order = SalesOrder.builder()
                .id(42L)
                .companyId(1L)
                .customerName("Maria Lopez")
                .customerPhone("3001234567")
                .shippingAddress("Calle 100 # 15-20")
                .shippingCity("Bogota")
                .shippingState("CO-DC")
                .total(new BigDecimal("199800"))
                .paymentMethod("COD")
                .build();

        order.addItem(SalesOrderItem.builder()
                .productName("Pantalon Paperbag")
                .supplierSku("DROPI-8891")
                .quantity(2)
                .unitPrice(new BigDecimal("99900"))
                .build());

        return order;
    }

    private void wcResponds(String json, HttpStatus status) {
        when(restTemplate.exchange(anyString(), any(HttpMethod.class), any(), eq(String.class)))
                .thenReturn(new ResponseEntity<>(json, status));
    }

    /* =====================================================================
       Configuracion
       ================================================================== */

    @Nested
    @DisplayName("Configuracion")
    class Configuracion {

        @Test
        @DisplayName("Sin clave, el adaptador se declara no configurado y no llama a nadie")
        void sinClaveNoOpera() {
            DropiAdapter sinClave = new DropiAdapter(restTemplate, objectMapper, "https://api.dropi.co", "");

            assertFalse(sinClave.isConfigured());

            SupplierAdapter.SupplierException e = assertThrows(
                    SupplierAdapter.SupplierException.class,
                    () -> sinClave.createOrder(validOrder()));

            assertTrue(e.getMessage().contains("no esta configurado"));
            verifyNoInteractions(restTemplate);
        }

        @Test
        @DisplayName("Con clave, esta configurado")
        void conClaveOpera() {
            assertTrue(adapter.isConfigured());
            assertEquals("DROPI", adapter.getCode());
        }
    }

    /* =====================================================================
       Crear pedido
       ================================================================== */

    @Nested
    @DisplayName("Crear pedido")
    class CrearPedido {

        @Test
        @DisplayName("Devuelve el identificador que asigna Dropi")
        void devuelveId() throws Exception {
            wcResponds("{\"id\":\"DR-90210\",\"status\":\"CREADO\"}", HttpStatus.CREATED);

            assertEquals("DR-90210", adapter.createOrder(validOrder()));
        }

        @Test
        @DisplayName("Tolera que el identificador venga envuelto en data")
        void toleraEnvoltorio() throws Exception {
            // Las APIs de proveedores cambian la forma de la respuesta entre
            // versiones. Tolerarlo evita que un renombrado tumbe el despacho.
            wcResponds("{\"data\":{\"id\":\"DR-77\"}}", HttpStatus.OK);

            assertEquals("DR-77", adapter.createOrder(validOrder()));
        }

        @Test
        @DisplayName("Falla si el pedido no tiene telefono")
        void sinTelefonoFalla() {
            SalesOrder order = validOrder();
            order.setCustomerPhone(null);

            SupplierAdapter.SupplierException e = assertThrows(
                    SupplierAdapter.SupplierException.class, () -> adapter.createOrder(order));

            assertTrue(e.getMessage().contains("telefono"));
            // Falla ANTES de llamar: sin telefono el pedido se pierde igual, y
            // asi no se gasta el flete de ida.
            verifyNoInteractions(restTemplate);
        }

        @Test
        @DisplayName("Falla si una linea no tiene SKU de proveedor")
        void sinSkuFalla() {
            SalesOrder order = validOrder();
            order.getItems().get(0).setSupplierSku(null);

            SupplierAdapter.SupplierException e = assertThrows(
                    SupplierAdapter.SupplierException.class, () -> adapter.createOrder(order));

            assertTrue(e.getMessage().contains("SKU"));
            verifyNoInteractions(restTemplate);
        }

        @Test
        @DisplayName("Falla si el pedido no tiene lineas")
        void sinLineasFalla() {
            SalesOrder order = validOrder();
            order.getItems().clear();

            assertThrows(SupplierAdapter.SupplierException.class, () -> adapter.createOrder(order));
        }

        @Test
        @DisplayName("Un error de red se convierte en SupplierException, no se propaga crudo")
        void errorDeRed() {
            when(restTemplate.exchange(anyString(), any(HttpMethod.class), any(), eq(String.class)))
                    .thenThrow(new ResourceAccessException("Connection timed out"));

            SupplierAdapter.SupplierException e = assertThrows(
                    SupplierAdapter.SupplierException.class, () -> adapter.createOrder(validOrder()));

            assertTrue(e.getMessage().contains("Error creando pedido"));
        }

        @Test
        @DisplayName("Si Dropi responde sin identificador, se falla en vez de dar por bueno el despacho")
        void sinIdEnRespuesta() {
            wcResponds("{\"status\":\"ok\"}", HttpStatus.OK);

            SupplierAdapter.SupplierException e = assertThrows(
                    SupplierAdapter.SupplierException.class, () -> adapter.createOrder(validOrder()));

            assertTrue(e.getMessage().contains("no devolvio identificador"));
        }
    }

    /* =====================================================================
       Seguimiento
       ================================================================== */

    @Nested
    @DisplayName("Seguimiento")
    class Seguimiento {

        @Test
        @DisplayName("Detecta la entrega a partir del estado en espanol")
        void detectaEntrega() throws Exception {
            wcResponds("{\"status\":\"ENTREGADO\",\"guide\":\"G-123\",\"carrier\":\"Interrapidisimo\"}", HttpStatus.OK);

            Optional<SupplierAdapter.TrackingInfo> info = adapter.getTracking("DR-1");

            assertTrue(info.isPresent());
            assertTrue(info.get().delivered());
            assertFalse(info.get().returned());
            assertEquals("G-123", info.get().trackingNumber());
            assertEquals("Interrapidisimo", info.get().carrier());
        }

        @ParameterizedTest
        @CsvSource({
                "DEVOLUCION EN CURSO, true",
                "DEVUELTO, true",
                "RECHAZADO POR EL CLIENTE, true",
                "EN REPARTO, false",
                "EN BODEGA, false",
        })
        @DisplayName("Detecta la devolucion en sus varias redacciones")
        void detectaDevolucion(String status, boolean esperado) throws Exception {
            wcResponds("{\"status\":\"" + status + "\"}", HttpStatus.OK);

            assertEquals(esperado, adapter.getTracking("DR-1").orElseThrow().returned(),
                    "Estado: " + status);
        }

        @Test
        @DisplayName("404 devuelve vacio, no excepcion: el pedido puede aun no existir alli")
        void noEncontradoEsVacio() throws Exception {
            wcResponds(null, HttpStatus.NOT_FOUND);

            assertTrue(adapter.getTracking("DR-INEXISTENTE").isEmpty());
        }
    }

    /* =====================================================================
       Stock y flete: fallan en silencio a proposito
       ================================================================== */

    @Nested
    @DisplayName("Stock y flete")
    class StockYFlete {

        @Test
        @DisplayName("Lee el stock del proveedor")
        void leeStock() throws Exception {
            wcResponds("{\"stock\":\"25\"}", HttpStatus.OK);

            assertEquals(25, adapter.getStock("DROPI-1").orElseThrow());
        }

        @Test
        @DisplayName("Si el stock no se puede consultar, devuelve vacio en vez de reventar")
        void stockTolerante() throws Exception {
            // Que no se pueda leer el stock no debe tumbar la sincronizacion
            // completa del catalogo.
            when(restTemplate.exchange(anyString(), any(HttpMethod.class), any(), eq(String.class)))
                    .thenThrow(new ResourceAccessException("timeout"));

            assertTrue(adapter.getStock("DROPI-1").isEmpty());
        }

        @Test
        @DisplayName("Cotiza el flete real hasta el destino")
        void cotizaFlete() throws Exception {
            wcResponds("{\"shipping_cost\":\"12500\"}", HttpStatus.OK);

            assertEquals(0, new BigDecimal("12500")
                    .compareTo(adapter.quoteShipping("DROPI-1", "Medellin", "ANT").orElseThrow()));
        }
    }

    /* =====================================================================
       Utilidades
       ================================================================== */

    @Nested
    @DisplayName("Normalizacion de telefono")
    class Telefono {

        @ParameterizedTest
        @CsvSource({
                "3001234567,      3001234567",
                "573001234567,    3001234567",
                "+57 300 123 4567,3001234567",
                "300-123-4567,    3001234567",
        })
        @DisplayName("Deja el celular en 10 digitos venga como venga")
        void normaliza(String entrada, String esperado) {
            assertEquals(esperado, DropiAdapter.normalizePhone(entrada));
        }

        @Test
        @DisplayName("Null no revienta")
        void nullSeguro() {
            assertEquals("", DropiAdapter.normalizePhone(null));
        }
    }
}
