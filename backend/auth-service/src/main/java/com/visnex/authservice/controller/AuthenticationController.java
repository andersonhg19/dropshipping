package com.visnex.authservice.controller;

import com.visnex.authservice.dto.AuthenticationRequest;
import com.visnex.authservice.dto.AuthenticationResponse;
import com.visnex.authservice.service.AuthenticationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthenticationController {

    private final AuthenticationService service;

    public AuthenticationController(AuthenticationService service) {
        this.service = service;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@RequestBody AuthenticationRequest request) throws Exception {
        return ResponseEntity.ok(service.authenticate(request));
    }

    @PostMapping("/internalLogin")
    public ResponseEntity<AuthenticationResponse> internalLogin(@RequestBody AuthenticationRequest request)
            throws Exception {
        return ResponseEntity.ok(service.authenticateInternal(request));
    }
}
