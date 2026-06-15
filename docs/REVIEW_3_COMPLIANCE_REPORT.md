# Review-3 Compliance Report

Date verified: June 14, 2026

## Executive Result

The existing Library Management System was audited and completed in place. No replacement project was created.

The authoritative modules are:

```text
backend/       Spring Boot 3.5.15, Java 17, PostgreSQL, JWT, RBAC
frontend/      React role-based user interface
gateway/       FastAPI centralized reverse proxy
node-backend/  Express and MongoDB service
library/       Existing Maven wrapper and older reference project
```

Final status: **COMPLIANT**

## Architecture

```text
React :3000
    |
    v
FastAPI Gateway :8000
    |
    +--> /auth, /books, /borrows
    |        |
    |        v
    |    Spring Boot :8080 --> PostgreSQL library_db
    |
    +--> /search, /activity, /recommendations
             |
             v
         Node.js :5000 --> MongoDB library_mongo
```

## Phase Compliance

| Phase | Result | Evidence |
| --- | --- | --- |
| 1. Spring Security | PASS | Stateless `SecurityFilterChain`, BCrypt, JWT filter, JSON 401/403, public auth and Swagger routes |
| 2. JWT Authentication | PASS | `/auth/register` hashes passwords; `/auth/login` validates BCrypt and returns token, username, and role |
| 3. RBAC | PASS | ADMIN and USER persisted roles; method and route-level authorization |
| 4. Borrow Module | PASS | Borrow entity, repository, service, controller, and User/Book many-to-one relationships |
| 5. Borrow CRUD | PASS | GET/POST/PUT/DELETE implemented with ownership checks and inventory updates |
| 6. Book CRUD | PASS | Complete GET/POST/PUT/DELETE with validation and ADMIN mutation rules |
| 7. Database Completion | PASS | PostgreSQL tables for users, roles, books, and borrows; Hibernate `ddl-auto=update` verified |
| 8. Swagger | PASS | Public Swagger UI returned HTTP 200 and OpenAPI exposes JWT bearer authorization |
| 9. FastAPI Integration | PASS | Required Spring and Node prefixes route to the correct upstream service |
| 10. React Integration | PASS | JWT storage/header interceptor, protected routes, role navigation, book and borrow actions |
| 11. Review-3 Audit | PASS | Builds, syntax checks, live API scenario, PostgreSQL, MongoDB, gateway, and frontend serving verified |

## Security Rules

Public:

```text
/auth/**
/swagger-ui.html
/swagger-ui/**
/v3/api-docs/**
```

Protected:

| Endpoint | USER | ADMIN |
| --- | --- | --- |
| GET `/books/**` | Allowed | Allowed |
| POST `/books/**` | Denied | Allowed |
| PUT `/books/**` | Denied | Allowed |
| DELETE `/books/**` | Denied | Allowed |
| GET `/borrows` | Own records | All records |
| GET `/borrows/{id}` | Own record | Any record |
| POST `/borrows` | Allowed | Denied |
| PUT `/borrows/{id}` | Return own active borrow | Administrative update |
| DELETE `/borrows/{id}` | Denied | Allowed |

Public registration always creates a USER account. A client-supplied `role: "ADMIN"` is ignored, preventing privilege escalation.

## Authentication Response

```json
{
  "token": "...",
  "type": "Bearer",
  "id": 1,
  "name": "Library User",
  "username": "user@library.com",
  "email": "user@library.com",
  "role": "USER"
}
```

## Database Mapping

```text
Role 1 ---- * User
User 1 ---- * Borrow
Book 1 ---- * Borrow
```

Borrow records persist real JPA relationships. The JSON response exposes `userId` and `bookId` through derived getters without serializing lazy entity graphs.

Book inventory changes use pessimistic row locking so concurrent borrow/return operations cannot silently oversubscribe available copies.

## Gateway Routes

Spring Boot:

```text
/auth/*
/books/*
/borrows/*
```

Node.js:

```text
/search/*
/activity/*
/recommendations/*
```

The gateway preserves the `Authorization` header, request body, query parameters, response status, response body, and safe response headers.

## React Compliance

