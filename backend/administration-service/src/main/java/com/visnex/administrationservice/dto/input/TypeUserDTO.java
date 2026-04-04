package com.visnex.administrationservice.dto.input;

import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/** Data Transfer Object to create or update a TypeUser record. */
@Getter
@Setter
@Schema(name = "TypeUserDTO", description = "DTO used to create or update a TypeUser record")
public class TypeUserDTO {

    @Schema(description = "Primary key of the TypeUser; omit when creating a new record", example = "1", required = false)
    private Long id;

    @Schema(description = "Identifier of the Company that owns the TypeUser", example = "10", required = true)
    private Long idCompany;

    @Schema(description = "Identifier of the Subsidiary that owns the TypeUser", example = "20", required = true)
    private Long idSubsidiary;

    @Schema(description = "Identifier of the User that creates or updates the record", example = "5", required = true)
    private Long idModifiedBy;

    @Schema(description = "Human-readable name of the TypeUser", example = "Administrator", required = true)
    private String name;

    @Schema(description = "Indicates whether the TypeUser is active", example = "true", required = true)
    @JsonAlias("state")
    private Boolean active;
}
