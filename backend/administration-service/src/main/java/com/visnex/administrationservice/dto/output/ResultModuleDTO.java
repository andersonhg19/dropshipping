package com.visnex.administrationservice.dto.output;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "Data result a module.")
public class ResultModuleDTO {

    @Schema(description = "Unique identifier of the type user.", example = "1")
    private Long id;

    @Schema(description = "Name of the type user.", example = "Admin")
    private String name;

    @Schema(description = "Identifier of the User that creates or updates the record", example = "5", required = true)
    private Long idModifiedBy;

    @Schema(description = "Name of the person who made the modification.", example = "User System")
    private String modifiedBy;

    @Schema(description = "Indicates whether module is active.", example = "true")
    private Boolean active;

}
