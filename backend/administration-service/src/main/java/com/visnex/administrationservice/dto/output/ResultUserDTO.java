package com.visnex.administrationservice.dto.output;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "Data required to save or update a user.")
public class ResultUserDTO {

    @Schema(description = "Unique identifier of the user. Optional in creation.", example = "1")
    private Long id;

    @Schema(description = "Company ID associated with the user.", example = "100")
    private Long idCompany;

    @Schema(description = "name of the company.", example = "My Company")
    private String companyName;

    @Schema(description = "Subsidiary ID associated with the user.", example = "200")
    private Long idSubsidiary;

    @Schema(description = "Name of the subsidiary.", example = "Subsidiary Name")
    private String subsidiaryName;

    @Schema(description = "ID of the user who created or updated this record.", example = "5")
    private Long idModifiedBy;

    @Schema(description = "Name of the person who made the modification.", example = "User System")
    private String modifiedBy;

    @Schema(description = "User type ID.", example = "3")
    private Long idTypeUser;

    @Schema(description = "Name of the type user or rol.", example = "admin")
    private String typeUserName;


    @Schema(description = "name of the user.", example = "Carlos")
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

    @Schema(description = "Indicates whether the user is active.", example = "true")
    private Boolean active;
}
