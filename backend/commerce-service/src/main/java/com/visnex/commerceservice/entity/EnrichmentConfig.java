package com.visnex.commerceservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vn_com_enrichment_config")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder @EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class EnrichmentConfig {

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

    @Column(length = 30)
    private String provider;

    @Column(name = "api_key", length = 255)
    private String apiKey;

    @Column(length = 100)
    private String model;

    @Column(name = "monthly_budget", precision = 12, scale = 2)
    private BigDecimal monthlyBudget;

    @Column(name = "current_month_spend", precision = 12, scale = 2)
    private BigDecimal currentMonthSpend;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private Boolean active = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime creation;

    @UpdateTimestamp
    @Column(name = "last_update")
    private LocalDateTime lastUpdate;
}
