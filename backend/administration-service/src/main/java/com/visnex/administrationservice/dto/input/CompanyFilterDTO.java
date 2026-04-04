package com.visnex.administrationservice.dto.input;

import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/** DTO used to filter and paginate Company records. */
@Getter
@Setter
@Schema(name = "CompanyFilterDTO", description = "DTO used to filter and paginate Company records")
public class CompanyFilterDTO {

        @Schema(description = "Primary key of the Company for direct lookup", example = "1", required = false)
        private Long id;

        @Schema(description = "Legal or commercial name of the Company", example = "Company S.A.", required = false)
        private String name;

        @Schema(description = "Tax identification number (NIT)", example = "900123456-7", required = false)
        private String nit;

        @Schema(description = "Company address", example = "123 Main St, Bogotá", required = false)
        private String address;

        @Schema(description = "Legal representative who signs documents", example = "Jane Doe", required = false)
        private String legalRepresentative;

        @Schema(description = "Company phone number", example = "+57 1 555 1234", required = false)
        private String phone;

        @Schema(description = "Company e-mail address", example = "info@hexaq.com", required = false)
        private String email;

        @Schema(description = "URL or file name of the Company logo/image", example = "logo.png", required = false)
        private String image;

        @Schema(description = "Flag indicating whether the Company is active", example = "true", required = false)
        @JsonAlias("state")
        private Boolean active;

        @Schema(description = "Identifier of the User that created or updated the Company", example = "5", required = false)
        private Long idModifiedBy;

        @Schema(description = "Start date for date-range filtering", example = "2025-01-01", required = false)
        private LocalDateTime startDate;

        @Schema(description = "End date for date-range filtering", example = "2025-12-31", required = false)
        private LocalDateTime endDate;

        @Schema(description = "Page number starting at 0", example = "0", required = true)
        private Integer page;

        @Schema(description = "Number of records per page", example = "20", required = true)
        private Integer size;
}
