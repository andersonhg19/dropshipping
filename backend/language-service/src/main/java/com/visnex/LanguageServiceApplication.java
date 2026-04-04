package com.visnex;

import com.visnex.service.implementation.LoadData;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class LanguageServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(LanguageServiceApplication.class, args);
    }

    @Bean
    CommandLineRunner start(LoadData loadData) {
        return args -> {
            loadData.seedData();
        };
    }
}
