package com.visnex.commerceservice.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import java.util.EnumSet;
import java.util.Set;

import static com.visnex.commerceservice.domain.OrderStatus.*;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests de la maquina de estados de pedidos.
 *
 * Esta clase decide si un cliente recibe o no su producto. Una transicion mal
 * permitida no da error: despacha mercancia y pierde plata en silencio. Por eso
 * se testea cada arista, no solo el camino feliz.
 */
class OrderStatusTest {

    @Nested
    @DisplayName("Camino feliz")
    class CaminoFeliz {

        @Test
        @DisplayName("El flujo completo NUEVA -> ENTREGADA es valido paso a paso")
        void flujoCompleto() {
            OrderStatus[] flujo = {NUEVA, CONFIRMADA, ENVIADA_PROVEEDOR, EN_TRANSITO, ENTREGADA};

            for (int i = 0; i < flujo.length - 1; i++) {
                assertTrue(flujo[i].canTransitionTo(flujo[i + 1]),
                        flujo[i] + " deberia poder pasar a " + flujo[i + 1]);
            }
        }
    }

    @Nested
    @DisplayName("La confirmacion no se puede saltar")
    class ConfirmacionObligatoria {

        @Test
        @DisplayName("NUEVA no puede ir directo a ENVIADA_PROVEEDOR")
        void noSePuedeDespacharSinConfirmar() {
            // Este es el test mas importante del archivo. Despachar sin
            // confirmar es exactamente lo que hace que entre el 20% y el 25%
            // de los pedidos contra entrega se pierdan: se paga producto y
            // flete de ida por algo que nadie va a recibir.
            assertFalse(NUEVA.canTransitionTo(ENVIADA_PROVEEDOR),
                    "Un pedido sin confirmar NUNCA debe poder despacharse");
        }

        @Test
        @DisplayName("NUEVA no puede saltar a EN_TRANSITO ni a ENTREGADA")
        void noSePuedenSaltarPasos() {
            assertFalse(NUEVA.canTransitionTo(EN_TRANSITO));
            assertFalse(NUEVA.canTransitionTo(ENTREGADA));
            assertFalse(NUEVA.canTransitionTo(DEVUELTA));
        }

        @Test
        @DisplayName("Desde NUEVA solo se puede confirmar o cancelar")
        void desdeNuevaSoloDosCaminos() {
            assertEquals(EnumSet.of(CONFIRMADA, CANCELADA), NUEVA.allowedNext());
        }
    }

    @Nested
    @DisplayName("Estados finales")
    class EstadosFinales {

        @ParameterizedTest
        @EnumSource(value = OrderStatus.class, names = {"ENTREGADA", "CANCELADA", "DEVUELTA"})
        @DisplayName("Un pedido cerrado no admite ninguna transicion")
        void cerradoNoSale(OrderStatus finalStatus) {
            assertTrue(finalStatus.isFinal(), finalStatus + " deberia ser final");
            assertTrue(finalStatus.allowedNext().isEmpty());

            for (OrderStatus target : OrderStatus.values()) {
                assertFalse(finalStatus.canTransitionTo(target),
                        finalStatus + " no deberia poder pasar a " + target);
            }
        }

        @Test
        @DisplayName("Un pedido entregado no se puede resucitar ni cancelar")
        void entregadaEsDefinitiva() {
            assertFalse(ENTREGADA.canTransitionTo(CANCELADA));
            assertFalse(ENTREGADA.canTransitionTo(DEVUELTA),
                    "Una devolucion posterior a la entrega es otro proceso, no un cambio de estado");
        }

        @ParameterizedTest
        @EnumSource(value = OrderStatus.class, names = {"NUEVA", "CONFIRMADA", "ENVIADA_PROVEEDOR", "EN_TRANSITO"})
        @DisplayName("Los estados abiertos NO son finales")
        void abiertosNoSonFinales(OrderStatus status) {
            assertFalse(status.isFinal());
            assertFalse(status.allowedNext().isEmpty());
        }
    }

    @Nested
    @DisplayName("Cancelacion")
    class Cancelacion {

        @ParameterizedTest
        @EnumSource(value = OrderStatus.class, names = {"NUEVA", "CONFIRMADA", "ENVIADA_PROVEEDOR"})
        @DisplayName("Se puede cancelar mientras el paquete no este en la calle")
        void cancelarAntesDeTransito(OrderStatus status) {
            assertTrue(status.canTransitionTo(CANCELADA),
                    "En la operacion real se cancela constantemente antes de despachar");
        }

