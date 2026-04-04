package com.visnex.commerceservice.dto.output;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Schema(description = "Output DTO for PublishChannel records")
public class ResultPublishChannelDTO {

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

    @Schema(description = "Channel name")
    private String name;

    @Schema(description = "Channel type")
    private String type;

    @Schema(description = "Configuration JSON")
    private String config;

    @Schema(description = "Channel status")
    private String status;

    @Schema(description = "Auto sync enabled")
    private Boolean autoSync;

    @Schema(description = "Last synchronization date")
    private LocalDateTime lastSync;

    @Schema(description = "Active flag")
    private Boolean active;
}
