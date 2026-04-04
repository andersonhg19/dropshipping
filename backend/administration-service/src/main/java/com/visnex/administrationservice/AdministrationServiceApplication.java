package com.visnex.administrationservice;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;

import com.visnex.administrationservice.service.implementation.LoadData;

@SpringBootApplication
@EnableFeignClients
@EnableAsync
public class AdministrationServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AdministrationServiceApplication.class, args);
    }

    @Bean
    CommandLineRunner start(LoadData loadData){
        return args -> {
            loadData.seedData();
            System.out.println("SeedDataBase OK");
        };
    }
}