package com.visnex.administrationservice.dto.input;

import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "Data required to create or update a Mail-Server configuration.")
public class MailServerConfigurationDTO {

    @Schema(description = "Unique identifier of the record. Optional on creation.", example = "42")
    private Long id;

    /* ---------- Foreign keys ---------- */
    @Schema(description = "Company ID associated with the configuration.", example = "100")
    private Long idCompany;

    @Schema(description = "Subsidiary ID associated with the configuration (optional).", example = "200")
    private Long idSubsidiary;

    @Schema(description = "ID of the user who performs the modification.", example = "5")
    private Long idModifiedBy;

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

    @Schema(description = "Authentication password.", example = "S3cr3tP@ss")
    private String password;

    @Schema(description = "Mail protocol used.", example = "smtp")
    private String protocol;

    @Schema(description = "Indicates if the server requires authentication.", example = "true", defaultValue = "true")
    private Boolean auth;

    @Schema(description = "Enables or disables the configuration for sending emails.", example = "false", defaultValue = "false")
    private Boolean enable;

    @Schema(description = "Logical delete flag.", example = "true", defaultValue = "true")
    @JsonAlias("state")
    private Boolean active;
}