        @Test
        @DisplayName("En transito ya NO se cancela: se devuelve")
        void enTransitoNoSeCancela() {
            assertFalse(EN_TRANSITO.canTransitionTo(CANCELADA),
                    "Con el paquete en la calle el desenlace es entrega o devolucion, no cancelacion");
            assertTrue(EN_TRANSITO.canTransitionTo(DEVUELTA));
            assertTrue(EN_TRANSITO.canTransitionTo(ENTREGADA));
        }
    }

    @Nested
    @DisplayName("Clasificacion economica")
    class Clasificacion {

        @Test
        @DisplayName("Solo ENTREGADA cuenta como ingreso")
        void soloEntregadaEsIngreso() {
            // En contraentrega la plata entra al ENTREGAR, no al vender. Contar
            // un pedido como venta antes de eso infla los numeros y lleva a
            // subir la pauta sobre datos falsos.
            for (OrderStatus s : OrderStatus.values()) {
                assertEquals(s == ENTREGADA, s.isRevenue(), s + ".isRevenue()");
            }
        }

        @Test
        @DisplayName("CANCELADA y DEVUELTA son las perdidas que hay que vigilar")
        void perdidas() {
            assertTrue(CANCELADA.isLost());
            assertTrue(DEVUELTA.isLost());

            for (OrderStatus s : EnumSet.of(NUEVA, CONFIRMADA, ENVIADA_PROVEEDOR, EN_TRANSITO, ENTREGADA)) {
                assertFalse(s.isLost(), s + " no es una perdida");
            }
        }

        @Test
        @DisplayName("Ningun estado es a la vez ingreso y perdida")
        void sinSolapamiento() {
            for (OrderStatus s : OrderStatus.values()) {
                assertFalse(s.isRevenue() && s.isLost(), s + " no puede ser ingreso y perdida");
            }
        }
    }

    @Nested
    @DisplayName("Integridad del grafo")
    class Integridad {

        @ParameterizedTest
        @EnumSource(OrderStatus.class)
        @DisplayName("Ningun estado se apunta a si mismo")
        void sinAutoTransiciones(OrderStatus status) {
            assertFalse(status.canTransitionTo(status),
                    "Una transicion a si mismo debe tratarse como idempotencia en el servicio, no como arista");
        }

        @ParameterizedTest
        @EnumSource(OrderStatus.class)
        @DisplayName("Todo estado abierto tiene un camino de salida")
        void sinCallejonesSinSalida(OrderStatus status) {
            if (status.isFinal()) {
                return;
            }
            assertFalse(status.allowedNext().isEmpty(),
                    status + " se quedaria atascado para siempre");
        }

        @Test
        @DisplayName("Todos los estados son alcanzables desde NUEVA")
        void todosAlcanzables() {
            Set<OrderStatus> visitados = EnumSet.of(NUEVA);
            boolean cambio = true;
            while (cambio) {
                cambio = false;
                for (OrderStatus s : EnumSet.copyOf(visitados)) {
                    for (OrderStatus next : s.allowedNext()) {
                        if (visitados.add(next)) {
                            cambio = true;
                        }
                    }
                }
            }
            assertEquals(EnumSet.allOf(OrderStatus.class), visitados,
                    "Hay estados a los que no se puede llegar: son codigo muerto o un error del grafo");
        }

        @ParameterizedTest
        @EnumSource(OrderStatus.class)
        @DisplayName("canTransitionTo(null) es falso, no una excepcion")
        void nullNoRevienta(OrderStatus status) {
            assertFalse(status.canTransitionTo(null));
        }
    }

    @Nested
    @DisplayName("Conversion desde texto")
    class DesdeTexto {

        @Test
        @DisplayName("Acepta mayusculas, minusculas y espacios")
        void tolerante() {
            assertEquals(CONFIRMADA, OrderStatus.fromString("CONFIRMADA"));
            assertEquals(CONFIRMADA, OrderStatus.fromString("confirmada"));
            assertEquals(CONFIRMADA, OrderStatus.fromString("  Confirmada  "));
        }

        @Test
        @DisplayName("Devuelve null ante valores desconocidos en vez de reventar")
        void desconocidoDevuelveNull() {
            assertNull(OrderStatus.fromString("INVENTADO"));
            assertNull(OrderStatus.fromString(""));
            assertNull(OrderStatus.fromString(null));
        }
    }
}
