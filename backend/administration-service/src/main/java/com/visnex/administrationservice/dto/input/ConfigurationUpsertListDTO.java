package com.visnex.administrationservice.dto.input;

import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter; import lombok.Setter;
import java.util.List;

@Getter @Setter
@Schema(name = "ConfigurationUpsertListDTO", description = "Batch upsert for configurations")
public class ConfigurationUpsertListDTO {

    @Schema(description = "Company ID", example = "1", required = true)
    private Long idCompany;

    @Schema(description = "Subsidiary ID (nullable)", example = "1")
    private Long idSubsidiary;

    @Schema(description = "User who modifies", example = "1", required = true)
    private Long idModifiedBy;

    @ArraySchema(schema = @Schema(implementation = ConfigurationUpsertDetailDTO.class))
    private List<ConfigurationUpsertDetailDTO> details;
}
