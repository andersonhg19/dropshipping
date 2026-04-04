# Uses an OpenJDK image for Java
FROM eclipse-temurin:17-jre-jammy

# Sets the working directory
WORKDIR /app

# Copy the JAR file built in the container
COPY target/discovery-service-0.0.1-SNAPSHOT.jar app.jar

# Copy the properties file to the working directory
COPY src/main/resources/application.properties application.properties

# Expone el puerto en el que la aplicación se ejecutará
EXPOSE 8840

# Comando para ejecutar la aplicación
CMD ["java", "-jar", "app.jar"]