- JWT is stored as `authToken`.
- Current user ID, name, email, and role are stored as `currentUser`.
- Axios automatically sends `Authorization: Bearer <token>`.
- HTTP 401 clears local authentication and redirects to login.
- ADMIN navigation exposes Add Book and book edit/delete controls.
- USER navigation exposes Search, My Borrows, Borrow, and Return.
- Signup no longer exposes ADMIN self-registration.
- Book create/edit forms cover title, author, category, price, total copies, and available copies.
- Borrow and return operations use PostgreSQL-backed APIs rather than localStorage simulation.

## Live Verification Evidence

The following checks were executed against running PostgreSQL, MongoDB, Spring Boot, Node.js, FastAPI, and React services:

```text
Swagger UI status:                  200
OpenAPI JWT bearer scheme:          present
Unauthenticated GET /books:         401
USER POST /books:                   403
Requested registration role:       ADMIN
Actual registration role:          USER
Login response username:            present
ADMIN book create/update/delete:    passed
Updated book price:                 109.5
USER borrow own record visibility:  passed
Other USER access to borrow:        403
USER return status:                 RETURNED
ADMIN view all borrows:             passed
Mongo search create/delete:         passed
FastAPI prefix assertions:          passed
React production build:             passed
React dev server HTTP status:       200
Spring Maven test lifecycle:        passed
Node syntax checks:                 passed
Gateway Python compilation:         passed
```

Temporary user, book, borrow, and Mongo search records used by the integration test were deleted after verification.

The in-app browser automation runtime could not attach because its Windows host process failed while resolving the workspace path containing parentheses. React was still verified through a successful production build, successful development compilation, HTTP 200 serving, and source-level role/action checks.

## Files Added or Relocated

| Path | Purpose |
| --- | --- |
| `backend/src/main/java/com/example/library/security/SecurityConfig.java` | Required security-package configuration for stateless JWT, BCrypt, CORS, public Swagger, and RBAC |
| `backend/src/main/java/com/example/library/security/OpenApiConfig.java` | Swagger/OpenAPI metadata and JWT bearer authorization scheme |
| `backend/src/main/java/com/example/library/dto/BookRequest.java` | Nullable validated request model supporting create and partial update semantics |
| `backend/src/main/java/com/example/library/dto/BorrowRequest.java` | Validated borrow/return request model that does not accept a client-controlled user ID |
| `docs/REVIEW_3_COMPLIANCE_REPORT.md` | Final requirement audit, verification evidence, file purposes, and complete code appendix |

## Files Corrected in Place

Key corrected files:

```text
backend/pom.xml
backend/src/main/resources/application.properties
backend/src/main/java/com/example/library/security/JwtUtil.java
backend/src/main/java/com/example/library/security/JwtFilter.java
backend/src/main/java/com/example/library/security/CustomUserDetailsService.java
backend/src/main/java/com/example/library/dto/RegisterRequest.java
backend/src/main/java/com/example/library/dto/AuthResponse.java
backend/src/main/java/com/example/library/service/AuthService.java
backend/src/main/java/com/example/library/controller/BookController.java
backend/src/main/java/com/example/library/service/BookService.java
backend/src/main/java/com/example/library/repository/BookRepository.java
backend/src/main/java/com/example/library/entity/Borrow.java
backend/src/main/java/com/example/library/repository/BorrowRepository.java
backend/src/main/java/com/example/library/service/BorrowService.java
backend/src/main/java/com/example/library/controller/BorrowController.java
frontend/src/services/api.js
frontend/src/pages/Signup.js
frontend/src/pages/BookListing.js
frontend/src/pages/AddBook.js
frontend/src/components/BookCard.js
README.md
docs/API_DOCUMENTATION.md
docs/SETUP_GUIDE.md
docs/RUN_GUIDE.md
docs/MODIFIED_FILES.md
docs/Library_Management_Postman_Collection.json
```

## Complete Code Appendix

The appendix includes the complete final code for the files added or relocated during final completion and for the requested security, role, and borrow modules.

### `backend/src/main/java/com/example/library/security/SecurityConfig.java`

Purpose: Configures stateless JWT authentication, BCrypt, CORS, public documentation routes, role rules, and JSON authorization failures.

