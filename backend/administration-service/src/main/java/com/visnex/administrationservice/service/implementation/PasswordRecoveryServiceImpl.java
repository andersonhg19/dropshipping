package com.visnex.administrationservice.service.implementation;


import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import com.visnex.administrationservice.dto.input.SendEmailRequest;
import com.visnex.administrationservice.dto.output.ResultDTO;
import com.visnex.administrationservice.entity.User;
import com.visnex.administrationservice.enums.Message;
import com.visnex.administrationservice.repository.UserRepository;
import com.visnex.administrationservice.security.ConnectInternalApi;
import com.visnex.administrationservice.service.PasswordRecoveryService;
import com.visnex.administrationservice.util.EntityChangeEvent;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class PasswordRecoveryServiceImpl implements PasswordRecoveryService {

  private final UserRepository userRepository;
  private final PasswordResetTokenService tokenService;
  private final NotificationEmailClient emailClient;
  private final ConnectInternalApi connectInternalApi;
  private final com.visnex.administrationservice.util.securityUtil securityUtil;
  private final ApplicationEventPublisher eventPublisher;

  @Value("${frontend.reset.base-url}")
  private String resetBaseUrl;

  private static final String DEFAULT_LANG = "es";
  private String lang(String language) { return (language == null || language.isBlank()) ? DEFAULT_LANG : language; }

  // 👇 Helper que encapsula las checked exceptions de ConnectInternalApi
  private String i18n(String key, String language) {
    try {
      return connectInternalApi.chargeMessage(key, language);
    } catch (Exception e) {
      return key;
    }
  }

    @Override
    public ResultDTO sendResetLink(String email, String language) {
        String lng = lang(language);
        try {
            List<User> list = userRepository.findByEmail(email.trim());
            // (a) Respuesta neutral para no filtrar existencia de emails
            if (list == null || list.isEmpty()) {
                // Opcional: log.warn("Password reset requested for non-existing email: {}", email);
                return new ResultDTO(Map.of("sent", true)); // siempre true de cara al cliente
            }
            User user = list.get(0);

            String token = tokenService.createToken(user.getId(), user.getEmail());
            String link = resetBaseUrl + "?token=" + token;

            SendEmailRequest req = new SendEmailRequest();
            req.setTo(List.of(user.getEmail()));
            req.setSubject("Restablece tu contraseña");
            req.setBody(
                    """
                    <p>Hola %s,</p>
                    <p>Recibimos una solicitud para restablecer tu contraseña.</p>
                    <p><a href="%s" style="display:inline-block;padding:10px 16px;border-radius:6px;border:1px solid #ccc;text-decoration:none">Restablecer contraseña</a></p>
                    <p>Si no fuiste tú, ignora este mensaje.</p>
                    <p style="font-size:12px;color:#888">Si el botón no funciona, copia y pega este enlace:<br>%s</p>
                    """.formatted(user.getName(), link, link)
            );
            req.setHtml(true);

            boolean ok = emailClient.send(req);
            if (!ok) {
                return new ResultDTO(false, i18n(Message.Msj.return_process_error.toString(), lng), 103);
            }
            return new ResultDTO(Map.of("sent", true));
        } catch (Exception ex) {
            return new ResultDTO(false, i18n(Message.Msj.return_process_error.toString(), lng), 103, ex.getMessage());
        }
    }

    @Override
    public ResultDTO resetWithToken(String token, String newEncryptedPassword, String language) {
        String lng = lang(language);
        try {
            Map<String, Object> claims = tokenService.verify(token);
            Long userId = (Long) claims.get("uid");

            User user = userRepository.findById(userId).orElse(null);
            if (user == null || Boolean.FALSE.equals(user.getActive())) {
                return new ResultDTO(false, i18n(Message.Msj.userNotFount.toString(), lng), 100);
            }

            // (c) blindar por si llegara en claro
            String toSave = securityUtil.ensureEncrypted(newEncryptedPassword);
            user.setPassword(toSave);
            User savedUser = userRepository.save(user);

            // Publicar evento de auditoría
            try {
                List<Map<String, Object>> changes = Collections.singletonList(
                    Map.of("field", "password", "oldValue", "[REDACTED]", "newValue", "[REDACTED]")
                );
                Long actorUserId = (savedUser.getId() != null) ? savedUser.getId() : userId;
                eventPublisher.publishEvent(new EntityChangeEvent(savedUser, changes, actorUserId));
            } catch (Exception e) {
                System.err.println("Failed to publish audit event for PasswordReset: " + e.getMessage());
            }

            // (b) opcional: invalidar token aquí si implementas blacklist

            return new ResultDTO(Map.of("reset", true));
        } catch (Exception ex) {
            return new ResultDTO(false, i18n(Message.Msj.passwordIsIncorrect.toString(), lng), 101, ex.getMessage());
        }
    }

}