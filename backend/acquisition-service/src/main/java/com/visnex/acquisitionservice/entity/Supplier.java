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

import java.time.LocalDateTime;

@Entity
@Table(name = "vn_acq_supplier")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder @EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Supplier {

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

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 50)
    private String type;

    @Column(length = 100)
    private String country;

    @Column(length = 200)
    private String contact;

    @Column(name = "shipping_days")
    private Integer shippingDays;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "reliability_score")
    private Double reliabilityScore;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private Boolean active = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime creation;

    @UpdateTimestamp
    @Column(name = "last_update")
    private LocalDateTime lastUpdate;
}
