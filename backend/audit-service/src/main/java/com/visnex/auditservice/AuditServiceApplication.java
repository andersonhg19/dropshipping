package com.visnex.auditservice;

import com.visnex.auditservice.config.DatabaseInitializer;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableFeignClients
@EnableScheduling
public class AuditServiceApplication {
    public static void main(String[] args) {
        // Inicializar la base de datos ANTES de que Spring Boot intente conectarse
        String datasourceUrl = System.getenv("SPRING_DATASOURCE_URL");
        if (datasourceUrl == null || datasourceUrl.isEmpty()) {
            datasourceUrl = System.getProperty("spring.datasource.url");
            if (datasourceUrl == null || datasourceUrl.isEmpty()) {
                datasourceUrl = "jdbc:postgresql://localhost:5432/audit_db"; // Default
            }
        }
        
        String username = System.getenv("SPRING_DATASOURCE_USERNAME");
        if (username == null || username.isEmpty()) {
            username = System.getProperty("spring.datasource.username", "postgres");
        }
        
        String password = System.getenv("SPRING_DATASOURCE_PASSWORD");
        if (password == null || password.isEmpty()) {
            password = System.getProperty("spring.datasource.password", "Visnex2026");
        }
        
        // Intentar crear la base de datos si no existe
        DatabaseInitializer.initializeDatabase(datasourceUrl, username, password);
        
        // Ahora sí, ejecutar Spring Boot
        SpringApplication.run(AuditServiceApplication.class, args);
    }
}

