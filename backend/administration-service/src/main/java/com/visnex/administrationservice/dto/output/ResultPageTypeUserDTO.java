package com.visnex.administrationservice.dto.output;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter; import lombok.Setter;

@Getter @Setter
@Schema(description = "Flattened view for PageTypeUser")
public class ResultPageTypeUserDTO {
    private Long id;

    private Long idPage;
    private String pageName;
    private String npage;

    private Long idTypeUser;
    private String typeUserName;

    private Long idModifiedBy;
    private String modifiedBy;

    private Boolean canCreate;
    private Boolean canUpdate;
    private Boolean canRead;
    private Boolean canDelete;

    private Boolean active;
}