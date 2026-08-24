FROM gradle:9.1.0-jdk25 AS build

WORKDIR /app
COPY . .
RUN gradle test bootJar --no-daemon

FROM eclipse-temurin:25-jre

WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
