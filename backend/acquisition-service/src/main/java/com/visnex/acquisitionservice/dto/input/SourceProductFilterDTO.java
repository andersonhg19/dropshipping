package com.visnex.acquisitionservice.dto.input;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Schema(name = "SourceProductFilterDTO", description = "DTO used to filter and paginate SourceProduct records")
public class SourceProductFilterDTO {

    @Schema(description = "Primary key for direct lookup", example = "1")
    private Long id;

    @Schema(description = "Company identifier", example = "1")
    private Long idCompany;

    @Schema(description = "Subsidiary identifier", example = "1")
    private Long idSubsidiary;

    @Schema(description = "Source provider", example = "CJ_DROPSHIPPING")
    private String sourceProvider;

    @Schema(description = "Source product ID", example = "SKU-12345")
    private String sourceId;

    @Schema(description = "Product title (partial match)", example = "Wireless")
    private String title;

    @Schema(description = "Category", example = "Electronics")
    private String category;

    @Schema(description = "Supplier name (partial match)", example = "CJ")
    private String supplierName;

    @Schema(description = "Whether the product has been imported", example = "false")
    private Boolean imported;

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
