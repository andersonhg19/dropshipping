package com.visnex.authservice.service;

import com.visnex.authservice.dto.AuthenticationRequest;
import com.visnex.authservice.dto.AuthenticationResponse;

public interface AuthenticationService {

    AuthenticationResponse authenticate(AuthenticationRequest request) throws Exception;

    AuthenticationResponse authenticateInternal(AuthenticationRequest request) throws Exception;
}
