package com.visnex.acquisitionservice.dto.input;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(name = "SupplierDTO", description = "DTO used to create or update a Supplier record")
public class SupplierDTO {

    @Schema(description = "Primary key; omit when creating a new record", example = "1")
    private Long id;

    @NotNull
    @Schema(description = "Company identifier", example = "1", required = true)
    private Long idCompany;

    @Schema(description = "Subsidiary identifier", example = "1")
    private Long idSubsidiary;

    @Schema(description = "User who creates or updates the record", example = "5")
    private Long idModifiedBy;

    @NotBlank
    @Schema(description = "Supplier name", example = "CJ Dropshipping", required = true)
    private String name;

    @Schema(description = "Supplier type: CJ_DROPSHIPPING, EPROLO, ALIEXPRESS, LOCAL, OTHER", example = "CJ_DROPSHIPPING")
    private String type;

    @Schema(description = "Country of origin", example = "CN")
    private String country;

    @Schema(description = "Contact info", example = "support@cjdropshipping.com")
    private String contact;

    @Schema(description = "Estimated shipping days", example = "15")
    private Integer shippingDays;

    @Schema(description = "Notes about the supplier", example = "Reliable for electronics")
    private String notes;

    @Schema(description = "Reliability score from 0 to 5", example = "4.2")
    private Double reliabilityScore;

    @Schema(description = "Whether the supplier is active", example = "true")
    private Boolean active;
}
