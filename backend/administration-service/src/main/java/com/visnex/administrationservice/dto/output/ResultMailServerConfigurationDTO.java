package com.visnex.administrationservice.dto.output;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "Full data returned for a Mail-Server configuration.")
public class ResultMailServerConfigurationDTO {

    /* ---------- Identifiers ---------- */
    @Schema(description = "Unique identifier of the configuration.", example = "42")
    private Long id;

    @Schema(description = "Company ID associated with the configuration.", example = "100")
    private Long idCompany;

    @Schema(description = "Company name.", example = "My Company")
    private String companyName;

    @Schema(description = "Subsidiary ID associated with the configuration.", example = "200")
    private Long idSubsidiary;

    @Schema(description = "Subsidiary name.", example = "Main Branch")
    private String subsidiaryName;

    @Schema(description = "ID of the user who last modified the record.", example = "5")
    private Long idModifiedBy;

    @Schema(description = "Name of the person who made the modification.", example = "System User")
    private String modifiedBy;

    /* ---------- Mail server data ---------- */
    @Schema(description = "Configuration name.", example = "Main SMTP Server")
    private String name;

    @Schema(description = "SMTP host.", example = "smtp.example.com")
    private String host;

    @Schema(description = "SMTP port.", example = "587")
    private String port;

    @Schema(description = "Authentication username.", example = "noreply@example.com")
    private String username;

    @Schema(description = "Alias shown as sender.", example = "My Company CRM")
    private String alias;

    @Schema(description = "Mail protocol used.", example = "smtp")
    private String protocol;

    /* ---------- Flags ---------- */
    @Schema(description = "Indicates if the server requires authentication.", example = "true")
    private Boolean auth;

    @Schema(description = "Indicates if the configuration is enabled.", example = "false")
    private Boolean enable;

    @Schema(description = "Indicates if the record is active.", example = "true")
    private Boolean active;
}
