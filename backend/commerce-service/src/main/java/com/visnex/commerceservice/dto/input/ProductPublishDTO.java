package com.visnex.commerceservice.dto.input;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Schema(name = "ProductPublishDTO", description = "DTO used to create or update a ProductPublish record")
public class ProductPublishDTO {

    @Schema(description = "Primary key; omit when creating a new record", example = "1")
    private Long id;

    @Schema(description = "Company identifier", example = "1", required = true)
    private Long idCompany;

    @Schema(description = "Subsidiary identifier", example = "1")
    private Long idSubsidiary;

    @Schema(description = "User who creates or updates the record", example = "5")
    private Long idModifiedBy;

    @Schema(description = "Product ID", example = "1", required = true)
    private Long idProduct;

    @Schema(description = "Channel ID", example = "1", required = true)
    private Long idChannel;

    @Schema(description = "External product ID in the channel", example = "WC-12345")
    private String externalId;

    @Schema(description = "External product URL in the channel")
    private String externalUrl;

    @Schema(description = "Sync status: SYNCED|PENDING|OUT_OF_SYNC|ERROR", example = "PENDING")
    private String syncStatus;

    @Schema(description = "Last sync date")
    private LocalDateTime lastSync;

    @Schema(description = "Last error message")
    private String lastError;

    @Schema(description = "Whether the record is active", example = "true")
    private Boolean active;
}
