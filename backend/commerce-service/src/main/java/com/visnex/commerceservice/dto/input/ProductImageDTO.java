package com.visnex.commerceservice.dto.input;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(name = "ProductImageDTO", description = "DTO used to create or update a ProductImage record")
public class ProductImageDTO {

    @Schema(description = "Primary key; omit when creating a new record", example = "1")
    private Long id;

    @Schema(description = "Company identifier", example = "1", required = true)
    private Long idCompany;

    @Schema(description = "Subsidiary identifier", example = "1")
    private Long idSubsidiary;

    @Schema(description = "User who creates or updates the record", example = "5")
    private Long idModifiedBy;

    @Schema(description = "Product ID", example = "1", required = true)
    private Long idProduct;

    @Schema(description = "Image URL", example = "https://example.com/img.jpg", required = true)
    private String url;

    @Schema(description = "Image source: PROVIDER|PEXELS|UNSPLASH|UPLOADED", example = "PROVIDER")
    private String source;

    @Schema(description = "Is primary image", example = "false")
    private Boolean isPrimary;

    @Schema(description = "Alt text for the image", example = "Wireless earbuds front view")
    private String altText;

    @Schema(description = "Sort order", example = "0")
    private Integer sortOrder;

    @Schema(description = "Whether the image is active", example = "true")
    private Boolean active;
}
