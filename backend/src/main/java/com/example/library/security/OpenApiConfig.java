package com.example.library.security;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME = "bearerAuth";

    @Bean
    public OpenAPI libraryOpenApi() {
        SecurityScheme bearerScheme = new SecurityScheme()
                .name(SECURITY_SCHEME)
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .description("Paste the JWT returned by POST /auth/login");

        return new OpenAPI()
                .info(new Info()
                        .title("Library Management System API")
                        .version("1.0.0")
                        .description("JWT-secured APIs for authentication, books, and borrowing"))
                .components(new Components().addSecuritySchemes(SECURITY_SCHEME, bearerScheme))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME));
    }
}