```java
package com.example.library.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final JwtAuthenticationEntryPoint authenticationEntryPoint;
    private final ObjectMapper objectMapper;

    public SecurityConfig(
            JwtFilter jwtFilter,
            JwtAuthenticationEntryPoint authenticationEntryPoint,
            ObjectMapper objectMapper
    ) {
        this.jwtFilter = jwtFilter;
        this.authenticationEntryPoint = authenticationEntryPoint;
        this.objectMapper = objectMapper;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            objectMapper.writeValue(response.getOutputStream(), Map.of(
                                    "timestamp", Instant.now().toString(),
                                    "status", 403,
                                    "error", "Forbidden",
                                    "message", "You do not have permission to access this resource",
                                    "path", request.getRequestURI()
                            ));
                        })
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(
                                "/auth/**",
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs/**"
                        ).permitAll()
                        .requestMatchers(HttpMethod.GET, "/books/**").hasAnyRole("ADMIN", "USER")
                        .requestMatchers(HttpMethod.POST, "/books/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/books/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/books/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/borrows/**").hasAnyRole("ADMIN", "USER")
                        .requestMatchers(HttpMethod.POST, "/borrows/**").hasRole("USER")
                        .requestMatchers(HttpMethod.PUT, "/borrows/**").hasAnyRole("ADMIN", "USER")
                        .requestMatchers(HttpMethod.DELETE, "/borrows/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:8000",
                "http://127.0.0.1:8000"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### `backend/src/main/java/com/example/library/security/OpenApiConfig.java`

Purpose: Adds OpenAPI metadata and the JWT bearer authorization button in Swagger.

```java
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
```

### `backend/src/main/java/com/example/library/security/JwtUtil.java`

Purpose: Creates and validates signed HS256 JWTs with subject, roles, issued-at, and expiry claims.

```java
package com.example.library.security;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

    private static final String HMAC_ALGORITHM = "HmacSHA256";

    private final String secret;
    private final long expirationMs;
    private final ObjectMapper objectMapper;

    public JwtUtil(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs,
            ObjectMapper objectMapper
    ) {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalArgumentException("JWT secret must be at least 32 bytes");
        }
        if (expirationMs <= 0) {
            throw new IllegalArgumentException("JWT expiration must be greater than zero");
        }
        this.secret = secret;
        this.expirationMs = expirationMs;
        this.objectMapper = objectMapper;
    }

    public String generateToken(String subject, Set<String> roles) {
        Instant now = Instant.now();

        Map<String, Object> header = new LinkedHashMap<>();
        header.put("alg", "HS256");
        header.put("typ", "JWT");

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("sub", subject);
        payload.put("roles", roles);
        payload.put("iat", now.getEpochSecond());
        payload.put("exp", now.plusMillis(expirationMs).getEpochSecond());

        String encodedHeader = encodeJson(header);
        String encodedPayload = encodeJson(payload);
        String unsignedToken = encodedHeader + "." + encodedPayload;
        return unsignedToken + "." + sign(unsignedToken);
    }

    public String extractUsername(String token) {
        return readPayload(token).get("sub").toString();
    }

    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        Object roles = readPayload(token).get("roles");
        if (roles instanceof List<?>) {
            return ((List<?>) roles).stream().map(Object::toString).toList();
        }
        return List.of();
    }

    public boolean validateToken(String token, String username) {
        try {
            if (!hasValidSignature(token)) {
                return false;
            }
            return username.equals(extractUsername(token)) && !isExpired(token);
        } catch (Exception ex) {
            return false;
        }
    }

    public String validateAndExtractUsername(String token) {
        if (!hasValidSignature(token) || isExpired(token)) {
            throw new IllegalArgumentException("Invalid or expired token");
        }

        String username = extractUsername(token);
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Token subject is missing");
        }
        return username;
    }

    private boolean isExpired(String token) {
        Object exp = readPayload(token).get("exp");
        long expiry = Long.parseLong(exp.toString());
        return Instant.now().getEpochSecond() >= expiry;
    }

    private boolean hasValidSignature(String token) {
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            return false;
        }
        String unsignedToken = parts[0] + "." + parts[1];
        return MessageDigest.isEqual(
                sign(unsignedToken).getBytes(StandardCharsets.US_ASCII),
                parts[2].getBytes(StandardCharsets.US_ASCII)
        );
    }

    private Map<String, Object> readPayload(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw new IllegalArgumentException("Invalid token");
            }
            byte[] decoded = Base64.getUrlDecoder().decode(parts[1]);
            return objectMapper.readValue(decoded, new TypeReference<Map<String, Object>>() {});
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid token", ex);
        }
    }

    private String encodeJson(Map<String, Object> value) {
        try {
            byte[] json = objectMapper.writeValueAsBytes(value);
            return Base64.getUrlEncoder().withoutPadding().encodeToString(json);
        } catch (Exception ex) {
            throw new IllegalStateException("Could not encode token", ex);
        }
    }

    private String sign(String content) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            SecretKeySpec key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM);
            mac.init(key);
            return Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(mac.doFinal(content.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new IllegalStateException("Could not sign token", ex);
        }
    }
}
```

### `backend/src/main/java/com/example/library/security/JwtFilter.java`

Purpose: Reads Bearer tokens, validates them, loads the database user, and populates the Spring Security context.

```java
package com.example.library.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    public JwtFilter(JwtUtil jwtUtil, CustomUserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String authorizationHeader = request.getHeader("Authorization");

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7);

            try {
                if (SecurityContextHolder.getContext().getAuthentication() == null) {
                    String username = jwtUtil.validateAndExtractUsername(token);
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    UsernamePasswordAuthenticationToken authenticationToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );
                    authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                }
            } catch (RuntimeException ignored) {
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}
```

### `backend/src/main/java/com/example/library/security/CustomUserDetailsService.java`

Purpose: Loads PostgreSQL users by email and maps the persisted role to a Spring Security authority.

```java
package com.example.library.security;

