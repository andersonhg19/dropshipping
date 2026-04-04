package com.visnex.acquisitionservice.dto.output;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "Output DTO for Supplier records")
public class ResultSupplierDTO {

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

    @Schema(description = "Supplier name", example = "CJ Dropshipping")
    private String name;

    @Schema(description = "Supplier type", example = "CJ_DROPSHIPPING")
    private String type;

    @Schema(description = "Country of origin", example = "CN")
    private String country;

    @Schema(description = "Contact info", example = "support@cjdropshipping.com")
    private String contact;

    @Schema(description = "Estimated shipping days", example = "15")
    private Integer shippingDays;

    @Schema(description = "Notes", example = "Reliable for electronics")
    private String notes;

    @Schema(description = "Reliability score", example = "4.2")
    private Double reliabilityScore;

    @Schema(description = "Active flag", example = "true")
    private Boolean active;
}
