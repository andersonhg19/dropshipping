package com.visnex.commerceservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Linea de un pedido.
 *
 * Los datos del producto se COPIAN al crear la linea (nombre, sku, precio) en
 * vez de leerse por referencia. Si manana sube el precio del producto, el
 * pedido de ayer tiene que seguir mostrando lo que el cliente pago.
 */
@Entity
@Table(name = "vn_com_sales_order_item", indexes = {
        @Index(name = "idx_order_item_order", columnList = "id_order")
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder @EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class SalesOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_order", nullable = false)
    private SalesOrder order;

    /** Producto del catalogo. Puede quedar nulo si el producto se borro. */
    @Column(name = "id_product")
    private Long idProduct;

    /** Identificador del producto en el proveedor, para poder pedirlo. */
    @Column(name = "supplier_sku", length = 100)
    private String supplierSku;

    @Column(name = "product_name", length = 300, nullable = false)
    private String productName;

    @Column(name = "variant", length = 200)
    private String variant;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    /** Precio de venta unitario en el momento de la compra. */
    @Column(name = "unit_price", precision = 14, scale = 2)
    private BigDecimal unitPrice;

    /** Costo unitario en el momento de la compra: define la utilidad real. */
    @Column(name = "unit_cost", precision = 14, scale = 2)
    private BigDecimal unitCost;

    @Column(name = "line_total", precision = 14, scale = 2)
    private BigDecimal lineTotal;

    public BigDecimal calculateLineTotal() {
        if (unitPrice == null || quantity == null) {
            return BigDecimal.ZERO;
        }
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }
}