import com.example.library.entity.Role;
import com.example.library.entity.User;
import com.example.library.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Role role = user.getRoleEntity();
        if (role == null || role.getName() == null) {
            throw new UsernameNotFoundException("User has no assigned role");
        }
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role.getName());

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                java.util.List.of(authority)
        );
    }
}
```

### `backend/src/main/java/com/example/library/security/JwtAuthenticationEntryPoint.java`

Purpose: Returns a predictable JSON 401 response instead of redirecting unauthenticated API clients.

```java
package com.example.library.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    public JwtAuthenticationEntryPoint(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(), Map.of(
                "timestamp", Instant.now().toString(),
                "status", 401,
                "error", "Unauthorized",
                "message", "A valid JWT token is required",
                "path", request.getRequestURI()
        ));
    }
}
```

### `backend/src/main/java/com/example/library/entity/Role.java`

Purpose: Persists the ADMIN and USER role names in PostgreSQL.

```java
package com.example.library.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    public Role() {
    }

    public Role(String name) {
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
```

### `backend/src/main/java/com/example/library/repository/RoleRepository.java`

Purpose: Provides JPA CRUD and role lookup by unique name.

```java
package com.example.library.repository;

import com.example.library.entity.Role;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);
}
```

### `backend/src/main/java/com/example/library/service/RoleService.java`

Purpose: Normalizes role names and safely creates the fixed ADMIN/USER role records.

```java
package com.example.library.service;

import com.example.library.entity.Role;
import com.example.library.repository.RoleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RoleService {

    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Transactional
    public Role getOrCreateRole(String requestedRole) {
        String roleName = normalizeRole(requestedRole);
        return roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(new Role(roleName)));
    }

    public String normalizeRole(String requestedRole) {
        if (requestedRole == null || requestedRole.isBlank()) {
            return "USER";
        }

        String roleName = requestedRole.trim().toUpperCase();
        if (!roleName.equals("ADMIN") && !roleName.equals("USER")) {
            return "USER";
        }

        return roleName;
    }
}
```

### `backend/src/main/java/com/example/library/entity/Borrow.java`

Purpose: Persists borrow dates, return dates, status, and required User/Book many-to-one relationships.

```java
package com.example.library.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "borrows")
public class Borrow {

