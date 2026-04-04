package com.visnex.commerceservice.dto.output;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Schema(description = "Output DTO for ProductPublish records")
public class ResultProductPublishDTO {

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

    @Schema(description = "Product ID")
    private Long idProduct;

    @Schema(description = "Channel ID")
    private Long idChannel;

    @Schema(description = "External product ID")
    private String externalId;

    @Schema(description = "External product URL")
    private String externalUrl;

    @Schema(description = "Sync status")
    private String syncStatus;

    @Schema(description = "Last sync date")
    private LocalDateTime lastSync;

    @Schema(description = "Last error message")
    private String lastError;

    @Schema(description = "Active flag")
    private Boolean active;
}
