# 🔧 Hướng Dẫn Khắc Phục Sự Cố Email

## 📋 Các Bước Kiểm Tra và Sửa Lỗi

### 1. Kiểm Tra App Password Gmail

**Vấn đề phổ biến nhất:** App Password không đúng hoặc đã hết hạn.

#### Cách tạo App Password mới:

1. **Đăng nhập vào Google Account**
   - Truy cập: https://myaccount.google.com/
   - Đăng nhập với tài khoản `vanbi12092004@gmail.com`

2. **Bật 2-Step Verification** (nếu chưa bật)
   - Vào "Security" → "2-Step Verification"
   - Bật tính năng này

3. **Tạo App Password**
   - Vào "Security" → "App passwords"
   - Chọn "Mail" và "Other (Custom name)"
   - Đặt tên: "HealthCare Portal"
   - Copy password được tạo (16 ký tự)

4. **Cập nhật application.properties**
   ```properties
   spring.mail.password=YOUR_NEW_APP_PASSWORD
   ```

### 2. Kiểm Tra Cấu Hình Email

#### Các cấu hình đã được thêm:
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=vanbi12092004@gmail.com
spring.mail.password=YOUR_APP_PASSWORD
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.properties.mail.smtp.connectiontimeout=5000
spring.mail.properties.mail.smtp.timeout=5000
spring.mail.properties.mail.smtp.writetimeout=5000
spring.mail.properties.mail.smtp.ssl.trust=smtp.gmail.com
spring.mail.properties.mail.debug=true
```

### 3. Test Chức Năng Email

#### Cách 1: Sử dụng file HTML test
1. Mở file `email-test.html` trong trình duyệt
2. Nhập email test
3. Click "Gửi Email Test"

#### Cách 2: Sử dụng Postman/curl
```bash
# Test gửi email thường
curl -X POST "http://localhost:8080/api/test/send-email?toEmail=your-email@gmail.com"

# Test gửi email reset password
curl -X POST "http://localhost:8080/api/test/send-reset-email?toEmail=your-email@gmail.com"
```

### 4. Kiểm Tra Log Backend

Khi chạy ứng dụng, theo dõi log để xem lỗi chi tiết:

```bash
# Khởi động ứng dụng
mvn spring-boot:run
```

Tìm các log liên quan đến email:
- `🔄 Đang gửi email...`
- `✅ Email đã gửi thành công...`
- `❌ Lỗi khi gửi email...`

### 5. Các Lỗi Thường Gặp

#### Lỗi 1: "535-5.7.8 Username and Password not accepted"
**Nguyên nhân:** App Password sai hoặc đã hết hạn
**Giải pháp:** Tạo App Password mới

#### Lỗi 2: "Connection timeout"
**Nguyên nhân:** Firewall hoặc network
**Giải pháp:** Kiểm tra kết nối internet và firewall

#### Lỗi 3: "Authentication failed"
**Nguyên nhân:** Email hoặc password sai
**Giải pháp:** Kiểm tra lại thông tin đăng nhập

### 6. Debug Mode

Đã bật debug mode trong `application.properties`:
```properties
spring.mail.properties.mail.debug=true
```

Điều này sẽ hiển thị chi tiết quá trình gửi email trong log.

### 7. Kiểm Tra Dependencies

Đảm bảo đã có dependency trong `pom.xml`:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

### 8. Restart Ứng Dụng

Sau khi thay đổi cấu hình:
1. Dừng ứng dụng (Ctrl+C)
2. Chạy lại: `mvn spring-boot:run`

## 🚀 Các Bước Thực Hiện

1. **Tạo App Password mới** theo hướng dẫn trên
2. **Cập nhật** `application.properties` với password mới
3. **Restart** ứng dụng
4. **Test** bằng file HTML hoặc API
5. **Kiểm tra log** để xem kết quả

## 📞 Hỗ Trợ

Nếu vẫn gặp vấn đề, hãy:
1. Chụp màn hình log lỗi
2. Gửi thông tin lỗi chi tiết
3. Kiểm tra xem email test có đến được không 

## 📋 Các Bước Kiểm Tra và Sửa Lỗi

### 1. Kiểm Tra App Password Gmail

**Vấn đề phổ biến nhất:** App Password không đúng hoặc đã hết hạn.

#### Cách tạo App Password mới:

1. **Đăng nhập vào Google Account**
   - Truy cập: https://myaccount.google.com/
   - Đăng nhập với tài khoản `vanbi12092004@gmail.com`

2. **Bật 2-Step Verification** (nếu chưa bật)
   - Vào "Security" → "2-Step Verification"
   - Bật tính năng này

3. **Tạo App Password**
   - Vào "Security" → "App passwords"
   - Chọn "Mail" và "Other (Custom name)"
   - Đặt tên: "HealthCare Portal"
   - Copy password được tạo (16 ký tự)

4. **Cập nhật application.properties**
   ```properties
   spring.mail.password=YOUR_NEW_APP_PASSWORD
   ```

### 2. Kiểm Tra Cấu Hình Email

#### Các cấu hình đã được thêm:
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=vanbi12092004@gmail.com
spring.mail.password=YOUR_APP_PASSWORD
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.properties.mail.smtp.connectiontimeout=5000
spring.mail.properties.mail.smtp.timeout=5000
spring.mail.properties.mail.smtp.writetimeout=5000
spring.mail.properties.mail.smtp.ssl.trust=smtp.gmail.com
spring.mail.properties.mail.debug=true
```

