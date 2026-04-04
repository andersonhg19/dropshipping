package com.visnex.administrationservice.dto.input;

import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Schema(description = "Input DTO for creating or updating a User.")
@Getter
@Setter
public class UserDTO {

    @Schema(description = "Unique identifier of the user. Optional in creation.", example = "1")
    private Long id;

    @Schema(description = "Company ID associated with the user.", example = "100")
    private Long idCompany;

    @Schema(description = "Subsidiary ID associated with the user.", example = "200")
    private Long idSubsidiary;

    @Schema(description = "ID of the user who created or updated this record.", example = "5")
    @NotNull(message = "idModifiedBy is required")
    private Long idModifiedBy;

    @Schema(description = "User type ID.", example = "3")
    private Long idTypeUser;

    @Schema(description = "First name of the user.", example = "Carlos")
    private String name;

    @Schema(description = "Last name of the user.", example = "Ramírez")
    private String lastName;

    @Schema(description = "User's email address.", example = "user@example.com")
    private String email;

    @Schema(description = "User's national identification number.", example = "12345678")
    private String dni;

    @Schema(description = "User's cellphone number.", example = "3001234567")
    private String cellphone;

    @Schema(description = "User's password.", example = "password123")
    private String password;

    @Schema(description = "Flag indicating if the user has administrative privileges.", example = "false")
    private Boolean admin;

    @Schema(description = "Indicates whether the user is active.", example = "true")
    @JsonAlias("state")
    private Boolean active;
}
