package com.visnex.commerceservice.dto.input;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Schema(name = "PublishChannelDTO", description = "DTO used to create or update a PublishChannel record")
public class PublishChannelDTO {

    @Schema(description = "Primary key; omit when creating a new record", example = "1")
    private Long id;

    @Schema(description = "Company identifier", example = "1", required = true)
    private Long idCompany;

    @Schema(description = "Subsidiary identifier", example = "1")
    private Long idSubsidiary;

    @Schema(description = "User who creates or updates the record", example = "5")
    private Long idModifiedBy;

    @Schema(description = "Channel name", example = "Mi WooCommerce", required = true)
    private String name;

    @Schema(description = "Channel type: WOOCOMMERCE|FACEBOOK_MARKETPLACE|INSTAGRAM_SHOPPING|MERCADOLIBRE|CSV_EXPORT", example = "WOOCOMMERCE")
    private String type;

    @Schema(description = "Configuration JSON with credentials per type")
    private String config;

    @Schema(description = "Channel status: CONNECTED|DISCONNECTED|ERROR", example = "DISCONNECTED")
    private String status;

    @Schema(description = "Auto sync enabled", example = "false")
    private Boolean autoSync;

    @Schema(description = "Last synchronization date")
    private LocalDateTime lastSync;

    @Schema(description = "Whether the channel is active", example = "true")
    private Boolean active;
}
