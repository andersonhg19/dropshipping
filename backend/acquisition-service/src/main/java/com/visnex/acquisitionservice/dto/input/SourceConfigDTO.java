package com.visnex.acquisitionservice.dto.input;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(name = "SourceConfigDTO", description = "DTO used to create or update a SourceConfig record")
public class SourceConfigDTO {

    @Schema(description = "Primary key; omit when creating", example = "1")
    private Long id;

    @NotNull
    @Schema(description = "Company identifier", example = "1", required = true)
    private Long idCompany;

    @Schema(description = "Subsidiary identifier", example = "1")
    private Long idSubsidiary;

    @Schema(description = "User who creates or updates the record", example = "5")
    private Long idModifiedBy;

    @NotBlank
    @Schema(description = "Configuration name", example = "CJ Main Config", required = true)
    private String name;

    @NotBlank
    @Schema(description = "Provider: CJ_DROPSHIPPING, MERCADOLIBRE, EPROLO, ALIEXPRESS, FILE", example = "CJ_DROPSHIPPING")
    private String provider;

    @Schema(description = "API key for the provider", example = "abc123...")
    private String apiKey;

    @Schema(description = "API secret for the provider", example = "secret...")
    private String apiSecret;

    @Schema(description = "Base URL for the provider API", example = "https://api.cjdropshipping.com")
    private String baseUrl;

    @Schema(description = "Rate limit (requests per minute)", example = "60")
    private Integer rateLimit;

    @Schema(description = "Whether the config is active", example = "true")
    private Boolean active;
}