    public enum BorrowStatus {
        BORROWED,
        RETURNED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate borrowDate;

    private LocalDate returnDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BorrowStatus status = BorrowStatus.BORROWED;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "book_id", nullable = false)
    @JsonIgnore
    private Book book;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return user == null ? null : user.getId();
    }

    public Long getBookId() {
        return book == null ? null : book.getBookId();
    }

    public LocalDate getBorrowDate() {
        return borrowDate;
    }

    public void setBorrowDate(LocalDate borrowDate) {
        this.borrowDate = borrowDate;
    }

    public LocalDate getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(LocalDate returnDate) {
        this.returnDate = returnDate;
    }

    public BorrowStatus getStatus() {
        return status;
    }

    public void setStatus(BorrowStatus status) {
        this.status = status;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Book getBook() {
        return book;
    }

    public void setBook(Book book) {
        this.book = book;
    }
}
```

### `backend/src/main/java/com/example/library/repository/BorrowRepository.java`

Purpose: Provides borrow CRUD, ownership queries, active-borrow detection, and book-history checks.

```java
package com.example.library.repository;

import com.example.library.entity.Borrow;
import com.example.library.entity.Borrow.BorrowStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BorrowRepository extends JpaRepository<Borrow, Long> {
    List<Borrow> findAllByOrderByBorrowDateDescIdDesc();

    List<Borrow> findByUser_IdOrderByBorrowDateDescIdDesc(Long userId);

    Optional<Borrow> findFirstByUser_IdAndBook_BookIdAndStatus(
            Long userId,
            Long bookId,
            BorrowStatus status
    );

    boolean existsByBook_BookId(Long bookId);
}
```

### `backend/src/main/java/com/example/library/service/BorrowService.java`

Purpose: Implements transactional borrow CRUD, duplicate prevention, availability checks, return handling, date validation, and inventory restoration.

```java
package com.example.library.service;

