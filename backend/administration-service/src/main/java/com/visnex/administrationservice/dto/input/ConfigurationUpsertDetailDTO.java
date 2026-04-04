// ConfigurationUpsertDetailDTO.java
package com.visnex.administrationservice.dto.input;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter; import lombok.Setter;

@Getter @Setter
@Schema(name = "ConfigurationUpsertDetailDTO", description = "One configuration to upsert")
public class ConfigurationUpsertDetailDTO {

    @Schema(description = "Primary key of Configuration. Empty string => create.", example = "")
    private String id;

    @Schema(description = "Configuration key or name", example = "smtpServer", required = true)
    private String name;

    @Schema(description = "Value assigned to the configuration key", example = "smtp.hexaq.com", required = true)
    private String value;

    @Schema(description = "Optional type/category", example = "email")
    private String type;

    @Schema(description = "Active flag", example = "true")
    private Boolean active;
}
