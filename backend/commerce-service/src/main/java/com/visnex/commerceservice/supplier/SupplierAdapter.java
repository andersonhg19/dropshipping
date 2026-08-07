package com.visnex.commerceservice.supplier;

import com.visnex.commerceservice.entity.SalesOrder;

import java.math.BigDecimal;
import java.util.Optional;

/**
 * Contrato con un proveedor de dropshipping.
 *
 * POR QUE UNA INTERFAZ Y NO LLAMAR A DROPI DIRECTAMENTE
 * ----------------------------------------------------
 * La investigacion de mercado encontro que la combinacion ganadora es tener
 * catalogo local contraentrega (Dropi) y catalogo internacional (CJ) en un
 * mismo panel — algo que hoy nadie ofrece en Colombia. Eso solo es viable si
 * el router de pedidos habla con una interfaz y no con un proveedor concreto.
 *
 * Ademas permite tener un adaptador falso en los tests, y probar el flujo
 * completo sin depender de que la API del proveedor este arriba.
 */
public interface SupplierAdapter {

    /** Identificador del proveedor: DROPI, CJ, OWN. */
    String getCode();

    /** true si el adaptador tiene credenciales y puede operar. */
    boolean isConfigured();

    /**
     * Envia el pedido al proveedor para que lo despache.
     *
     * @return identificador del pedido en el proveedor
     * @throws SupplierException si el proveedor rechaza el pedido
     */
    String createOrder(SalesOrder order) throws SupplierException;

    /** Consulta el estado del envio. Vacio si el proveedor aun no lo tiene. */
    Optional<TrackingInfo> getTracking(String supplierOrderId) throws SupplierException;

    /** Existencias disponibles de un SKU. Vacio si el proveedor no lo informa. */
    Optional<Integer> getStock(String supplierSku) throws SupplierException;

    /**
     * Costo del flete hasta el destino.
     *
     * Sin esto, el precio de venta se calcula con un flete estimado y el margen
     * real puede ser la mitad del que muestra el panel.
     */
    Optional<BigDecimal> quoteShipping(String supplierSku, String city, String state) throws SupplierException;

    /** Cancela el pedido en el proveedor, si aun es posible. */
    boolean cancelOrder(String supplierOrderId) throws SupplierException;

    /** Datos de seguimiento de un envio. */
    record TrackingInfo(
            String trackingNumber,
            String carrier,
            String status,
            String trackingUrl,
            boolean delivered,
            boolean returned
    ) {}

    /** Fallo al hablar con el proveedor. */
    class SupplierException extends Exception {
        public SupplierException(String message) {
            super(message);
        }

        public SupplierException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
