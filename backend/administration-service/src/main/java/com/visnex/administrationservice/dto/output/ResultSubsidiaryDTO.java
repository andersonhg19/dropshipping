package com.visnex.administrationservice.dto.output;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "response to the different methods.")
public class ResultSubsidiaryDTO {

    @Schema(description = "Primary key of the Subsidiary; omit when creating a new record", example = "1", required = false)
    private Long id;

    @Schema(description = "Company ID associated with the user.", example = "100")
    private Long idCompany;

    @Schema(description = "name of the company.", example = "My Company")
    private String companyName;

    @Schema(description = "ID of the user who created or updated this record.", example = "5")
    private Long idModifiedBy;

    @Schema(description = "Name of the person who made the modification.", example = "User System")
    private String modifiedBy;

    @Schema(description = "Legal or commercial name of the Subsidiary", example = "HQ Colombia", required = true)
    private String name;

    @Schema(description = "Tax identification number (NIT) of the Subsidiary", example = "901234567-8", required = true)
    private String nit;

    @Schema(description = "Subsidiary address", example = "Cra. 50 #100-20, Bogotá", required = false)
    private String address;

    @Schema(description = "Legal representative who signs documents", example = "John Doe", required = false)
    private String legalRepresentative;

    @Schema(description = "Subsidiary e-mail address", example = "contact@hq-co.com", required = false)
    private String email;

    @Schema(description = "Subsidiary phone number", example = "+57 1 555 9876", required = false)
    private String phone;

    @Schema(description = "URL or file name of the Subsidiary logo/image", example = "logo_co.png", required = false)
    private String image;

    @Schema(description = "Indicates whether the Subsidiary is active", example = "true", required = true)
    private Boolean active;

}
