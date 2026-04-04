package com.visnex.administrationservice.dto.output;

import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter; import lombok.Setter;

import java.util.List;

@Getter @Setter
@Schema(description = "Respuesta para upsert de estilos (crea/actualiza) en lote")
public class ResultStyleUpsertListDTO {

    @Schema(description = "Company ID", example = "1")
    private Long idCompany;

    @Schema(description = "Nombre de la compañía", example = "My Company")
    private String companyName;

    @Schema(description = "Subsidiary ID (nullable)", example = "1")
    private Long idSubsidiary;

    @Schema(description = "Nombre de la subsidiaria", example = "Sucursal 1")
    private String subsidiaryName;

    @Schema(description = "User ID que modifica", example = "1")
    private Long idModifiedBy;

    @Schema(description = "Nombre del usuario que modifica", example = "User System")
    private String modifiedBy;

    @ArraySchema(schema = @Schema(implementation = ResultStyleUpsertDetailDTO.class))
    private List<ResultStyleUpsertDetailDTO> details;
}
