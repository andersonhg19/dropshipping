package com.visnex.administrationservice.dto.output;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "Data required to save or update a company.")
public class ResultConfigurationDTO {

    @Schema(description = "Primary key of the Configuration; omit when creating a new record", example = "1", required = false)
    private Long id;

    @Schema(description = "Company ID associated with the user.", example = "100")
    private Long idCompany;

    @Schema(description = "name of the company.", example = "My Company")
    private String companyName;

    @Schema(description = "Subsidiary ID associated with the user.", example = "200")
    private Long idSubsidiary;

    @Schema(description = "Name of the subsidiary.", example = "Subsidiary Name")
    private String subsidiaryName;

    @Schema(description = "ID of the user who created or updated this record.", example = "5")
    private Long idModifiedBy;

    @Schema(description = "Name of the person who made the modification.", example = "User System")
    private String modifiedBy;

    @Schema(description = "Optional category or configuration type", example = "email", required = false)
    private String type;

    @Schema(description = "Configuration key or name", example = "smtpServer", required = true)
    private String name;

    @Schema(description = "Value assigned to the configuration key", example = "smtp.hexaq.com", required = true)
    private String value;

    @Schema(description = "Indicates whether the Configuration is active", example = "true", required = true)
    private Boolean active;

}

