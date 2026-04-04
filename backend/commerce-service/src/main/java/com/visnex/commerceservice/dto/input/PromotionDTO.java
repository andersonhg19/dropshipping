package com.visnex.commerceservice.dto.input;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Schema(name = "PromotionDTO", description = "DTO used to create or update a Promotion record")
public class PromotionDTO {

    @Schema(description = "Primary key; omit when creating a new record", example = "1")
    private Long id;

    @Schema(description = "Company identifier", example = "1", required = true)
    private Long idCompany;

    @Schema(description = "Subsidiary identifier", example = "1")
    private Long idSubsidiary;

    @Schema(description = "User who creates or updates the record", example = "5")
    private Long idModifiedBy;

    @Schema(description = "Promotion name", example = "Summer Sale", required = true)
    private String name;

    @Schema(description = "Promotion type: PERCENTAGE|FIXED_AMOUNT|BUY_X_GET_Y", example = "PERCENTAGE")
    private String type;

    @Schema(description = "Promotion value (percentage or fixed amount)", example = "15.00")
    private BigDecimal value;

    @Schema(description = "Applies to: ALL|CATEGORY|SPECIFIC_PRODUCTS", example = "ALL")
    private String appliesTo;

    @Schema(description = "Category ID (when appliesTo=CATEGORY)")
    private Long idCategory;

    @Schema(description = "Promotion start date")
    private LocalDateTime startDate;

    @Schema(description = "Promotion end date")
    private LocalDateTime endDate;

    @Schema(description = "Whether the promotion is active", example = "true")
    private Boolean active;
}
