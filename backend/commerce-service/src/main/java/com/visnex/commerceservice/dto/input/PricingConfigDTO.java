package com.visnex.commerceservice.dto.input;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Schema(name = "PricingConfigDTO", description = "DTO used to create or update a PricingConfig record")
public class PricingConfigDTO {

    @Schema(description = "Primary key; omit when creating a new record", example = "1")
    private Long id;

    @Schema(description = "Company identifier", example = "1", required = true)
    private Long idCompany;

    @Schema(description = "Subsidiary identifier", example = "1")
    private Long idSubsidiary;

    @Schema(description = "User who creates or updates the record", example = "5")
    private Long idModifiedBy;

    @Schema(description = "Default shipping cost", example = "5.00")
    private BigDecimal shippingCostDefault;

    @Schema(description = "Customs rate percentage", example = "7.5")
    private BigDecimal customsRate;

    @Schema(description = "IVA rate percentage", example = "19")
    private BigDecimal ivaRate;

    @Schema(description = "IVA threshold in USD", example = "50")
    private BigDecimal ivaThresholdUsd;

    @Schema(description = "Gateway fee percentage", example = "3.5")
    private BigDecimal gatewayFeePercent;

    @Schema(description = "Packaging cost", example = "0")
    private BigDecimal packagingCost;

    @Schema(description = "Exchange rate", example = "950.00")
    private BigDecimal exchangeRate;

    @Schema(description = "Default margin percentage", example = "40")
    private BigDecimal defaultMargin;

    @Schema(description = "Whether the config is active", example = "true")
    private Boolean active;
}
