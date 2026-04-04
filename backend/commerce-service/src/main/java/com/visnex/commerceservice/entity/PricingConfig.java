package com.visnex.commerceservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vn_com_pricing_config")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder @EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class PricingConfig {

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

    @Column(name = "shipping_cost_default", precision = 12, scale = 2)
    private BigDecimal shippingCostDefault;

    @Column(name = "customs_rate", precision = 8, scale = 2)
    private BigDecimal customsRate;

    @Column(name = "iva_rate", precision = 8, scale = 2)
    private BigDecimal ivaRate;

    @Column(name = "iva_threshold_usd", precision = 12, scale = 2)
    private BigDecimal ivaThresholdUsd;

    @Column(name = "gateway_fee_percent", precision = 8, scale = 2)
    private BigDecimal gatewayFeePercent;

    @Column(name = "packaging_cost", precision = 12, scale = 2)
    private BigDecimal packagingCost;

    @Column(name = "exchange_rate", precision = 12, scale = 4)
    private BigDecimal exchangeRate;

    @Column(name = "default_margin", precision = 8, scale = 2)
    private BigDecimal defaultMargin;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private Boolean active = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime creation;

    @UpdateTimestamp
    @Column(name = "last_update")
    private LocalDateTime lastUpdate;
}
