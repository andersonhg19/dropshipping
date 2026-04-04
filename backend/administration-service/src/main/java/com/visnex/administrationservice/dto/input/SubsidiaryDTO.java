package com.visnex.administrationservice.dto.input;

import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(name = "SubsidiaryDTO", description = "DTO used to create or update a Subsidiary record")
public class SubsidiaryDTO {

    @Schema(description = "Primary key of the Subsidiary; omit when creating a new record", example = "1", required = false)
    private Long id;

    @Schema(description = "Identifier of the Company that owns the Subsidiary", example = "10", required = true)
    private Long idCompany;

    @Schema(description = "Identifier of the User that creates or updates the record", example = "5", required = true)
    private Long idModifiedBy;

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
    @JsonAlias("state")
    private Boolean active;
}
