package com.visnex.administrationservice.dto.input;

import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/** Data Transfer Object to create or update a Pages record. */
@Getter
@Setter
@Schema(name = "PagesDTO", description = "DTO used to create or update a Pages record")
public class PagesDTO {

    @Schema(description = "Primary key of the Pages; omit when creating a new record", example = "1", required = false)
    private Long id;

    @Schema(description = "Identifier of the Module that owns the page", example = "10", required = true)
    private Long idModule;

    @Schema(description = "Identifier of the User that creates or updates the record", example = "5", required = true)
    private Long idModifiedBy;

    @Schema(description = "Human-readable name of the page", example = "Dashboard", required = true)
    private String name;

    @Schema(description = "Unique code or path for the page", example = "/dashboard", required = true)
    private String npage;

    @Schema(description = "Icon associated with the page", example = "fa fa-home", required = false)
    private String icon;

    @Schema(description = "Indicates whether the page is active", example = "true", required = true)
    @JsonAlias("state")
    private Boolean active;
}