import com.example.library.entity.Book;
import com.example.library.entity.Borrow;
import com.example.library.entity.Borrow.BorrowStatus;
import com.example.library.entity.User;
import com.example.library.dto.BorrowRequest;
import com.example.library.repository.BookRepository;
import com.example.library.repository.BorrowRepository;
import com.example.library.repository.UserRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BorrowService {

    private final BorrowRepository borrowRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public BorrowService(
            BorrowRepository borrowRepository,
            BookRepository bookRepository,
            UserRepository userRepository
    ) {
        this.borrowRepository = borrowRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
    }

    public List<Borrow> getAllBorrows() {
        return borrowRepository.findAllByOrderByBorrowDateDescIdDesc();
    }

    public List<Borrow> getBorrowsByUser(Long userId) {
        return borrowRepository.findByUser_IdOrderByBorrowDateDescIdDesc(userId);
    }

    public Borrow getBorrowById(Long id) {
        return borrowRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Borrow record not found"));
    }

    @Transactional
    public Borrow createBorrow(Long userId, Long bookId) {
        if (bookId == null) {
            throw new IllegalArgumentException("Book id is required");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Book book = bookRepository.findByIdForUpdate(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found"));

        borrowRepository.findFirstByUser_IdAndBook_BookIdAndStatus(
                userId,
                bookId,
                BorrowStatus.BORROWED
        ).ifPresent(existing -> {
            throw new IllegalArgumentException("This book is already borrowed by the user");
        });

        if (book.getAvailableCount() <= 0) {
            throw new IllegalArgumentException("Book is not available for borrowing");
        }

        book.setAvailableCount(book.getAvailableCount() - 1);
        bookRepository.save(book);

        Borrow borrow = new Borrow();
        borrow.setUser(user);
        borrow.setBook(book);
        borrow.setBorrowDate(LocalDate.now());
        borrow.setStatus(BorrowStatus.BORROWED);
        borrow.setReturnDate(null);

        return borrowRepository.save(borrow);
    }

    @Transactional
    public Borrow returnBorrow(Long id, LocalDate requestedReturnDate) {
        Borrow borrow = getBorrowById(id);
        if (borrow.getStatus() == BorrowStatus.RETURNED) {
            return borrow;
        }

        markReturned(borrow, requestedReturnDate);
        return borrowRepository.save(borrow);
    }

    @Transactional
    public Borrow updateBorrow(Long id, BorrowRequest request) {
        Borrow borrow = getBorrowById(id);

        if (request.getStatus() != null && request.getStatus() != borrow.getStatus()) {
            if (request.getStatus() == BorrowStatus.RETURNED) {
                markReturned(borrow, request.getReturnDate());
            } else {
                markBorrowedAgain(borrow);
            }
        }

        if (request.getBorrowDate() != null) {
            borrow.setBorrowDate(request.getBorrowDate());
        }
        if (request.getReturnDate() != null && borrow.getStatus() == BorrowStatus.RETURNED) {
            borrow.setReturnDate(request.getReturnDate());
        }
        validateDates(borrow);

        return borrowRepository.save(borrow);
    }

    @Transactional
    public void deleteBorrow(Long id) {
        Borrow borrow = getBorrowById(id);
        if (borrow.getStatus() == BorrowStatus.BORROWED) {
            Book book = bookRepository.findByIdForUpdate(borrow.getBookId())
                    .orElseThrow(() -> new IllegalArgumentException("Book not found"));
            book.setAvailableCount(Math.min(book.getAvailableCount() + 1, book.getTotalCopies()));
            bookRepository.save(book);
        }
        borrowRepository.deleteById(id);
    }

    private void markReturned(Borrow borrow, LocalDate requestedReturnDate) {
        LocalDate returnDate = requestedReturnDate != null ? requestedReturnDate : LocalDate.now();
        if (returnDate.isBefore(borrow.getBorrowDate())) {
            throw new IllegalArgumentException("Return date cannot be before borrow date");
        }

        Book book = bookRepository.findByIdForUpdate(borrow.getBookId())
                .orElseThrow(() -> new IllegalArgumentException("Book not found"));
        book.setAvailableCount(Math.min(book.getAvailableCount() + 1, book.getTotalCopies()));
        bookRepository.save(book);

        borrow.setStatus(BorrowStatus.RETURNED);
        borrow.setReturnDate(returnDate);
    }

    private void markBorrowedAgain(Borrow borrow) {
        Book book = bookRepository.findByIdForUpdate(borrow.getBookId())
                .orElseThrow(() -> new IllegalArgumentException("Book not found"));
        if (book.getAvailableCount() <= 0) {
            throw new IllegalArgumentException("Book is not available for borrowing");
        }
        book.setAvailableCount(book.getAvailableCount() - 1);
        bookRepository.save(book);

        borrow.setStatus(BorrowStatus.BORROWED);
        borrow.setReturnDate(null);
    }

    private void validateDates(Borrow borrow) {
        if (borrow.getReturnDate() != null && borrow.getReturnDate().isBefore(borrow.getBorrowDate())) {
            throw new IllegalArgumentException("Return date cannot be before borrow date");
        }
    }
}
```

### `backend/src/main/java/com/example/library/controller/BorrowController.java`

Purpose: Exposes borrow CRUD with USER ownership restrictions and ADMIN-wide access.

```java
package com.example.library.controller;

import com.example.library.dto.BorrowRequest;
import com.example.library.entity.Borrow;
import com.example.library.entity.Borrow.BorrowStatus;
import com.example.library.entity.User;
import com.example.library.repository.UserRepository;
import com.example.library.service.BorrowService;
import java.util.List;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/borrows")
public class BorrowController {

    private final BorrowService borrowService;
    private final UserRepository userRepository;

    public BorrowController(BorrowService borrowService, UserRepository userRepository) {
        this.borrowService = borrowService;
        this.userRepository = userRepository;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<Borrow>> getBorrows(Authentication authentication) {
        if (isAdmin(authentication)) {
            return ResponseEntity.ok(borrowService.getAllBorrows());
        }
        return ResponseEntity.ok(borrowService.getBorrowsByUser(currentUser(authentication).getId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Borrow> getBorrowById(@PathVariable Long id, Authentication authentication) {
        Borrow borrow = borrowService.getBorrowById(id);
        assertCanAccessBorrow(borrow, authentication);
        return ResponseEntity.ok(borrow);
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Borrow> createBorrow(
            @Valid @RequestBody BorrowRequest request,
            Authentication authentication
    ) {
        Long userId = currentUser(authentication).getId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(borrowService.createBorrow(userId, request.getBookId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Borrow> updateBorrow(
            @PathVariable Long id,
            @Valid @RequestBody BorrowRequest request,
            Authentication authentication
    ) {
        Borrow existing = borrowService.getBorrowById(id);
        assertCanAccessBorrow(existing, authentication);

        if (!isAdmin(authentication)) {
            if (request.getStatus() != BorrowStatus.RETURNED) {
                throw new IllegalArgumentException("Users can only return an active borrow");
            }
            return ResponseEntity.ok(borrowService.returnBorrow(id, request.getReturnDate()));
        }

        return ResponseEntity.ok(borrowService.updateBorrow(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBorrow(@PathVariable Long id) {
        borrowService.deleteBorrow(id);
        return ResponseEntity.noContent().build();
    }

    private User currentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
    }

    private void assertCanAccessBorrow(Borrow borrow, Authentication authentication) {
        if (!isAdmin(authentication) && !borrow.getUserId().equals(currentUser(authentication).getId())) {
            throw new SecurityException("You can access only your own borrow records");
        }
    }
}
```

### `backend/src/main/java/com/example/library/dto/BorrowRequest.java`

Purpose: Accepts safe borrow/return fields while preventing the client from selecting another user's ID.

```java
package com.example.library.dto;

import com.example.library.entity.Borrow.BorrowStatus;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

public class BorrowRequest {

    @Positive(message = "Book id must be positive")
    private Long bookId;

    private LocalDate borrowDate;
    private LocalDate returnDate;
    private BorrowStatus status;

    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }

    public LocalDate getBorrowDate() {
        return borrowDate;
    }

    public void setBorrowDate(LocalDate borrowDate) {
        this.borrowDate = borrowDate;
    }

    public LocalDate getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(LocalDate returnDate) {
        this.returnDate = returnDate;
    }

    public BorrowStatus getStatus() {
        return status;
    }

    public void setStatus(BorrowStatus status) {
        this.status = status;
    }
}
```

### `backend/src/main/java/com/example/library/dto/BookRequest.java`

Purpose: Validates create and partial update input without primitive defaults accidentally overwriting stored book values.

```java
package com.example.library.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public class BookRequest {

    @Size(max = 255, message = "Title must be at most 255 characters")
    private String title;

    @Size(max = 255, message = "Author must be at most 255 characters")
    private String author;

    @Size(max = 255, message = "Category must be at most 255 characters")
    private String category;

    @PositiveOrZero(message = "Price cannot be negative")
    private Double price;

    @Min(value = 1, message = "Total copies must be at least 1")
    private Integer totalCopies;

    @PositiveOrZero(message = "Available count cannot be negative")
    private Integer availableCount;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Integer getTotalCopies() {
        return totalCopies;
    }

    public void setTotalCopies(Integer totalCopies) {
        this.totalCopies = totalCopies;
    }

    public Integer getAvailableCount() {
        return availableCount;
    }

    public void setAvailableCount(Integer availableCount) {
        this.availableCount = availableCount;
    }
}
```

## Operational URLs

```text
React:       http://localhost:3000
Gateway:     http://localhost:8000
Spring:      http://localhost:8080
Swagger:     http://localhost:8080/swagger-ui/index.html
Node:        http://localhost:5000
PostgreSQL:  localhost:5432/library_db
MongoDB:     localhost:27017/library_mongo
```

## Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| ADMIN | `admin@library.com` | `password123` |
| USER | `user@library.com` | `password123` |

## Final Assessment

The project now demonstrates the complete Review-3 stack:

1. Functional React UI with role-aware actions.
2. Central FastAPI gateway.
3. Spring Boot 3.5 JWT authentication, BCrypt, RBAC, Book CRUD, and Borrow CRUD.
4. Node.js MongoDB CRUD service.
5. PostgreSQL and MongoDB persistence.
6. Verified cross-service integration.
