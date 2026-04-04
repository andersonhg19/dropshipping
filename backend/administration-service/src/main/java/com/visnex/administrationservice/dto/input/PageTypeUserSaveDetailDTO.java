package com.visnex.administrationservice.dto.input;

import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/** Detail item used inside PageTypeUserSaveDTO for bulk operations. */
@Getter
@Setter
@Schema(name = "PageTypeUserSaveDetailDTO", description = "Detail item used inside PageTypeUserSaveDTO for bulk operations")
public class PageTypeUserSaveDetailDTO {

    @Schema(description = "Identifier of the Page", example = "15", required = true)
    private Long idPage;

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
