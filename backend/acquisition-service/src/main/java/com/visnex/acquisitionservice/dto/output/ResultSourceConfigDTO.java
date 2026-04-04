package com.visnex.acquisitionservice.dto.output;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Schema(description = "Output DTO for SourceConfig records")
public class ResultSourceConfigDTO {

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

    @Schema(description = "Name of the person who modified", example = "Admin User")
    private String modifiedBy;

    @Schema(description = "Configuration name", example = "CJ Main Config")
    private String name;

    @Schema(description = "Provider type", example = "CJ_DROPSHIPPING")
    private String provider;

    @Schema(description = "API key", example = "abc123...")
    private String apiKey;

    @Schema(description = "API secret", example = "secret...")
    private String apiSecret;

    @Schema(description = "Base URL", example = "https://api.cjdropshipping.com")
    private String baseUrl;

    @Schema(description = "Rate limit", example = "60")
    private Integer rateLimit;

    @Schema(description = "Last sync date")
    private LocalDateTime lastSync;

    @Schema(description = "Active flag", example = "true")
    private Boolean active;
}
