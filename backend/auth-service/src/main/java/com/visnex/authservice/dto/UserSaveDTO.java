package com.visnex.authservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class UserSaveDTO {
    private Long id;
    @NotNull(message = "username cannot be null")
    private String username;
    @NotNull(message = "email cannot be null")
    private String email;
    private String password;
    private Boolean enabled;
    private List<Long> roles;

}
