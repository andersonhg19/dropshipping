package com.visnex.administrationservice.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.*;

@Component
@RequiredArgsConstructor
public class ReactiveNotificationEmailClient {

    private final WebClient webClient;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${notificationServiceUrl}")
    private String baseUrl;

    @Value("${authUrl}")
    private String authUrl;

    @Value("${secretUser}")
    private String secretUser;

    @Value("${secretKey}")
    private String secretKey;

    /** Igual que en ConnectInternalApi pero aquí dedicado a pedir token para llamadas internas */
    private Mono<String> getInternalToken() {
        Map<String,String> body = Map.of("username", secretUser, "password", secretKey);
        return webClient.post()
                .uri(authUrl + "/internalLogin")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .map(resp -> {
                    // {"token":"xxx","username":"admin"}
                    int i = resp.indexOf("\"token\":\"");
                    if (i < 0) return "";
                    int j = resp.indexOf("\"", i + 9);
                    return resp.substring(i + 9, j);
                })
                .onErrorReturn("");
    }

    /** Enviar correo genérico a /email/send */
    public Mono<Void> sendEmail(SendEmailCommand cmd) {
        return getInternalToken().flatMap(token ->
                webClient.post()
                        .uri(baseUrl + "/email/send")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .header("Idempotency-Key", cmd.idempotencyKey())
                        .header("X-Correlation-Id", cmd.correlationId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .bodyValue(cmd.toRequestBody())
                        .retrieve()
                        .bodyToMono(String.class)
                        .then()
        );
    }

    /** Comandos cómodos de alto nivel **/

    public Mono<Void> sendWelcomeEmail(String to, String username, String tempPassword, Locale locale) {
        String subject = "Bienvenido a HQ CRM";
        String template = "welcome"; // si usas plantillas en notification-service
        Map<String,Object> model = Map.of(
                "username", username,
                "tempPassword", tempPassword
        );
        return sendEmail(
                SendEmailCommand.builder()
                        .to(List.of(to))
                        .subject(subject)
                        .template(template)   // O usa bodyHtml(...) si no vas con plantilla
                        .model(model)
                        .html(true)
                        .sync(false)
                        .externalId("welcome-" + username)
                        .build()
        );
    }

    public Mono<Void> sendResetPasswordEmail(String to, String username, String newPassword) {
        String subject = "Tu contraseña fue actualizada";
        // Puedes usar plantilla "reset-password" o cuerpo HTML directo
        String body = """
                <p>Hola <b>%s</b>,</p>
                <p>Tu contraseña ha sido actualizada correctamente.</p>
                <p>Nueva contraseña temporal: <code>%s</code></p>
                <p>Por favor cámbiala al ingresar.</p>
                """.formatted(username, newPassword);
        return sendEmail(
                SendEmailCommand.builder()
                        .to(List.of(to))
                        .subject(subject)
                        .body(body)
                        .html(true)
                        .sync(false)
                        .externalId("reset-" + username)
                        .build()
        );
    }

    /** DTO local para no acoplarte al DTO del otro MS */
    @lombok.Builder
    public static final class SendEmailCommand {
        private final List<String> to;
        private final List<String> cc;
        private final List<String> bcc;
        private final String subject;
        private final String template;       // opcional
        private final Map<String,Object> model; // opcional (si template != null)
        private final String body;           // opcional (si no template)
        private final boolean html;
        private final boolean sync;
        private final String externalId;

        public String idempotencyKey() {
            return (externalId != null) ? externalId : UUID.randomUUID().toString();
        }
        public String correlationId() {
            return UUID.randomUUID().toString();
        }
        public Map<String,Object> toRequestBody() {
            Map<String,Object> m = new HashMap<>();
            m.put("to", to != null ? to : List.of());
            if (cc != null)  m.put("cc",  cc);
            if (bcc != null) m.put("bcc", bcc);
            m.put("subject", subject);
            if (template != null && !template.isBlank()) {
                m.put("template", template);
                if (model != null) m.put("model", model);
            } else {
                m.put("body", body);
            }
            m.put("html", html);
            m.put("sync", sync);
            if (externalId != null) m.put("externalId", externalId);

            // attachments / headers si los necesitas más adelante
            return m;
        }
    }
}
