# Bước 1: Dùng môi trường Maven và Java 21 để build code
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
# Lệnh này sẽ tự động tải thư viện và đóng gói thành file .jar
RUN mvn clean package -DskipTests

# Bước 2: Tạo môi trường chạy nhẹ nhàng cho ứng dụng
FROM eclipse-temurin:21-jre
WORKDIR /app
# Copy file .jar đã đóng gói ở bước 1 sang
COPY --from=build /app/target/*.jar app.jar
# Bật cổng 8080
EXPOSE 8080
# Lệnh khởi động server
ENTRYPOINT ["java", "-jar", "app.jar"]