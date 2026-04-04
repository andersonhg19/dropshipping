package com.visnex.acquisitionservice.dto.input;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Schema(name = "SourceProductDTO", description = "DTO used to create or update a SourceProduct record")
public class SourceProductDTO {

    @Schema(description = "Primary key; omit when creating", example = "1")
    private Long id;

    @Schema(description = "Company identifier", example = "1", required = true)
    private Long idCompany;

    @Schema(description = "Subsidiary identifier", example = "1")
    private Long idSubsidiary;

    @Schema(description = "User who creates or updates the record", example = "5")
    private Long idModifiedBy;

    @Schema(description = "Source provider name", example = "CJ_DROPSHIPPING")
    private String sourceProvider;

    @Schema(description = "Product ID at the source", example = "SKU-12345")
    private String sourceId;

    @Schema(description = "Product title", example = "Wireless Earbuds Bluetooth 5.0")
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

    @Schema(description = "URL to the product at the source", example = "https://cjdropshipping.com/product/12345")
    private String sourceUrl;

    @Schema(description = "Supplier name", example = "CJ Dropshipping")
    private String supplierName;

    @Schema(description = "JSON array of tags", example = "[\"electronics\",\"wireless\"]")
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
