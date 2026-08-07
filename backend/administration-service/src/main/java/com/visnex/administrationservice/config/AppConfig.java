package com.visnex.administrationservice.config;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
@ComponentScan("com.visnex.administrationMicroservices.config")
public class AppConfig {
    @Value("${language}")
    private String language;
    @Value("${secretKey}")
    private  String secretKey;

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
        if (language==null){
            language= "en";
        }
        return language;
    }
    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }
    @Bean
    public String getSecretKey() {
        return secretKey;
    }

}
