package com.visnex.administrationservice.dto.input.dataSeed;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PageTypeUserSeedDTO {
    public Long id;
    @JsonProperty("pages_id") public Long idPage;
    public Long idTypeUser;
    @JsonProperty("idUser") public Long idModifiedBy;
    @JsonProperty("isCreate") public Boolean canCreate;
    @JsonProperty("isUpdate") public Boolean canUpdate;
    @JsonProperty("isRead")   public Boolean canRead;
    @JsonProperty("isDelete") public Boolean canDelete;
    @JsonProperty("isActive") public Boolean active;
}