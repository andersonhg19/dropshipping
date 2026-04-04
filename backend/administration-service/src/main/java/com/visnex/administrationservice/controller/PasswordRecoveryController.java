// com.visnex.administrationservice.controller.PasswordRecoveryController.java
package com.visnex.administrationservice.controller;

import com.visnex.administrationservice.dto.input.ForgotPasswordRequestDTO;
import com.visnex.administrationservice.dto.input.ResetPasswordRequestDTO;
import com.visnex.administrationservice.dto.output.ResultDTO;
import com.visnex.administrationservice.service.PasswordRecoveryService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Password Recovery")
@RestController
@RequestMapping("/v2/password")
@RequiredArgsConstructor
public class PasswordRecoveryController {

    private final PasswordRecoveryService service;

    /** 1) Solicitar enlace (ingresa email) */
    @PostMapping(path="/forgot", consumes="application/json")
    public ResultDTO forgot(@RequestBody ForgotPasswordRequestDTO req,
                            @RequestHeader(name = "lng", required = false) String language) {
        return service.sendResetLink(req.getEmail(), language);
    }

    /** 2) Confirmar nuevo password con token (password cifrada desde el front) */
    @PostMapping(path="/reset", consumes="application/json")
    public ResultDTO reset(@RequestBody ResetPasswordRequestDTO req,
                           @RequestHeader(name = "lng", required = false) String language) {
        return service.resetWithToken(req.getToken(), req.getNewPassword(), language);
    }

}
