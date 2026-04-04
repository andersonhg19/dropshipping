package com.visnex.administrationservice.dto.input;

import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/** DTO used to filter and paginate PageTypeUser records. */
@Getter
@Setter
@Schema(name = "PageTypeUserFilterDTO", description = "DTO used to filter and paginate PageTypeUser records")
public class PageTypeUserFilterDTO {

        @Schema(description = "Page number starting at 0", example = "0", required = true)
        private Integer page;

        @Schema(description = "Number of records per page", example = "20", required = true)
        private Integer size;

        @Schema(description = "Primary key of the PageTypeUser for direct lookup", example = "1", required = false)
        private Long id;

        @Schema(description = "Identifier of the Page", example = "15", required = false)
        private Long idPage;

        @Schema(description = "Identifier of the TypeUser", example = "3", required = false)
        private Long idTypeUser;

        @Schema(description = "Identifier of the User that created or updated the record", example = "5", required = false)
        private Long idModifiedBy;

        @Schema(description = "Permission flag for create action", example = "true", required = false)
        private Boolean canCreate;

        @Schema(description = "Permission flag for update action", example = "true", required = false)
        private Boolean canUpdate;

        @Schema(description = "Permission flag for read action", example = "true", required = false)
        private Boolean canRead;

        @Schema(description = "Permission flag for delete action", example = "false", required = false)
        private Boolean canDelete;

        @Schema(description = "Indicates whether the mapping is active", example = "true", required = false)
        @JsonAlias("state")
        private Boolean active;

        @Schema(description = "Start date for date-range filtering", example = "2025-01-01", required = false)
        private LocalDateTime startDate;

        @Schema(description = "End date for date-range filtering", example = "2025-12-31", required = false)
        private LocalDateTime endDate;
}
