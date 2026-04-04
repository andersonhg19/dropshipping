package com.visnex.commerceservice.dto.input;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Schema(name = "ProductImageFilterDTO", description = "DTO used to filter and paginate ProductImage records")
public class ProductImageFilterDTO {

    @Schema(description = "Primary key for direct lookup", example = "1")
    private Long id;

    @Schema(description = "Company identifier", example = "1")
    private Long idCompany;

    @Schema(description = "Subsidiary identifier", example = "1")
    private Long idSubsidiary;

    @Schema(description = "Product ID", example = "1")
    private Long idProduct;

    @Schema(description = "Image source", example = "PROVIDER")
    private String source;

    @Schema(description = "Is primary image", example = "true")
    private Boolean isPrimary;

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
