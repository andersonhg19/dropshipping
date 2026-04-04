package com.visnex.administrationservice.dto.input;

import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/** Data Transfer Object to create or update a Module record. */
@Getter
@Setter
@Schema(name = "ModuleDTO", description = "DTO used to create or update a Module record")
public class ModuleDTO {

    @Schema(description = "Primary key of the Module; omit when creating a new record", example = "1", required = false)
    private Long id;

    @Schema(description = "Human-readable name of the Module", example = "Billing", required = true)
    private String name;

    @Schema(description = "Indicates whether the Module is active", example = "true", required = true)
    @JsonAlias("state")
    private Boolean active;

    @Schema(description = "Identifier of the User that creates or updates the record", example = "5", required = true)
    private Long idModifiedBy;
}
