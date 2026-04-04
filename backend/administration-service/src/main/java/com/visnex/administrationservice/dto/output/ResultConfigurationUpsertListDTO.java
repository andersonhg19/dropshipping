package com.visnex.administrationservice.dto.output;

import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter; import lombok.Setter;
import java.util.List;

@Getter @Setter
@Schema(description = "Respuesta de upsert (encabezado + lista de configuraciones)")
public class ResultConfigurationUpsertListDTO {

    private Long idCompany;
    private String companyName;

    private Long idSubsidiary;
    private String subsidiaryName;

    private Long idModifiedBy;
    private String modifiedBy;

    @ArraySchema(schema = @Schema(implementation = ResultConfigurationUpsertDetailDTO.class))
    private List<ResultConfigurationUpsertDetailDTO> details;
}
