package com.visnex.administrationservice.security;

import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@NoArgsConstructor
@Getter
@Component
public class Params {
    @Value("${secretConnexion}")
    private String secretConnexion;

}
