package com.visnex.administrationservice.dto.input;

import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

/** DTO used to create multiple PageTypeUser records in a single request. */
@Getter
@Setter
@Schema(name = "PageTypeUserSaveDTO", description = "DTO used to create multiple PageTypeUser records in a single request")
public class PageTypeUserSaveDTO {


    @Schema(description = "Identifier of the TypeUser", example = "3", required = true)
    private Long idTypeUser;

    @Schema(description = "Identifier of the User that creates the record", example = "5", required = true)
    private Long idModifiedBy;

    @ArraySchema(
            schema = @Schema(implementation = PageTypeUserSaveDetailDTO.class, description = "List of mappings to create", required = true)
    )
    private List<PagesListDTO> pages;
}
