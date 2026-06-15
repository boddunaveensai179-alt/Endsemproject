package com.example.library;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * LibraryApplication - Main Entry Point for Spring Boot Application
 * 
 * This is the main class that starts the Digital Library Management System backend.
 * Spring Boot automatically scans this class's package and sub-packages
 * to find and register all Spring components (@RestController, @Service, @Repository, etc.)
 * 
 * When you run this application:
 * 1. Spring Boot initializes the application context
 * 2. Scans package "com.example.library" and all sub-packages
 * 3. Finds all @Component, @Service, @Controller, @Repository etc. classes
 * 4. Automatically creates instances and wires dependencies
 * 5. Starts embedded Tomcat server on port 8080
 * 6. Connects to PostgreSQL database using credentials in application.properties
 * 7. Auto-creates/updates database tables based on entity classes
 * 
 * @SpringBootApplication - Combines three annotations:
 * @Configuration - Marks class as source of bean definitions
 * @EnableAutoConfiguration - Enables Spring Boot's auto-configuration
 * @ComponentScan - Scans for components in current package and sub-packages
 */
@SpringBootApplication
public class LibraryApplication {

    /**
     * Main method - Entry point of the application
     * 
     * This method is called when the application starts.
     * It uses Spring Boot's SpringApplication class to run the application.
     * 
     * To start the application:
     * 1. Run: mvn spring-boot:run
     * 2. Or build JAR: mvn clean package
     *    Then run: java -jar target/library-1.0.0.jar
     * 
     * @param args - Command line arguments (not used in this project)
     */
    public static void main(String[] args) {
        // SpringApplication.run() starts the Spring Boot application
        // First parameter: current class (LibraryApplication.class)
        // Second parameter: command line arguments
        // The application will start, initialize Spring context, and run the embedded server
        SpringApplication.run(LibraryApplication.class, args);
    }

}
