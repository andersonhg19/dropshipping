package com.visnex.administrationservice.dto.output;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "Data required to save or update a type user.")
public class ResultTypeUserDTO {

    @Schema(description = "Primary key of the TypeUser; omit when creating a new record", example = "1", required = false)
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

    @Schema(description = "Human-readable name of the TypeUser", example = "Administrator", required = true)
    private String name;

    @Schema(description = "Indicates whether the TypeUser is active", example = "true", required = true)
    private Boolean active;

}
