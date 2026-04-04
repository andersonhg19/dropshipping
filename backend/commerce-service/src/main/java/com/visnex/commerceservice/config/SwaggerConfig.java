package com.visnex.commerceservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("COMMERCE SERVICE")
                        .version("1.0")
                        .description(
                                "API VISNEX COMMERCE SERVICE\n\n" +
                                        "Microservice for product catalog, pricing, promotions, and multi-channel publishing.\n\n" +
                                        "GENERAL GUIDELINES\n\n" +
                                        "All methods return a JSON with the following format:\n" +
                                        "```json\n" +
                                        "{\n" +
                                        "    \"correct\": true | false,\n" +
                                        "    \"message\": \"Error message, otherwise empty\",\n" +
                                        "    \"errorCode\": 0, | Error code\n" +
                                        "    \"object\": null | Object\n" +
                                        "}\n" +
                                        "```\n" +
                                        "All services must have a Header where the working language is sent:\n" +
                                        "- **Spanish**: Lng: es\n" +
                                        "- **English**: Lng: en\n"
                        ));
    }

    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
                .group("commerce-public")
                .pathsToMatch("/v2/**")
                .build();
    }
}
