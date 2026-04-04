package com.visnex.administrationservice.dto.input.dataSeed;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PagesSeedDTO {
    public Long id;
    public String npage;
    public String name;
    public String icon;

    @JsonProperty("idUser")
    public Long idModifiedBy;

    @JsonProperty("idModule")
    public Long idModule;

    @JsonProperty("isActive")
    public Boolean active;
}