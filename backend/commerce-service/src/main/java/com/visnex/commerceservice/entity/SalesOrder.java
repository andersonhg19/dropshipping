package com.visnex.commerceservice.entity;

import com.visnex.commerceservice.domain.OrderStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Pedido de venta.
 *
 * Se llama SalesOrder y no Order porque ORDER es palabra reservada en SQL y
 * obligaria a escapar el nombre de la tabla en cada consulta.
 *
 * Esta entidad es el nucleo del negocio y no existia: hasta ahora, cuando un
 * cliente compraba en la tienda no pasaba absolutamente nada del lado del SaaS.
 */
@Entity
@Table(name = "vn_com_sales_order", indexes = {
        @Index(name = "idx_order_company_status", columnList = "company_id,status"),
        @Index(name = "idx_order_external", columnList = "external_order_id,id_channel"),
        @Index(name = "idx_order_phone", columnList = "customer_phone")
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder @EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class SalesOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "subsidiary_id")
    private Long subsidiaryId;

    @Column(name = "id_modified_by")
    private Long idModifiedBy;

    // ---- Origen -----------------------------------------------------------

    /** Numero de pedido en la tienda de origen (WooCommerce). */
    @Column(name = "external_order_id", length = 100)
    private String externalOrderId;

    @Column(name = "id_channel")
    private Long idChannel;

    /** LANDING_COD, TIENDA, MANUAL... */
    @Column(name = "source", length = 40)
    private String source;

    // ---- Atribucion de pauta ---------------------------------------------
    // Sin esto no se puede saber que anuncio produjo la venta, y sin eso no se
    // puede optimizar la pauta ni calcular el CPA real por campana.

    @Column(name = "utm_source", length = 100)
    private String utmSource;

    @Column(name = "utm_campaign", length = 150)
    private String utmCampaign;

    @Column(name = "utm_content", length = 150)
    private String utmContent;

    // ---- Cliente ----------------------------------------------------------

    @Column(name = "customer_name", length = 200)
    private String customerName;

    /** Clave en contraentrega: sin telefono no hay confirmacion posible. */
    @Column(name = "customer_phone", length = 30)
    private String customerPhone;

    @Column(name = "customer_email", length = 150)
    private String customerEmail;

    @Column(name = "shipping_address", length = 400)
    private String shippingAddress;

    @Column(name = "shipping_city", length = 120)
    private String shippingCity;

    @Column(name = "shipping_state", length = 120)
    private String shippingState;

    @Column(name = "shipping_notes", columnDefinition = "TEXT")
    private String shippingNotes;

    // ---- Dinero -----------------------------------------------------------

    @Column(name = "subtotal", precision = 14, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "shipping_cost", precision = 14, scale = 2)
    private BigDecimal shippingCost;

    @Column(name = "total", precision = 14, scale = 2)
    private BigDecimal total;

    /** Lo que cuesta la mercancia. Necesario para saber la utilidad real. */
    @Column(name = "cost_total", precision = 14, scale = 2)
    private BigDecimal costTotal;

    @Column(name = "currency", length = 5)
    private String currency;

    /** COD | ONLINE */
    @Column(name = "payment_method", length = 30)
    private String paymentMethod;

    // ---- Estado -----------------------------------------------------------

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30, nullable = false)
    private OrderStatus status;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    /** Por que se cancelo o devolvio. Es lo que permite mejorar la tasa. */
    @Column(name = "close_reason", length = 300)
    private String closeReason;

    // ---- Proveedor --------------------------------------------------------

    /** DROPI | CJ | OWN */
    @Column(name = "fulfillment_origin", length = 30)
    private String fulfillmentOrigin;

    /** Identificador del pedido en el proveedor. */
    @Column(name = "supplier_order_id", length = 100)
    private String supplierOrderId;

    @Column(name = "tracking_number", length = 100)
    private String trackingNumber;

    @Column(name = "tracking_url", length = 500)
    private String trackingUrl;

    @Column(name = "carrier", length = 100)
    private String carrier;

    @Column(name = "last_supplier_error", columnDefinition = "TEXT")
    private String lastSupplierError;

    // ---- Comunes ----------------------------------------------------------

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<SalesOrderItem> items = new ArrayList<>();

    @Column(nullable = false, columnDefinition = "boolean default true")
    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime creation;

    @UpdateTimestamp
    @Column(name = "last_update")
    private LocalDateTime lastUpdate;

    /** Anade un item manteniendo la relacion en los dos sentidos. */
    public void addItem(SalesOrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    /** true si es contraentrega: cambia como se trata el pedido en todo el flujo. */
    public boolean isCashOnDelivery() {
        return "COD".equalsIgnoreCase(paymentMethod);
    }
}
