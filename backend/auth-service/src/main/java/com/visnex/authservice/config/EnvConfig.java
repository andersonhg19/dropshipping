package com.visnex.authservice.config;

import org.springframework.boot.context.event.ApplicationEnvironmentPreparedEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Map;
import java.util.stream.Collectors;

@Configuration
public class EnvConfig implements ApplicationListener<ApplicationEnvironmentPreparedEvent> {

    @Override
    public void onApplicationEvent(ApplicationEnvironmentPreparedEvent event) {
        loadEnv();
    }

    private void loadEnv() {
        try {
            Map<String, String> env = Files.lines(Paths.get(System.getProperty("user.dir") + "/.env"))
                    .filter(line -> line.contains("=") && !line.startsWith("#"))
                    .map(line -> line.split("=", 2))
                    .collect(Collectors.toMap(
                            entry -> entry[0],
                            entry -> entry.length > 1 ? entry[1] : ""
                    ));
            env.forEach((key, value) -> {
                System.setProperty(key, value);
                System.out.println("Loaded env variable: " + key + " = " + value);
            });
        } catch (IOException e) {
            throw new RuntimeException("Failed to load .env file", e);
        }
    }
}
