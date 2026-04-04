package com.visnex.administrationservice.dto.input;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter; import lombok.Setter;

@Getter @Setter
@Schema(name = "StyleDetailSaveDTO", description = "One style item to upsert")
public class StyleUpsertDetailDTO {

    @Schema(description = "Primary key of Style. Empty string means new.", example = "''")
    private String id;

    @Schema(description = "Style variable name", example = "test", required = true)
    private String name;

    @Schema(description = "Value", example = "value test", required = true)
    private String value;

    @Schema(description = "Category (e.g., button)", example = "button")
    private String type;

    @Schema(description = "Qualifier (e.g., header/footer)", example = "header")
    private String typeValue;

    @Schema(description = "Active flag", example = "true")
    private Boolean active;
}
