package com.visnex.administrationservice.dto.input;

import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Schema(description = "Parameters to filter Mail-Server configurations in pageable queries.")
public class MailServerConfigurationFilterDTO {

        /* ---------- Pagination (obligatorio) ---------- */
        @Schema(description = "Page number (0-based).", example = "0", required = true)
        private Integer page;

        @Schema(description = "Page size.", example = "20", required = true)
        private Integer size;

        /* ---------- General filters ---------- */
        @Schema(description = "Unique identifier of the record.", example = "42")
        private Long id;

        @Schema(description = "Company ID.", example = "100")
        private Long idCompany;

        @Schema(description = "Subsidiary ID.", example = "200")
        private Long idSubsidiary;

        @Schema(description = "User ID that last modified the record.", example = "5")
        private Long idModifiedBy;

        @Schema(description = "Configuration name (partial match allowed).", example = "SMTP")
        private String name;

        @Schema(description = "Host (partial match allowed).", example = "smtp.example.com")
        private String host;

        @Schema(description = "Port.", example = "587")
        private String port;

        @Schema(description = "Username (partial match allowed).", example = "noreply@example.com")
        private String username;

        @Schema(description = "Alias (partial match allowed).", example = "My Company CRM")
        private String alias;

        @Schema(description = "Protocol.", example = "smtp")
        private String protocol;

        @Schema(description = "Filter by authentication requirement.", example = "true")
        private Boolean auth;

        @Schema(description = "Filter by enabled flag.", example = "false")
        private Boolean enable;

        @Schema(description = "Filter by active flag.", example = "true")
        @JsonAlias("state")
        private Boolean active;

        @Schema(description = "Start date for creation/last update range filter (inclusive).", example = "2025-01-01T00:00:00")
        private LocalDateTime startDate;

        @Schema(description = "End date for creation/last update range filter (inclusive).", example = "2025-12-31T23:59:59")
        private LocalDateTime endDate;
}
