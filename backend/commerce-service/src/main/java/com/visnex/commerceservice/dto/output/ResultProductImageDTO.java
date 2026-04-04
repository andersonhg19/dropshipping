package com.visnex.commerceservice.dto.output;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "Output DTO for ProductImage records")
public class ResultProductImageDTO {

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

    @Schema(description = "Product ID")
    private Long idProduct;

    @Schema(description = "Image URL")
    private String url;

    @Schema(description = "Image source")
    private String source;

    @Schema(description = "Is primary image")
    private Boolean isPrimary;

    @Schema(description = "Alt text")
    private String altText;

    @Schema(description = "Sort order")
    private Integer sortOrder;

    @Schema(description = "Active flag")
    private Boolean active;
}
