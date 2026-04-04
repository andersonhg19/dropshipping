package com.visnex.commerceservice.security;

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
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/v2/product/**").hasAuthority(ADMIN)
                        .requestMatchers("/v2/category/**").hasAuthority(ADMIN)
                        .requestMatchers("/v2/product-image/**").hasAuthority(ADMIN)
                        .requestMatchers("/v2/pricing-config/**").hasAuthority(ADMIN)
                        .requestMatchers("/v2/promotion/**").hasAuthority(ADMIN)
                        .requestMatchers("/v2/publish-channel/**").hasAuthority(ADMIN)
                        .requestMatchers("/v2/product-publish/**").hasAuthority(ADMIN)
                        .requestMatchers("/v2/enrichment-config/**").hasAuthority(ADMIN)
                        .requestMatchers("/v2/prompt-template/**").hasAuthority(ADMIN)
                )
                .addFilterBefore(authorizationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
