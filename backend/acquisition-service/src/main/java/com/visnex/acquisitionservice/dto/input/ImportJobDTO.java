package com.visnex.acquisitionservice.dto.input;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(name = "ImportJobDTO", description = "DTO used to create or update an ImportJob record")
public class ImportJobDTO {

    @Schema(description = "Primary key; omit when creating", example = "1")
    private Long id;

    @Schema(description = "Company identifier", example = "1", required = true)
    private Long idCompany;

    @Schema(description = "Subsidiary identifier", example = "1")
    private Long idSubsidiary;

    @Schema(description = "User who creates or updates the record", example = "5")
    private Long idModifiedBy;

    @Schema(description = "Name of the uploaded file", example = "products_2026.csv")
    private String fileName;

    @Schema(description = "File type: CSV, XLSX, JSON", example = "CSV")
    private String fileType;

    @Schema(description = "JSON with field mapping configuration")
    private String fieldMapping;

    @Schema(description = "Job status: UPLOADED, MAPPED, VALIDATING, IMPORTING, COMPLETED, FAILED", example = "UPLOADED")
    private String status;

    @Schema(description = "Total rows in the file", example = "150")
    private Integer totalRows;

    @Schema(description = "Count of successfully imported rows", example = "140")
    private Integer successCount;

    @Schema(description = "Count of rows with errors", example = "10")
    private Integer errorCount;

    @Schema(description = "Count of rows with warnings", example = "5")
    private Integer warningCount;

    @Schema(description = "JSON array of error details")
    private String errors;

    @Schema(description = "Optional supplier reference", example = "3")
    private Long idSupplier;

    @Schema(description = "Active flag", example = "true")
    private Boolean active;
}
