package com.visnex.acquisitionservice.dto.output;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Schema(description = "Output DTO for SourceProduct records")
public class ResultSourceProductDTO {

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

    @Schema(description = "Source provider", example = "CJ_DROPSHIPPING")
    private String sourceProvider;

    @Schema(description = "Source product ID", example = "SKU-12345")
    private String sourceId;

    @Schema(description = "Product title", example = "Wireless Earbuds")
    private String title;

    @Schema(description = "Product description")
    private String description;

    @Schema(description = "Product price", example = "12.99")
    private BigDecimal price;

    @Schema(description = "Currency code", example = "USD")
    private String currency;

    @Schema(description = "JSON array of image URLs")
    private String images;

    @Schema(description = "Product category", example = "Electronics")
    private String category;

    @Schema(description = "JSON object of product attributes")
    private String attributes;

    @Schema(description = "JSON array of product variants")
    private String variants;

    @Schema(description = "URL to the source product")
    private String sourceUrl;

    @Schema(description = "Supplier name", example = "CJ Dropshipping")
    private String supplierName;

    @Schema(description = "JSON array of tags")
    private String tags;

    @Schema(description = "Product score", example = "85")
    private Integer score;

    @Schema(description = "Whether the product has been imported", example = "false")
    private Boolean imported;

    @Schema(description = "Date when the product was fetched")
    private LocalDateTime fetchDate;

    @Schema(description = "Active flag", example = "true")
    private Boolean active;
}
