package com.visnex.acquisitionservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    @Value("${language:es}")
    private String language;

    @Value("${secretKey:defaultKey}")
    private String secretKey;

    @Bean
    public RestTemplate restTemplate(org.springframework.boot.web.client.RestTemplateBuilder builder) {
        // Sin timeouts, una llamada a un servicio que no responde deja el hilo
        // colgado indefinidamente y agota el pool de Tomcat.
        return builder
                .setConnectTimeout(java.time.Duration.ofSeconds(5))
                .setReadTimeout(java.time.Duration.ofSeconds(30))
                .build();
    }

    @Bean
    public String getLanguage() {
        if (language == null) {
            language = "es";
        }
        return language;
    }

    @Bean
    public String getSecretKey() {
        return secretKey;
    }
}
