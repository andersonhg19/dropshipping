package com.visnex.commerceservice.dto.output;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Schema(description = "Output DTO for Promotion records")
public class ResultPromotionDTO {

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

    @Schema(description = "Promotion name")
    private String name;

    @Schema(description = "Promotion type")
    private String type;

    @Schema(description = "Promotion value")
    private BigDecimal value;

    @Schema(description = "Applies to")
    private String appliesTo;

    @Schema(description = "Category ID")
    private Long idCategory;

    @Schema(description = "Start date")
    private LocalDateTime startDate;

    @Schema(description = "End date")
    private LocalDateTime endDate;

    @Schema(description = "Active flag")
    private Boolean active;
}
