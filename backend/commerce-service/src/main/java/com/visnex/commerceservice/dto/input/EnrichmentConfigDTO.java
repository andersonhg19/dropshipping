package com.visnex.commerceservice.dto.input;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Schema(name = "EnrichmentConfigDTO", description = "DTO used to create or update an EnrichmentConfig record")
public class EnrichmentConfigDTO {

    @Schema(description = "Primary key; omit when creating a new record", example = "1")
    private Long id;

    @Schema(description = "Company identifier", example = "1", required = true)
    private Long idCompany;

    @Schema(description = "Subsidiary identifier", example = "1")
    private Long idSubsidiary;

    @Schema(description = "User who creates or updates the record", example = "5")
    private Long idModifiedBy;

    @Schema(description = "AI provider: OPENAI|CLAUDE|OLLAMA_LOCAL", example = "OPENAI")
    private String provider;

    @Schema(description = "API key for the provider")
    private String apiKey;

    @Schema(description = "Model name", example = "gpt-4o-mini")
    private String model;

    @Schema(description = "Monthly budget limit", example = "10.00")
    private BigDecimal monthlyBudget;

    @Schema(description = "Current month spend", example = "0.00")
    private BigDecimal currentMonthSpend;

    @Schema(description = "Whether the config is active", example = "true")
    private Boolean active;
}
