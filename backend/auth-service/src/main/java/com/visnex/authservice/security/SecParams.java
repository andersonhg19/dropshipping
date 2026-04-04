package com.visnex.authservice.security;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@NoArgsConstructor
@Getter
@Component
public class SecParams {
    @Value("${SECRET}")
    private String secret;

    @Value("${EXP_TIME}")
    private Long expiredTime;

    @PostConstruct
    public void init() {
        System.out.println("SECRET: " + secret);
        System.out.println("EXP_TIME: " + expiredTime);
    }
}
