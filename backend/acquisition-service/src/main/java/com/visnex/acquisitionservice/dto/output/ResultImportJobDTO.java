package com.visnex.acquisitionservice.dto.output;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "Output DTO for ImportJob records")
public class ResultImportJobDTO {

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

    @Schema(description = "Name of the uploaded file", example = "products_2026.csv")
    private String fileName;

    @Schema(description = "File type", example = "CSV")
    private String fileType;

    @Schema(description = "JSON with field mapping configuration")
    private String fieldMapping;

    @Schema(description = "Job status", example = "COMPLETED")
    private String status;

    @Schema(description = "Total rows in the file", example = "150")
    private Integer totalRows;

    @Schema(description = "Successfully imported rows", example = "140")
    private Integer successCount;

    @Schema(description = "Rows with errors", example = "10")
    private Integer errorCount;

    @Schema(description = "Rows with warnings", example = "5")
    private Integer warningCount;

    @Schema(description = "JSON array of error details")
    private String errors;

    @Schema(description = "Supplier reference", example = "3")
    private Long idSupplier;

    @Schema(description = "Active flag", example = "true")
    private Boolean active;
}
