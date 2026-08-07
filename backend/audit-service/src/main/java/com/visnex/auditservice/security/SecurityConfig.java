package com.visnex.auditservice.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final String ADMIN = "ADMIN";

    private final JWTAuthorizationFilter authorizationFilter;

    public SecurityConfig(JWTAuthorizationFilter authorizationFilter) {
        this.authorizationFilter = authorizationFilter;
    }

    @Bean
    SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(requests -> requests
                        .requestMatchers("/v3/api-docs/**", "/audit-service/swagger-ui/**", "/swagger-ui.html").permitAll()
                        // Solo health check publico. El resto de actuator queda cerrado.
                        .requestMatchers("/actuator/health").permitAll()
                        // LECTURA del log de auditoria: solo ADMIN.
                        // Antes estaba todo en permitAll y el puerto 8845 se publicaba al host,
                        // asi que cualquiera en la red podia leer el historial completo.
                        .requestMatchers("/v2/audit-log/all").hasAuthority(ADMIN)
                        // ESCRITURA: la hacen los otros microservicios via Feign (AuditLogClient),
                        // que hoy no propaga el JWT del usuario. Se deja abierta pero el servicio
                        // ya NO publica su puerto al host: solo es alcanzable dentro de la red
                        // interna de Docker.
                        // TODO(Fase 3): propagar el Authorization header en AuditLogClient y
                        // cerrar tambien /create con hasAuthority(ADMIN).
                        .requestMatchers("/v2/audit-log/create").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(authorizationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
