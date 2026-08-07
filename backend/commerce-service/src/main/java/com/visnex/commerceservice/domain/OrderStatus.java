package com.visnex.commerceservice.domain;

import java.util.Arrays;
import java.util.Collections;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Maquina de estados de un pedido.
 *
 * POR QUE UNA MAQUINA DE ESTADOS Y NO UN STRING
 * ---------------------------------------------
 * Un pedido mal gestionado no es un bug de pantalla: es plata. Si un pedido
 * pasa a ENVIADO_PROVEEDOR sin haber sido CONFIRMADO, se despacha mercancia a
 * alguien que quiza no la reciba, y en contraentrega eso significa pagar el
 * flete de ida y el de vuelta a cambio de nada.
 *
 * Con un campo de texto libre cualquier bug de la UI produce transiciones
 * imposibles en silencio. Aqui las transiciones validas son datos, se
 * verifican en un solo sitio, y estan cubiertas por tests.
 *
 * EL PASO QUE NO SE PUEDE SALTAR
 * ------------------------------
 * NUEVA -> CONFIRMADA es obligatorio antes de despachar. Entre el 20% y el 25%
 * de los pedidos contra entrega se caen si no se confirman; confirmarlos sube
 * la entrega urbana al 70-85%. Por eso NUEVA no puede ir directo a
 * ENVIADA_PROVEEDOR.
 */
public enum OrderStatus {

    /** Recibida de la tienda. Aun no se ha hablado con el cliente. */
    NUEVA,

    /** El cliente confirmo direccion y que va a recibir. Ya se puede despachar. */
    CONFIRMADA,

    /** Enviada al proveedor (Dropi, CJ) o alistada en bodega propia. */
    ENVIADA_PROVEEDOR,

    /** El proveedor genero guia. Va en camino. */
    EN_TRANSITO,

    /** El cliente la recibio. En contraentrega, aqui es cuando entra la plata. */
    ENTREGADA,

    /** No se pudo confirmar, el cliente desistio, o no habia stock. */
    CANCELADA,

    /** Llego al cliente y volvio: rechazo en puerta o retracto. */
    DEVUELTA;

    /**
     * Transiciones permitidas.
     *
     * Se puede cancelar desde casi cualquier punto previo a la entrega porque
     * en la operacion real eso pasa constantemente. Lo que NO se puede es
     * saltarse la confirmacion ni resucitar un pedido ya cerrado.
     */
    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED = Map.of(
            NUEVA,             EnumSet.of(CONFIRMADA, CANCELADA),
            CONFIRMADA,        EnumSet.of(ENVIADA_PROVEEDOR, CANCELADA),
            ENVIADA_PROVEEDOR, EnumSet.of(EN_TRANSITO, CANCELADA),
            EN_TRANSITO,       EnumSet.of(ENTREGADA, DEVUELTA),
            // Estados finales: no se sale de ellos.
            ENTREGADA,         EnumSet.noneOf(OrderStatus.class),
            CANCELADA,         EnumSet.noneOf(OrderStatus.class),
            DEVUELTA,          EnumSet.noneOf(OrderStatus.class)
    );

    public Set<OrderStatus> allowedNext() {
        return Collections.unmodifiableSet(ALLOWED.getOrDefault(this, EnumSet.noneOf(OrderStatus.class)));
    }

    public boolean canTransitionTo(OrderStatus next) {
        return next != null && allowedNext().contains(next);
    }

    /** Estado del que ya no se puede salir. */
    public boolean isFinal() {
        return allowedNext().isEmpty();
    }

    /** El pedido genero ingreso. Solo ENTREGADA cuenta como venta real. */
    public boolean isRevenue() {
        return this == ENTREGADA;
    }

    /**
     * El pedido se perdio despues de haber gastado en pauta.
     * Estos son los que hay que vigilar: son el 20-25% que se come el margen.
     */
    public boolean isLost() {
        return this == CANCELADA || this == DEVUELTA;
    }

    /** Ya no se puede despachar ni cambiar. */
    public boolean isClosed() {
        return isFinal();
    }

    public static OrderStatus fromString(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return Arrays.stream(values())
                .filter(s -> s.name().equalsIgnoreCase(value.trim()))
                .findFirst()
                .orElse(null);
    }
}
