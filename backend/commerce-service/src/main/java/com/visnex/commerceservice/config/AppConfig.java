package com.visnex.commerceservice.config;

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
    public RestTemplate restTemplate() {
        return new RestTemplate();
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
