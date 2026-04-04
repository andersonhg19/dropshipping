package com.visnex.administrationservice.dto.input;

import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Schema(description = "Filter DTO for searching User entities.")
@Getter
@Setter
public class UserFilterDTO {

    @Schema(description = "Requested page number.", example = "1", required = true)
    private Integer page;

    @Schema(description = "Number of records per page.", example = "10", required = true)
    private Integer size;

    @Schema(description = "User ID for direct filtering.", example = "1")
    private Long id;

    @Schema(description = "Company ID associated with the user.", example = "100")
    private Long idCompany;

    @Schema(description = "Subsidiary ID associated with the user.", example = "200")
    private Long idSubsidiary;

    @Schema(description = "ID of the user who last modified the record.", example = "5")
    private Long idModifiedBy;

    @Schema(description = "User type ID.", example = "3")
    private Long idTypeUser;

    @Schema(description = "First name of the user.", example = "Carlos")
    private String name;

    @Schema(description = "Last name of the user.", example = "Ramírez")
    private String lastName;

    @Schema(description = "User's email address.", example = "user@example.com")
    private String email;

    @Schema(description = "User's national identification number.", example = "12345678")
    private String dni;

    @Schema(description = "User's cellphone number.", example = "3001234567")
    private String cellphone;

    @Schema(description = "Flag indicating if the user has administrative privileges.", example = "false")
    private Boolean admin;

    @Schema(description = "Indicates whether the user is active.", example = "true")
    @JsonAlias("state")
    private Boolean active;

    @Schema(description = "Start date for filtering.", example = "2024-01-01T00:00:00")
    private LocalDateTime startDate;

    @Schema(description = "End date for filtering.", example = "2024-12-31T23:59:59")
    private LocalDateTime endDate;
}
