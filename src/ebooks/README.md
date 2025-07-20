# Module Quản lý Sách Điện Tử (Ebooks)

## 📑 Tổng quan

Module Quản lý Sách Điện Tử cung cấp các API để quản lý thông tin sách điện tử trong hệ thống thư viện. Module này cho phép thực hiện các thao tác CRUD trên sách điện tử, bao gồm việc thêm, sửa, xóa và lấy thông tin sách điện tử.

## 🔒 Yêu cầu xác thực

- **JWT Authentication**: Tất cả API yêu cầu JWT token hợp lệ.
- **Role Required**: Chỉ user có role `admin` mới có quyền thêm/sửa/xóa.
- **Header**: Gửi kèm Bearer token trong header
  ```
  Authorization: Bearer <your_jwt_token>
  ```

## 📋 Danh sách API Endpoints

### 1. Tạo File Ebook Cho Sách
```http
POST /ebooks/:id/ebooks
```
- **Mô tả**: Tạo file ebook cho sách.
- **Role**: Admin
- **Param**:
  - `id`: UUID của sách
- **Body**:
  ```json
  {
    "file_path": "path/to/ebook/file",
    "file_size": 1024,
    "file_format": "pdf"
  }
  ```
- **Response**: 201 - Thông tin file ebook đã tạo.

### 2. Lấy Danh Sách File Ebook Của Sách
```http
GET /ebooks/:id/ebooks
```
- **Mô tả**: Lấy danh sách file ebook của sách.
- **Param**:
  - `id`: UUID của sách
- **Query Parameters**:
  - page: Số trang (mặc định: 1)
  - limit: Số lượng mỗi trang (mặc định: 10)
- **Response**: 200 - Danh sách file ebook và thông tin phân trang.

### 3. Cập Nhật File Ebook
```http
PATCH /ebooks/ebooks/:id
```
- **Mô tả**: Cập nhật file ebook.
- **Role**: Admin
- **Param**:
  - `id`: UUID của file ebook
- **Body**:
  ```json
  {
    "file_path": "new/path/to/ebook/file",
    "file_size": 2048,
    "file_format": "epub"
  }
  ```
- **Response**: 200 - Thông tin file ebook sau khi cập nhật.

### 4. Xóa File Ebook
```http
DELETE /ebooks/ebooks/:id
```
- **Mô tả**: Xóa file ebook.
- **Role**: Admin
- **Param**:
  - `id`: UUID của file ebook
- **Response**: 204 - Xóa thành công.

### 5. Tăng Số Lượt Tải Xuống Của File Ebook
```http
POST /ebooks/ebooks/:id/increment-downloads
```
- **Mô tả**: Tăng số lượt tải xuống của file ebook.
- **Param**:
  - `id`: UUID của file ebook
- **Response**: 200 - Cập nhật số lượt tải thành công.

## 📝 Validation Rules

### CreateEBookDto
- **file_path**: Bắt buộc, string, đường dẫn đến file ebook.
- **file_size**: Bắt buộc, number, kích thước file (bytes).
- **file_format**: Bắt buộc, string, định dạng file (ví dụ: pdf, epub).

### UpdateEBookDto
- **file_path**: Optional, string, đường dẫn mới đến file ebook.
- **file_size**: Optional, number, kích thước mới của file (bytes).
- **file_format**: Optional, string, định dạng mới của file.

## 📊 Ví dụ Sử dụng

### 1. Tạo File Ebook
```bash
curl -X POST "http://localhost:8000/ebooks/{id}/ebooks" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "file_path": "path/to/ebook/file",
    "file_size": 1024,
    "file_format": "pdf"
  }'
```

### 2. Lấy Danh Sách File Ebook
```bash
curl "http://localhost:8000/ebooks/{id}/ebooks?page=1&limit=10"
```

### 3. Cập Nhật File Ebook
```bash
curl -X PATCH "http://localhost:8000/ebooks/ebooks/{id}" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "file_path": "new/path/to/ebook/file",
    "file_size": 2048,
    "file_format": "epub"
  }'
```

### 4. Xóa File Ebook
```bash
curl -X DELETE "http://localhost:8000/ebooks/ebooks/{id}" \
  -H "Authorization: Bearer {token}"
```

### 5. Tăng Số Lượt Tải Xuống
```bash
curl -X POST "http://localhost:8000/ebooks/ebooks/{id}/increment-downloads"
```

```

Mẫu này đã được xây dựng để bao gồm tất cả các API endpoints từ file `ebooks.controller.ts`. Bạn có thể điều chỉnh nội dung và các chi tiết khác trong file `README.md` này để phù hợp hơn với yêu cầu và phong cách của dự án của bạn. Nếu bạn cần thêm thông tin hoặc có yêu cầu cụ thể nào khác, hãy cho tôi biết!