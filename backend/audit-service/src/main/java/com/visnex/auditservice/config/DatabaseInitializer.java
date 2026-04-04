package com.visnex.auditservice.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

/**
 * Utility class to initialize the audit_db database before Spring Boot attempts to connect.
 * This is called from the main method before SpringApplication.run() to ensure the database exists.
 */
public class DatabaseInitializer {
    
    /**
     * Initialize the audit_db database if it doesn't exist.
     * This method should be called BEFORE SpringApplication.run() to prevent connection errors.
     */
    public static void initializeDatabase(String datasourceUrl, String username, String password) {
        try {
            String dbName = "audit_db";
            
            if (datasourceUrl == null || datasourceUrl.isEmpty()) {
                System.err.println("WARN: Datasource URL not found. Skipping database initialization.");
                return;
            }
            
            // Extraer URL base (sin el nombre de la BD)
            int lastSlash = datasourceUrl.lastIndexOf("/");
            if (lastSlash == -1) {
                System.err.println("WARN: Invalid datasource URL format: " + datasourceUrl);
                return;
            }
            
            String baseUrl = datasourceUrl.substring(0, lastSlash);
            String postgresUrl = baseUrl + "/postgres";
            
            System.out.println("Checking if database '" + dbName + "' exists...");
            
            try (Connection conn = DriverManager.getConnection(postgresUrl, username, password);
                 Statement stmt = conn.createStatement()) {
                
                // Verificar si la BD existe
                String checkDbSql = "SELECT 1 FROM pg_database WHERE datname = '" + dbName + "'";
                try (ResultSet rs = stmt.executeQuery(checkDbSql)) {
                    boolean dbExists = rs.next();
                    
                    if (!dbExists) {
                        System.out.println("Database '" + dbName + "' does not exist. Creating...");
                        String createDbSql = "CREATE DATABASE " + dbName;
                        stmt.executeUpdate(createDbSql);
                        System.out.println("Database '" + dbName + "' created successfully.");
                    } else {
                        System.out.println("Database '" + dbName + "' already exists.");
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("ERROR: Could not initialize database automatically: " + e.getMessage());
            e.printStackTrace();
            // No lanzar excepción aquí para no bloquear el inicio si hay problemas de red temporales
        }
    }
}

