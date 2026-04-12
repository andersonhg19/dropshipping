package com.visnex.commerceservice.dto.input;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(name = "CategoryDTO", description = "DTO used to create or update a Category record")
public class CategoryDTO {

    @Schema(description = "Primary key; omit when creating a new record", example = "1")
    private Long id;

    @NotNull
    @Schema(description = "Company identifier", example = "1", required = true)
    private Long idCompany;

    @Schema(description = "Subsidiary identifier", example = "1")
    private Long idSubsidiary;

    @Schema(description = "User who creates or updates the record", example = "5")
    private Long idModifiedBy;

    @NotBlank
    @Size(max = 200)
    @Schema(description = "Category name", example = "Electronics", required = true)
    private String name;

    @Schema(description = "Parent category ID for hierarchy", example = "1")
    private Long parentId;

    @Schema(description = "Icon identifier", example = "electronics-icon")
    private String icon;

    @Schema(description = "WooCommerce category ID mapping")
    private Long wpCategoryId;

    @Schema(description = "Whether the category is active", example = "true")
    private Boolean active;
}
