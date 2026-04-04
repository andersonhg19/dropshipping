package com.visnex.administrationservice.config;

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
                        .title("ADMINISTRATION SERVICE")
                        .version("1.0")
                        .description(
                                "API BOPOS CLOUD\n\n" +
                                        "GENERAL GUIDELINES\n\n" +
                                        "All methods except for those in the AuthenticationService and LanguageService components return a JSON with the following format:\n" +
                                        "```json\n" +
                                        "{\n" +
                                        "    \"correct\": true | false,\n" +
                                        "    \"message\": \"Error message, otherwise empty\",\n" +
                                        "    \"errorCode\": 0, | Error code\n" +
                                        "    \"object\": null | Object\n" +
                                        "}\n" +
                                        "```\n" +
                                        "Response details:\n" +
                                        "- **correct**: can be true or false.\n" +
                                        "  - **True**: when the process was successful.\n" +
                                        "  - **False**: when an error occurred in the process.\n" +
                                        "- **message**: contains the error detail if any, if the process is successful, the message will be \"OK\".\n" +
                                        "- **errorCode**: contains the error number if any.\n" +
                                        "- **object**: when there is an error, it has the value NULL, otherwise it contains the object resulting from the requested process.\n" +
                                        "\n" +
                                        "All services must have a Header where the working language is sent:\n" +
                                        "- **Spanish**\n" +
                                        "  - Lng: es\n" +
                                        "- **English**\n" +
                                        "  - Lng: en\n"
                        ));
    }

    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
                .group("springshop-public")
                .pathsToMatch("/v2/**")
                .build();
    }
}
