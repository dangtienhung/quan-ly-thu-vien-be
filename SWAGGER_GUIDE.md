# Swagger API Documentation Guide

## Tổng quan
Dự án này đã được tích hợp Swagger UI để cung cấp tài liệu API tương tác. Swagger UI cho phép bạn:
- Xem tất cả các API endpoints
- Test API trực tiếp từ giao diện web
- Xem schema của request/response

## Cách truy cập Swagger UI

1. **Khởi động ứng dụng:**
   ```bash
   npm run dev
   ```

2. **Truy cập Swagger UI:**
   - Mở trình duyệt và truy cập: `http://localhost:8000/api`
   - Giao diện Swagger UI sẽ hiển thị tất cả các API endpoints

## API Endpoints đã được tài liệu hóa

### Products API
- `POST /products` - Tạo product mới
- `GET /products` - Lấy danh sách tất cả products
- `GET /products/:id` - Lấy product theo ID
- `PATCH /products/:id` - Cập nhật product theo ID
- `DELETE /products/:id` - Xóa product theo ID

## Tính năng Swagger đã được thêm

### 1. API Documentation
- **Title:** Kojachi Backend API
- **Description:** API documentation for Kojachi backend application
- **Version:** 1.0
- **Tags:** products - Product management endpoints

### 2. Request/Response Validation
- Sử dụng `class-validator` để validate request data
- Tự động generate schema cho DTO và Entity
- Hiển thị example values trong Swagger UI

### 3. API Decorators đã sử dụng
- `@ApiTags()` - Nhóm endpoints theo tags
- `@ApiOperation()` - Mô tả chức năng của endpoint
- `@ApiResponse()` - Mô tả response có thể có
- `@ApiParam()` - Mô tả parameters
- `@ApiBody()` - Mô tả request body
- `@ApiProperty()` - Mô tả properties của DTO/Entity

### 4. Authentication Support
- Đã thêm `addBearerAuth()` để hỗ trợ Bearer token authentication
- Option `persistAuthorization: true` để lưu token giữa các request

## Cách sử dụng Swagger UI

1. **Xem API endpoints:** Các endpoints được nhóm theo tags (ví dụ: "products")

2. **Test API:**
   - Click vào endpoint muốn test
   - Click "Try it out"
   - Nhập dữ liệu cần thiết
   - Click "Execute"
   - Xem kết quả trong phần "Response"

3. **Xem Schema:**
   - Click vào "Schemas" ở cuối trang
   - Xem cấu trúc của các model/DTO

## Lưu ý quan trọng

1. **Database:** Đảm bảo PostgreSQL đang chạy với config trong file `.env`
2. **Port:** Ứng dụng chạy trên port 8000 (có thể thay đổi trong `.env`)
3. **Validation:** Tất cả request data sẽ được validate theo schema đã định nghĩa

## Troubleshooting

1. **Lỗi "Cannot find module '@nestjs/swagger'":**
   ```bash
   npm install
   ```

2. **Ứng dụng không khởi động:**
   - Kiểm tra PostgreSQL có đang chạy không
   - Kiểm tra config database trong `.env`

3. **Swagger UI không hiển thị:**
   - Đảm bảo truy cập đúng URL: `http://localhost:8000/api`
   - Kiểm tra console log xem có lỗi không