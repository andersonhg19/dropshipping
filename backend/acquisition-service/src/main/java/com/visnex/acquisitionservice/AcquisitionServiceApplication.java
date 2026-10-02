package com.visnex.acquisitionservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class AcquisitionServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AcquisitionServiceApplication.class, args);
    }
}
