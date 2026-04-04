package com.visnex.administrationservice.dto.input;

import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/** DTO used to filter and paginate TypeUser records. */
@Getter
@Setter
@Schema(name = "TypeUserFilterDTO", description = "DTO used to filter and paginate TypeUser records")
public class TypeUserFilterDTO {

        @Schema(description = "Page number starting at 0", example = "0", required = true)
        private Integer page;

        @Schema(description = "Number of records per page", example = "20", required = true)
        private Integer size;

        @Schema(description = "Primary key of the TypeUser for direct lookup", example = "1", required = false)
        private Long id;

        @Schema(description = "Identifier of the Company that owns the TypeUser", example = "10", required = false)
        private Long idCompany;

        @Schema(description = "Identifier of the Subsidiary that owns the TypeUser", example = "20", required = false)
        private Long idSubsidiary;

        @Schema(description = "Identifier of the User that created or updated the TypeUser", example = "5", required = false)
        private Long idModifiedBy;

        @Schema(description = "Human-readable name of the TypeUser", example = "Administrator", required = false)
        private String name;

        @Schema(description = "Flag indicating whether the TypeUser is active", example = "true", required = false)
        @JsonAlias("state")
        private Boolean active;

        @Schema(description = "Start date for date-range filtering", example = "2025-01-01", required = false)
        private LocalDateTime startDate;

        @Schema(description = "End date for date-range filtering", example = "2025-12-31", required = false)
        private LocalDateTime endDate;
}
