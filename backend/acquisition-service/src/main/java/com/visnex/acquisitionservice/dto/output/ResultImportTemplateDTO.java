package com.visnex.acquisitionservice.dto.output;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "Output DTO for ImportTemplate records")
public class ResultImportTemplateDTO {

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

    @Schema(description = "Name of the person who modified", example = "Admin User")
    private String modifiedBy;

    @Schema(description = "Template name", example = "CJ Standard Import")
    private String name;

    @Schema(description = "File type", example = "CSV")
    private String fileType;

    @Schema(description = "JSON with field mapping configuration")
    private String fieldMapping;

    @Schema(description = "Active flag", example = "true")
    private Boolean active;
}
