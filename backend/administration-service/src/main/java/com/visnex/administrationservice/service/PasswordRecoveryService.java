package com.visnex.administrationservice.service;

import com.visnex.administrationservice.dto.output.ResultDTO;

public interface PasswordRecoveryService {
  ResultDTO sendResetLink(String email, String language);
  ResultDTO resetWithToken(String token, String newEncryptedPassword, String language);
}