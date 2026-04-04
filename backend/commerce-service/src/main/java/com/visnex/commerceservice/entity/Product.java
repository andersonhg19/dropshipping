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

    @Column(nullable = false, columnDefinition = "boolean default true")
    private Boolean active = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime creation;

    @UpdateTimestamp
    @Column(name = "last_update")
    private LocalDateTime lastUpdate;
}
