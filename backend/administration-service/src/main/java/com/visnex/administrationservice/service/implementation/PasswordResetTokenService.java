package com.visnex.administrationservice.service.implementation;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PasswordResetTokenService {

  @Value("${secret}")
  private String secret;

  // 15 minutos por defecto
  @Value("${password.reset.ttl.seconds:900}")
  private long ttlSeconds;

  public String createToken(Long userId, String email) {
    Instant now = Instant.now();
    return JWT.create()
      .withSubject("password-reset")
      .withIssuedAt(Date.from(now))
      .withExpiresAt(Date.from(now.plusSeconds(ttlSeconds)))
      .withClaim("uid", userId)
      .withClaim("email", email)
      .sign(Algorithm.HMAC256(secret));
  }

  public Map<String, Object> verify(String token) {
    var decoded = JWT.require(Algorithm.HMAC256(secret))
      .withSubject("password-reset")
      .build()
      .verify(token);
    return Map.of(
      "uid", decoded.getClaim("uid").asLong(),
      "email", decoded.getClaim("email").asString()
    );
  }
}