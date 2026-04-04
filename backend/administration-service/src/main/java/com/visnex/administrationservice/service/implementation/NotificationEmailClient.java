package com.visnex.administrationservice.service.implementation;

import com.visnex.administrationservice.dto.input.SendEmailRequest;
import com.visnex.administrationservice.security.ConnectInternalApi;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class NotificationEmailClient {

  private final RestTemplate restTemplate = new RestTemplate();
  private final ConnectInternalApi connectInternalApi;

    @Value("${notification.email.send.url:${notificationServiceUrl}/email/send}")
  private String sendUrl;

  @Value("${notification.email.enabled:true}")
  private boolean enabled;

  public boolean send(SendEmailRequest req) {
    if (!enabled) return false;

    try {
      String token = extractToken(); // usa auth-service interno
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);
      headers.set(HttpHeaders.AUTHORIZATION, "Bearer " + token);

      HttpEntity<SendEmailRequest> entity = new HttpEntity<>(req, headers);
      ResponseEntity<String> resp = restTemplate.postForEntity(sendUrl, entity, String.class);
      return resp.getStatusCode().is2xxSuccessful();
    } catch (Exception e) {
      // loggea si quieres
      return false;
    }
  }

  private String extractToken() {
    // Reutiliza el login interno ya implementado en ConnectInternalApi
    // (usa secretUser/secretKey -> /internalLogin en auth)
    // connectInternalApi.GenerateToken() es private ahí; crea un pequeño método público
    // o expón un getInternalToken() en ConnectInternalApi para no duplicar lógica.
    try {
      // “truco” simple: pide un mensaje de language (ya usa Bearer) y parsea el header
      // — mejor opción: añade un método público en ConnectInternalApi que retorne el Bearer.
      // Para no tocar ese archivo ahora, asume que agregaste:
      // public String getInternalBearerToken()
      return connectInternalApi.getInternalBearerToken();
    } catch (Exception e) {
      return "";
    }
  }
}