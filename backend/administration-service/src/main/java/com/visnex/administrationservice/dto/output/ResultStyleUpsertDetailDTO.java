package com.visnex.administrationservice.dto.output;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter; import lombok.Setter;

@Getter @Setter
@Schema(description = "Detalle de estilo guardado/actualizado")
public class ResultStyleUpsertDetailDTO {

    @Schema(description = "Primary key del Style", example = "101")
    private Long id;

    @Schema(description = "Nombre de la variable", example = "test")
    private String name;

    @Schema(description = "Valor", example = "value test")
    private String value;

    @Schema(description = "Tipo/Categoría", example = "button")
    private String type;

    @Schema(description = "Calificador", example = "header")
    private String typeValue;

    @Schema(description = "Activo", example = "true")
    private Boolean active;
}
