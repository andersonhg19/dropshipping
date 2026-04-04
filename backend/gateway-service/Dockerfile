# Uses an OpenJDK image for Java
FROM eclipse-temurin:17-jre-jammy

# Sets the working directory
WORKDIR /app

# Copy the properties file to the working directory
COPY src/main/resources/application.yml application.yml

# Copy the JAR file built in the container
COPY target/gateway-service-0.0.1-SNAPSHOT.jar app.jar

# Expone el puerto en el que la aplicación se ejecutará
EXPOSE 8841

# Comando para ejecutar la aplicación
CMD ["java", "-jar", "app.jar"]
