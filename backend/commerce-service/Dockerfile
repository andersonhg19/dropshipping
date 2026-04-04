FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY target/commerce-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8847
CMD ["java", "-jar", "app.jar"]
