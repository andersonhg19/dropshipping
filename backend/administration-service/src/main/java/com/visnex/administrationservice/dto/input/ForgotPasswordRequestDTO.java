package com.visnex.administrationservice.dto.input;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "Data required to reset a user's password.")
public class ForgotPasswordRequestDTO {

    @NotBlank
    @Email
    private String email;

}
