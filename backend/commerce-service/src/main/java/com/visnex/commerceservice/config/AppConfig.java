package com.visnex.commerceservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Configuration
public class AppConfig {

    @Value("${language:es}")
    private String language;

    @Value("${secretKey:defaultKey}")
    private String secretKey;

    /**
     * RestTemplate general (WooCommerce y llamadas entre servicios).
     *
     * Antes esto era `new RestTemplate()` sin timeouts: si WooCommerce no
     * respondia, el hilo quedaba colgado indefinidamente. Con el pool por
     * defecto de Tomcat basta un punado de llamadas colgadas para dejar el
     * servicio entero sin hilos disponibles.
     */
    @Bean
    @Primary
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofSeconds(
                        Long.parseLong(System.getProperty("http.connect.timeout.seconds", "5"))))
                .setReadTimeout(Duration.ofSeconds(
                        Long.parseLong(System.getProperty("http.read.timeout.seconds", "30"))))
                .build();
    }

    /**
     * RestTemplate para proveedores de IA.
     *
     * Se separa del general a proposito: generar texto con Ollama en local
     * puede tardar bastante mas que una llamada a WooCommerce, y no queremos
     * que un timeout pensado para la IA deje colgadas las publicaciones.
     */
    @Bean(name = "aiRestTemplate")
    public RestTemplate aiRestTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofSeconds(10))
                .setReadTimeout(Duration.ofSeconds(120))
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
