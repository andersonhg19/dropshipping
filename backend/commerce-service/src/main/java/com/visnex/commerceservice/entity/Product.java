package com.visnex.commerceservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vn_com_product")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder @EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Product {

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

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "enriched_title", length = 255)
    private String enrichedTitle;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "enriched_description", columnDefinition = "TEXT")
    private String enrichedDescription;

    @Column(name = "bullet_points", columnDefinition = "TEXT")
    private String bulletPoints;

    @Column(name = "source_provider", length = 100)
    private String sourceProvider;

    @Column(name = "source_id", length = 100)
    private String sourceId;

    @Column(name = "source_url", length = 500)
    private String sourceUrl;

    @Column(length = 30)
    private String status;

    @Column(name = "base_price", precision = 12, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "cost_price", precision = 12, scale = 2)
    private BigDecimal costPrice;

    @Column(name = "selling_price", precision = 12, scale = 2)
    private BigDecimal sellingPrice;

    @Column(precision = 8, scale = 2)
    private BigDecimal margin;

    @Column(name = "manual_price", columnDefinition = "boolean default false")
    private Boolean manualPrice = false;

    @Column(length = 10)
    private String currency;

    @Column(columnDefinition = "TEXT")
    private String tags;

    @Column(name = "seo_title", length = 255)
    private String seoTitle;

    @Column(name = "seo_description", columnDefinition = "TEXT")
    private String seoDescription;

    @Column(name = "seo_keywords", length = 500)
    private String seoKeywords;

    @Column(name = "id_category")
    private Long idCategory;

    @Column(name = "id_supplier")
    private Long idSupplier;

    // ---- Inventario y origen de despacho --------------------------------
    // Estos tres campos faltaban, y sin ellos no se podia ni saber si un
    // producto estaba agotado ni a quien pedirselo. Se vendian agotados sin
    // enterarse, que en contraentrega es una perdida directa: ya se pago la
    // pauta que trajo al cliente.

    /** Identificador del producto en el proveedor. Necesario para pedirlo. */
    @Column(name = "supplier_sku", length = 100)
    private String supplierSku;

    /** Existencias conocidas. null = el proveedor no informa stock. */
    @Column(name = "stock_quantity")
    private Integer stockQuantity;

    /**
     * Quien despacha: DROPI (local contraentrega), CJ (internacional) u OWN
     * (inventario propio). Es lo que permite que el router de pedidos divida
     * una orden por origen.
     */
    @Column(name = "fulfillment_origin", length = 30)
    private String fulfillmentOrigin;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private Boolean active = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime creation;

    @UpdateTimestamp
    @Column(name = "last_update")
    private LocalDateTime lastUpdate;
}
