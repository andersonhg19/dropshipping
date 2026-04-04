package com.visnex.acquisitionservice.dto.input;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(name = "ImportTemplateDTO", description = "DTO used to create or update an ImportTemplate record")
public class ImportTemplateDTO {

    @Schema(description = "Primary key; omit when creating", example = "1")
    private Long id;

    @Schema(description = "Company identifier", example = "1", required = true)
    private Long idCompany;

    @Schema(description = "Subsidiary identifier", example = "1")
    private Long idSubsidiary;

    @Schema(description = "User who creates or updates the record", example = "5")
    private Long idModifiedBy;

    @Schema(description = "Template name", example = "CJ Standard Import", required = true)
    private String name;

    @Schema(description = "File type: CSV, XLSX, JSON", example = "CSV")
    private String fileType;

    @Schema(description = "JSON with field mapping configuration")
    private String fieldMapping;

    @Schema(description = "Active flag", example = "true")
    private Boolean active;
}
