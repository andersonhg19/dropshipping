package com.visnex.acquisitionservice.dto.input;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Schema(name = "ImportJobFilterDTO", description = "DTO used to filter and paginate ImportJob records")
public class ImportJobFilterDTO {

    @Schema(description = "Primary key for direct lookup", example = "1")
    private Long id;

    @Schema(description = "Company identifier", example = "1")
    private Long idCompany;

    @Schema(description = "Subsidiary identifier", example = "1")
    private Long idSubsidiary;

    @Schema(description = "File name (partial match)", example = "products")
    private String fileName;

    @Schema(description = "File type: CSV, XLSX, JSON", example = "CSV")
    private String fileType;

    @Schema(description = "Job status", example = "COMPLETED")
    private String status;

    @Schema(description = "Supplier reference", example = "3")
    private Long idSupplier;

    @Schema(description = "Active flag", example = "true")
    private Boolean active;

    @Schema(description = "Modified by user id", example = "5")
    private Long idModifiedBy;

    @Schema(description = "Start date for date-range filtering")
    private LocalDateTime startDate;

    @Schema(description = "End date for date-range filtering")
    private LocalDateTime endDate;

    @Schema(description = "Page number starting at 0", example = "0")
    private Integer page;

    @Schema(description = "Number of records per page", example = "20")
    private Integer size;
}
