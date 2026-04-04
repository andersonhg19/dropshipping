package com.visnex.administrationservice.dto.input.dataSeed;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ModuleSeedDTO {
    public Long id;
    public String name;
    public Boolean active;
    @JsonProperty("idUser")
    public Long idModifiedBy;
}