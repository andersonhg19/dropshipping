package com.visnex.administrationservice.dto.output;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "Data required to save or update a page.")
public class ResultPagesDTO {

    @Schema(description = "Unique identifier of the page.", example = "1")
    private Long id;

    @Schema(description = "Number of the page.", example = "Page1")
    private String npage;

    @Schema(description = "Icon of the page.", example = "icon.png")
    private String icon;

    @Schema(description = "Name of the page.", example = "Dashboard")
    private String name;

    @Schema(description = "Identifier of the User that creates or updates the record", example = "5", required = true)
    private Long idModifiedBy;

    @Schema(description = "Name of the person who made the modification.", example = "User System")
    private String modifiedBy;

    @Schema(description = "ID of the module to which the page belongs.", example = "module1")
    private Long idModule;

    @Schema(description = "ID of the module to which the page belongs.", example = "module1")
    private String moduleName;

    @Schema(description = "State of the page.", example = "true")
    private Boolean active;

}
