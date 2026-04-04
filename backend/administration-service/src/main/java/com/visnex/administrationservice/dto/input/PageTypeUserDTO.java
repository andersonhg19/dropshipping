package com.visnex.administrationservice.dto.input;

import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/** Data Transfer Object to create or update a PageTypeUser record. */
@Getter
@Setter
@Schema(name = "PageTypeUserDTO", description = "DTO used to create or update a PageTypeUser record")
public class PageTypeUserDTO {

    @Schema(description = "Primary key of the PageTypeUser; omit when creating a new record", example = "1", required = false)
    private Long id;

    @Schema(description = "Identifier of the Page", example = "15", required = true)
    private Long idPage;

    @Schema(description = "Identifier of the TypeUser", example = "3", required = true)
    private Long idTypeUser;

    @Schema(description = "Identifier of the User that creates or updates the record", example = "5", required = true)
    private Long idModifiedBy;

    @Schema(description = "Permission flag for create action", example = "true", required = true)
    private Boolean canCreate;

    @Schema(description = "Permission flag for update action", example = "true", required = true)
    private Boolean canUpdate;

    @Schema(description = "Permission flag for read action", example = "true", required = true)
    private Boolean canRead;

    @Schema(description = "Permission flag for delete action", example = "false", required = true)
    private Boolean canDelete;

    @Schema(description = "Indicates whether the mapping is active", example = "true", required = true)
    @JsonAlias("state")
    private Boolean active;
}
