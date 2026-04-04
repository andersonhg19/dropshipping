package com.visnex.administrationservice.dto.input;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter; import lombok.Setter;

@Getter @Setter
public class PagesListDTO {
    @Schema(example = "10")  private Long idPage;
    @Schema(example = "true") private Boolean canCreate;
    @Schema(example = "true") private Boolean canUpdate;
    @Schema(example = "true") private Boolean canRead;
    @Schema(example = "false")private Boolean canDelete;
    @Schema(example = "true") private Boolean active;
}
