 package com.visnex.administrationservice.dto.input;

 import io.swagger.v3.oas.annotations.media.Schema;
 import lombok.Getter;
 import lombok.Setter;

 @Getter
 @Setter
 @Schema(description = "Data required for user login.")
public class LoginDTO {

    @Schema(description = "Email address of the user.", example = "user@example.com")
    private String email;

    @Schema(description = "Encrypted password of the user.", example = "encryptedPassword")
    private String password;
}
