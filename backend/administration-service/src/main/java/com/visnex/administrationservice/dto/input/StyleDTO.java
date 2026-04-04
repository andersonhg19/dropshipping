package com.visnex.administrationservice.dto.input;

import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/** Data Transfer Object to create or update a Style record. */
@Getter
@Setter
@Schema(name = "StyleDTO", description = "DTO used to create or update a Style record")
public class StyleDTO {

    @Schema(description = "Primary key of the Style; omit when creating a new record", example = "1", required = false)
    private Long id;

    @Schema(description = "Identifier of the Company that owns the Style", example = "10", required = true)
    private Long idCompany;

    @Schema(description = "Identifier of the Subsidiary (nullable when global to Company)", example = "20", required = false)
    private Long idSubsidiary;

    @Schema(description = "Identifier of the User that creates or updates the record", example = "5", required = true)
    private Long idModifiedBy;

    @Schema(description = "Human-readable name of the style variable", example = "primaryColor", required = true)
    private String name;

    @Schema(description = "Value assigned to the style variable", example = "#004488", required = true)
    private String value;

    @Schema(description = "Optional category or CSS property (e.g., color, font)", example = "color", required = false)
    private String type;

    @Schema(description = "Optional extra qualifier for the type", example = "hex", required = false)
    private String typeValue;

    @Schema(description = "Indicates whether the Style is active", example = "true", required = true)
    @JsonAlias("state")
    private Boolean active;
}
