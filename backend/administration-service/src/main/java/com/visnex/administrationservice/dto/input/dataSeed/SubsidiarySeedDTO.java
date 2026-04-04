// SubsidiarySeedDTO.java
package com.visnex.administrationservice.dto.input.dataSeed;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class SubsidiarySeedDTO {
    public Object id;
    public String name;
    public Object idCompany;     // viene como "1" en tu JSON
    public String nit;
    public String address;
    public String contactPerson;
    public String phone;
    public String mail;
    public Boolean state;
    public Integer decimalsNumber;   // 2
    public String roundingType;      // "STANDARD"
    public Object idUser;            // para backfill modifiedBy
}
