package com.visnex.administrationservice.dto.output;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter; import lombok.Setter;

@Getter @Setter
@Schema(description = "Detalle de configuración guardada/actualizada")
public class ResultConfigurationUpsertDetailDTO {
    private Long id;
    private String name;
    private String value;
    private String type;
    private Boolean active;
}
