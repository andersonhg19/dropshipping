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
    public RestTemplate restTemplate() {
        return new RestTemplate();
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
