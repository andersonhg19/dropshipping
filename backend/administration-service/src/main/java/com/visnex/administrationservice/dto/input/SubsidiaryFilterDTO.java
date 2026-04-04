package com.visnex.administrationservice.dto.input;

import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/** DTO used to filter and paginate Subsidiary records. */
@Getter
@Setter
@Schema(name = "SubsidiaryFilterDTO", description = "DTO used to filter and paginate Subsidiary records")
public class SubsidiaryFilterDTO {

    @Schema(description = "Page number starting at 0", example = "0", required = true)
    private Integer page;

    @Schema(description = "Number of records per page", example = "20", required = true)
    private Integer size;

    @Schema(description = "Primary key of the Subsidiary for direct lookup", example = "1", required = false)
    private Long id;

    @Schema(description = "Identifier of the Company that owns the Subsidiary", example = "10", required = false)
    private Long idCompany;

    @Schema(description = "Identifier of the User that created or updated the Subsidiary", example = "5", required = false)
    private Long idModifiedBy;

    @Schema(description = "Legal or commercial name of the Subsidiary", example = "HQ Colombia", required = false)
    private String name;

    @Schema(description = "Tax identification number (NIT) of the Subsidiary", example = "901234567-8", required = false)
    private String nit;

    @Schema(description = "Subsidiary address", example = "Cra. 50 #100-20, Bogotá", required = false)
    private String address;

    @Schema(description = "Legal representative who signs documents", example = "John Doe", required = false)
    private String legalRepresentative;

    @Schema(description = "Subsidiary e-mail address", example = "contact@hq-co.com", required = false)
    private String email;

    @Schema(description = "Subsidiary phone number", example = "+57 1 555 9876", required = false)
    private String phone;

    @Schema(description = "URL or file name of the Subsidiary logo/image", example = "logo_co.png", required = false)
    private String image;

    @Schema(description = "Flag indicating whether the Subsidiary is active", example = "true", required = false)
    @JsonAlias("state")
    private Boolean active;

    @Schema(description = "Start date for date-range filtering", example = "2025-01-01", required = false)
    private LocalDateTime startDate;

    @Schema(description = "End date for date-range filtering", example = "2025-12-31", required = false)
    private LocalDateTime endDate;
}
