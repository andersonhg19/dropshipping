package com.visnex.administrationservice.dto.input.dataSeed;

import com.fasterxml.jackson.annotation.JsonProperty;

public class UserSeedDTO {
    public Long id;
    public Long idCompany;

    // Está en el JSON
    public Long idSubsidiary;

    public Long idTypeUser;

    @JsonProperty("idUser")
    public Long idModifiedBy;

    public String name;
    public String lastName;
    public String email;
    public String dni;
    public String cellphone;
    public String password;

    @JsonProperty("isAdmin")
    public Boolean admin;

    @JsonProperty("isActive")
    public Boolean active;
}