### 3. Test Chức Năng Email

#### Cách 1: Sử dụng file HTML test
1. Mở file `email-test.html` trong trình duyệt
2. Nhập email test
3. Click "Gửi Email Test"

#### Cách 2: Sử dụng Postman/curl
```bash
# Test gửi email thường
curl -X POST "http://localhost:8080/api/test/send-email?toEmail=your-email@gmail.com"

# Test gửi email reset password
curl -X POST "http://localhost:8080/api/test/send-reset-email?toEmail=your-email@gmail.com"
```

### 4. Kiểm Tra Log Backend

Khi chạy ứng dụng, theo dõi log để xem lỗi chi tiết:

```bash
# Khởi động ứng dụng
mvn spring-boot:run
```

Tìm các log liên quan đến email:
- `🔄 Đang gửi email...`
- `✅ Email đã gửi thành công...`
- `❌ Lỗi khi gửi email...`

### 5. Các Lỗi Thường Gặp

#### Lỗi 1: "535-5.7.8 Username and Password not accepted"
**Nguyên nhân:** App Password sai hoặc đã hết hạn
**Giải pháp:** Tạo App Password mới

#### Lỗi 2: "Connection timeout"
**Nguyên nhân:** Firewall hoặc network
**Giải pháp:** Kiểm tra kết nối internet và firewall

#### Lỗi 3: "Authentication failed"
**Nguyên nhân:** Email hoặc password sai
**Giải pháp:** Kiểm tra lại thông tin đăng nhập

### 6. Debug Mode

Đã bật debug mode trong `application.properties`:
```properties
spring.mail.properties.mail.debug=true
```

Điều này sẽ hiển thị chi tiết quá trình gửi email trong log.

### 7. Kiểm Tra Dependencies

Đảm bảo đã có dependency trong `pom.xml`:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

### 8. Restart Ứng Dụng

Sau khi thay đổi cấu hình:
1. Dừng ứng dụng (Ctrl+C)
2. Chạy lại: `mvn spring-boot:run`

## 🚀 Các Bước Thực Hiện

1. **Tạo App Password mới** theo hướng dẫn trên
2. **Cập nhật** `application.properties` với password mới
3. **Restart** ứng dụng
4. **Test** bằng file HTML hoặc API
5. **Kiểm tra log** để xem kết quả

## 📞 Hỗ Trợ

Nếu vẫn gặp vấn đề, hãy:
1. Chụp màn hình log lỗi
2. Gửi thông tin lỗi chi tiết
3. Kiểm tra xem email test có đến được không 