package com.visnex.administrationservice.dto.input.dataSeed;

import com.fasterxml.jackson.annotation.JsonProperty;

public class TypeUserSeedDTO {
    public Object id;

    public String name;

    @JsonProperty("isActive")
    public Boolean active;          // mapear isActive -> active

    public Object idCompany;        // obligatorio para cumplir NOT NULL
    public Object idSubsidiary;     // si no usas subsidiary, puedes omitir
    @JsonProperty("idUser")
    public Object idModifiedBy;     // el “actor”, lo backfilleamos luego
}
