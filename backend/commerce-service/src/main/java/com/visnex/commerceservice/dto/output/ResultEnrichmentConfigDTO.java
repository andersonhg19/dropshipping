package com.visnex.commerceservice.dto.output;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Schema(description = "Output DTO for EnrichmentConfig records")
public class ResultEnrichmentConfigDTO {

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

    @Schema(description = "AI provider")
    private String provider;

    @Schema(description = "API key (masked)")
    private String apiKey;

    @Schema(description = "Model name")
    private String model;

    @Schema(description = "Monthly budget limit")
    private BigDecimal monthlyBudget;

    @Schema(description = "Current month spend")
    private BigDecimal currentMonthSpend;

    @Schema(description = "Active flag")
    private Boolean active;
}
