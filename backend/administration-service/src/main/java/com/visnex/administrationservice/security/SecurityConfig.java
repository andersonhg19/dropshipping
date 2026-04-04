package com.visnex.administrationservice.security;

import org.jetbrains.annotations.NotNull;
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
    SecurityFilterChain defaultSecurityFilterChain(@NotNull HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(requests -> requests
                        .requestMatchers("/v3/api-docs/**", "administration-service/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/v2/company/**").hasAuthority(ADMIN)
                        .requestMatchers("/v2/subsidiary/**").hasAuthority(ADMIN)
                        .requestMatchers("/v2/filial-configurations/**").hasAuthority(ADMIN)
                        .requestMatchers("/v2/filial-styles/**").hasAuthority(ADMIN)
                        .requestMatchers("/v2/user/**").hasAuthority(ADMIN)
                        .requestMatchers("/v2/type-user/**").hasAuthority(ADMIN)
                        .requestMatchers("/v2/module/**").hasAuthority(ADMIN)
                        .requestMatchers("/v2/pages/**").hasAuthority(ADMIN)
                        .requestMatchers("/v2/page-type-user/**").hasAuthority(ADMIN)
                        .requestMatchers("/v2/utils/**").hasAuthority(ADMIN)
                        .requestMatchers("/v2/password/**").permitAll()
                )
                .addFilterBefore(authorizationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
