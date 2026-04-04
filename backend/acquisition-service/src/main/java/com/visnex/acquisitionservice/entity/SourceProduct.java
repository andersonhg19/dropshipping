package com.visnex.acquisitionservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vn_acq_source_product")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder @EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class SourceProduct {

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

    @Column(name = "source_provider", length = 50)
    private String sourceProvider;

    @Column(name = "source_id", length = 200)
    private String sourceId;

    @Column(length = 500)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(precision = 15, scale = 4)
    private BigDecimal price;

    @Column(length = 10)
    private String currency = "USD";

    @Column(columnDefinition = "TEXT")
    private String images;

    @Column(length = 200)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String attributes;

    @Column(columnDefinition = "TEXT")
    private String variants;

    @Column(name = "source_url", length = 1000)
    private String sourceUrl;

    @Column(name = "supplier_name", length = 200)
    private String supplierName;

    @Column(length = 500)
    private String tags;

    private Integer score;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private Boolean imported = false;

    @Column(name = "fetch_date")
    private LocalDateTime fetchDate;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private Boolean active = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime creation;

    @UpdateTimestamp
    @Column(name = "last_update")
    private LocalDateTime lastUpdate;
}
