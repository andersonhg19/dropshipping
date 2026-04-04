package com.visnex.administrationservice.dto.input;

import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/** Data Transfer Object to create or update a Company record. */
@Getter
@Setter
@Schema(name = "CompanyDTO", description = "DTO used to create or update a Company record")
public class CompanyDTO {

    @Schema(description = "Primary key of the Company; omit when creating a new record", example = "1", required = false)
    private Long id;

    @Schema(description = "Legal or commercial name of the Company", example = "Company S.A.", required = true)
    private String name;

    @Schema(description = "Tax identification number (NIT)", example = "900123456-7", required = true)
    private String nit;

    @Schema(description = "Company address", example = "123 Main St, Bogotá", required = false)
    private String address;

    @Schema(description = "Legal representative who signs documents", example = "Jane Doe", required = false)
    private String legalRepresentative;

    @Schema(description = "Company phone number", example = "+57 1 555 1234", required = false)
    private String phone;

    @Schema(description = "Company e-mail address", example = "info@hexaq.com", required = false)
    private String email;

    @Schema(description = "URL or file name of the Company logo/image", example = "logo.png", required = false)
    private String image;

    @Schema(description = "Indicates whether the Company is active", example = "true", required = true)
    @JsonAlias("state")
    private Boolean active;

    @Schema(description = "Identifier of the User that creates or updates the record", example = "5", required = true)
    private Long idModifiedBy;
}
