package com.visnex.commerceservice.dto.input;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Schema(name = "ProductDTO", description = "DTO used to create or update a Product record")
public class ProductDTO {

    @Schema(description = "Primary key; omit when creating a new record", example = "1")
    private Long id;

    @Schema(description = "Company identifier", example = "1", required = true)
    private Long idCompany;

    @Schema(description = "Subsidiary identifier", example = "1")
    private Long idSubsidiary;

    @Schema(description = "User who creates or updates the record", example = "5")
    private Long idModifiedBy;

    @Schema(description = "Product title", example = "Wireless Bluetooth Earbuds", required = true)
    private String title;

    @Schema(description = "Enriched title (AI-generated)")
    private String enrichedTitle;

    @Schema(description = "Product description")
    private String description;

    @Schema(description = "Enriched description (AI-generated)")
    private String enrichedDescription;

    @Schema(description = "Bullet points as JSON array")
    private String bulletPoints;

    @Schema(description = "Source provider name", example = "CJ_DROPSHIPPING")
    private String sourceProvider;

    @Schema(description = "Source product ID", example = "SKU12345")
    private String sourceId;

    @Schema(description = "Source product URL")
    private String sourceUrl;

    @Schema(description = "Product status: DRAFT|READY|ENRICHED|PUBLISHED|ARCHIVED", example = "DRAFT")
    private String status;

    @Schema(description = "Base price from source", example = "5.99")
    private BigDecimal basePrice;

    @Schema(description = "Cost price including shipping/customs", example = "8.50")
    private BigDecimal costPrice;

    @Schema(description = "Final selling price", example = "19.90")
    private BigDecimal sellingPrice;

    @Schema(description = "Margin percentage", example = "40.00")
    private BigDecimal margin;

    @Schema(description = "Currency code", example = "USD")
    private String currency;

    @Schema(description = "Tags as JSON")
    private String tags;

    @Schema(description = "SEO title")
    private String seoTitle;

    @Schema(description = "SEO description")
    private String seoDescription;

    @Schema(description = "SEO keywords")
    private String seoKeywords;

    @Schema(description = "Category ID", example = "1")
    private Long idCategory;

    @Schema(description = "Supplier ID", example = "1")
    private Long idSupplier;

    @Schema(description = "Whether the product is active", example = "true")
    private Boolean active;
}
