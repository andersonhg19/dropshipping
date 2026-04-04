package com.visnex.commerceservice.dto.output;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Schema(description = "Output DTO for Product records")
public class ResultProductDTO {

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

    @Schema(description = "Name of the person who modified the record", example = "Admin User")
    private String modifiedBy;

    @Schema(description = "Product title")
    private String title;

    @Schema(description = "Enriched title (AI-generated)")
    private String enrichedTitle;

    @Schema(description = "Product description")
    private String description;

    @Schema(description = "Enriched description (AI-generated)")
    private String enrichedDescription;

    @Schema(description = "Bullet points as JSON array")
    private String bulletPoints;

    @Schema(description = "Source provider name")
    private String sourceProvider;

    @Schema(description = "Source product ID")
    private String sourceId;

    @Schema(description = "Source product URL")
    private String sourceUrl;

    @Schema(description = "Product status")
    private String status;

    @Schema(description = "Base price from source")
    private BigDecimal basePrice;

    @Schema(description = "Cost price including shipping/customs")
    private BigDecimal costPrice;

    @Schema(description = "Final selling price")
    private BigDecimal sellingPrice;

    @Schema(description = "Margin percentage")
    private BigDecimal margin;

    @Schema(description = "Currency code")
    private String currency;

    @Schema(description = "Tags as JSON")
    private String tags;

    @Schema(description = "SEO title")
    private String seoTitle;

    @Schema(description = "SEO description")
    private String seoDescription;

    @Schema(description = "SEO keywords")
    private String seoKeywords;

    @Schema(description = "Category ID")
    private Long idCategory;

    @Schema(description = "Supplier ID")
    private Long idSupplier;

    @Schema(description = "Active flag")
    private Boolean active;
}
