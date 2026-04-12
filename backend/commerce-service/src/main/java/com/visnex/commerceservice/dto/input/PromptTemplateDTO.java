package com.visnex.commerceservice.dto.input;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(name = "PromptTemplateDTO", description = "DTO used to create or update a PromptTemplate record")
public class PromptTemplateDTO {

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
    @Schema(description = "Template name", example = "Default SEO Template", required = true)
    private String name;

    @Schema(description = "Template type: FULL_PIPELINE|TITLE_ONLY|DESCRIPTION_ONLY|SEO_ONLY", example = "FULL_PIPELINE")
    private String type;

    @Schema(description = "Category ID for category-specific templates")
    private Long idCategory;

    @NotBlank
    @Schema(description = "The prompt text template")
    private String promptText;

    @Schema(description = "Language code", example = "es")
    private String language;

    @Schema(description = "Whether the template is active", example = "true")
    private Boolean active;
}
