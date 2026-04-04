package com.visnex.commerceservice.dto.output;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Schema(description = "Output DTO for PricingConfig records")
public class ResultPricingConfigDTO {

    @Schema(description = "Primary key", example = "1")
    private Long id;

    @Schema(description = "Company identifier", example = "1")
    private Long companyId;

    @Schema(description = "Company name (enriched)", example = "Company S.A.")
    private String companyName;

    @Schema(description = "Subsidiary identifier", example = "1")
    private Long subsidiaryId;

    @Schema(description = "Subsidiary name (enriched)", example = "Subsidiary Norte")
    private String subsidiaryName;

    @Schema(description = "User who modified the record", example = "5")
    private Long idModifiedBy;

    @Schema(description = "Name of the person who modified the record", example = "Admin User")
    private String modifiedBy;

    @Schema(description = "Default shipping cost")
    private BigDecimal shippingCostDefault;

    @Schema(description = "Customs rate percentage")
    private BigDecimal customsRate;

    @Schema(description = "IVA rate percentage")
    private BigDecimal ivaRate;

    @Schema(description = "IVA threshold in USD")
    private BigDecimal ivaThresholdUsd;

    @Schema(description = "Gateway fee percentage")
    private BigDecimal gatewayFeePercent;

    @Schema(description = "Packaging cost")
    private BigDecimal packagingCost;

    @Schema(description = "Exchange rate")
    private BigDecimal exchangeRate;

    @Schema(description = "Default margin percentage")
    private BigDecimal defaultMargin;

    @Schema(description = "Active flag")
    private Boolean active;
}
