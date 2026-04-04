package com.visnex.administrationservice.dto.input.dataSeed;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class ConfigurationSeedDTO {
    public Object id;
    public Object idCompany;     // "1"
    public Object idSubsidiary;  // 1
    public String name;
    public String value;
    public String type;
    public Object idUser;        // "1"  -> modifiedBy
    public Boolean active;
}
