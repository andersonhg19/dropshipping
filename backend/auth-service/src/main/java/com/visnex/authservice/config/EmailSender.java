package com.visnex.authservice.config;

import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailSender {

    private final JavaMailSender javaMailSender;

    public EmailSender(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    public void sendMail(String destinatario, String asunto, String cuerpo) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("anderson.herrera@ hqscom.cl");
            helper.setTo(destinatario);
            helper.setSubject(asunto);
            helper.setText(cuerpo, true);

            // Enviar el mensaje
            javaMailSender.send(message);
            System.out.println("Correo enviado exitosamente.");
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error al enviar el correo electrónico: " + e.getMessage());
        }
    }
}