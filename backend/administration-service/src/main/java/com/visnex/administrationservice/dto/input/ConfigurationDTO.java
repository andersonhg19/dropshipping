package com.visnex.administrationservice.dto.input;

import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/** Data Transfer Object to create or update a Configuration record. */
@Getter
@Setter
@Schema(name = "ConfigurationDTO", description = "DTO used to create or update a Configuration record")
public class ConfigurationDTO {

    @Schema(description = "Primary key of the Configuration; omit when creating a new record", example = "1", required = false)
    private Long id;

    @Schema(description = "Identifier of the Company that owns the Configuration", example = "10", required = true)
    private Long idCompany;

    @Schema(description = "Identifier of the Subsidiary (nullable when global to Company)", example = "20", required = false)
    private Long idSubsidiary;

    @Schema(description = "Identifier of the User that creates or updates the record", example = "5", required = true)
    private Long idModifiedBy;

    @Schema(description = "Optional category or configuration type", example = "email", required = false)
    private String type;

    @Schema(description = "Configuration key or name", example = "smtpServer", required = true)
    private String name;

    @Schema(description = "Value assigned to the configuration key", example = "smtp.hexaq.com", required = true)
    private String value;

    @Schema(description = "Indicates whether the Configuration is active", example = "true", required = true)
    @JsonAlias("state")
    private Boolean active;
}
