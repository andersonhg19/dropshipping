# Usa una imagen base de OpenJDK
FROM eclipse-temurin:17-jre-jammy

# Establece el directorio de trabajo
WORKDIR /app

# Copia el archivo JAR de tu aplicación al contenedor
COPY target/auth-service-0.0.1-SNAPSHOT.jar app.jar

# Expone el puerto que tu aplicación va a usar
EXPOSE 8821

# Define el comando para ejecutar tu aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]
