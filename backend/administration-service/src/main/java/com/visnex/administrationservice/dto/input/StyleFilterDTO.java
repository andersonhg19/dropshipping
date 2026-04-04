package com.visnex.administrationservice.dto.input;

import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/** DTO used to filter and paginate Style records. */
@Getter
@Setter
@Schema(name = "StyleFilterDTO", description = "DTO used to filter and paginate Style records")
public class StyleFilterDTO {

    @Schema(description = "Page number starting at 0", example = "0", required = true)
    private Integer page;

    @Schema(description = "Number of records per page", example = "20", required = true)
    private Integer size;

    @Schema(description = "Primary key of the Style for direct lookup", example = "1", required = false)
    private Long id;

    @Schema(description = "Identifier of the Company that owns the Style", example = "10", required = false)
    private Long idCompany;

    @Schema(description = "Identifier of the Subsidiary (nullable when global to Company)", example = "20", required = false)
    private Long idSubsidiary;

    @Schema(description = "Identifier of the User that created or updated the Style", example = "5", required = false)
    private Long idModifiedBy;

    @Schema(description = "Human-readable name of the style variable", example = "primaryColor", required = false)
    private String name;

    @Schema(description = "Value assigned to the style variable", example = "#004488", required = false)
    private String value;

    @Schema(description = "Optional category or CSS property", example = "color", required = false)
    private String type;

    @Schema(description = "Optional extra qualifier for the type", example = "hex", required = false)
    private String typeValue;

    @Schema(description = "Flag indicating whether the Style is active", example = "true", required = false)
    @JsonAlias("state")
    private Boolean active;

    @Schema(description = "Start date for date-range filtering", example = "2025-01-01", required = false)
    private LocalDateTime startDate;

    @Schema(description = "End date for date-range filtering", example = "2025-12-31", required = false)
    private LocalDateTime endDate;
}
