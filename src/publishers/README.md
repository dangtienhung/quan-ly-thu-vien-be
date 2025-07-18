# Module Quản lý Nhà Xuất Bản (Publishers)

## 📑 Tổng quan

Module Quản lý Nhà Xuất Bản cung cấp các API để quản lý thông tin nhà xuất bản trong hệ thống thư viện. Module này chỉ dành cho admin sử dụng.

## 🔒 Yêu cầu xác thực

- **JWT Authentication**: Tất cả API yêu cầu JWT token hợp lệ
- **Role Required**: Chỉ user có role `admin` mới có quyền truy cập
- **Header**: Gửi kèm Bearer token trong header
  ```
  Authorization: Bearer <your_jwt_token>
  ```

## 🔑 Quyền hạn

- ✅ Chỉ ADMIN mới có quyền truy cập tất cả các endpoints
- ❌ Độc giả (reader) không có quyền truy cập

## 📋 Danh sách API Endpoints

### 1. Tạo Nhà Xuất Bản Mới
```http
POST /publishers
```
- **Mô tả**: Tạo nhà xuất bản mới trong hệ thống
- **Body**: CreatePublisherDto
- **Response**: 201 - Thông tin nhà xuất bản đã tạo
- **Lỗi**:
  - 400: Dữ liệu không hợp lệ

### 2. Lấy Danh Sách Nhà Xuất Bản
```http
GET /publishers
```
- **Mô tả**: Lấy danh sách nhà xuất bản có phân trang
- **Query Parameters**:
  - page: Số trang (mặc định: 1)
  - limit: Số lượng mỗi trang (mặc định: 10)
- **Response**: 200 - Danh sách nhà xuất bản và thông tin phân trang

### 3. Tìm Kiếm Nhà Xuất Bản
```http
GET /publishers/search
```
- **Mô tả**: Tìm kiếm nhà xuất bản theo nhiều tiêu chí
- **Query Parameters**:
  - q: Từ khóa tìm kiếm (tên, địa chỉ, email, điện thoại, quốc gia)
  - page: Số trang (mặc định: 1)
  - limit: Số lượng mỗi trang (mặc định: 10)
- **Response**: 200 - Kết quả tìm kiếm có phân trang

### 4. Lấy Danh Sách Theo Trạng Thái
```http
GET /publishers/status/:isActive
```
- **Mô tả**: Lấy danh sách nhà xuất bản theo trạng thái hoạt động
- **Parameters**:
  - isActive: Trạng thái hoạt động (true/false)
- **Query Parameters**: Hỗ trợ phân trang
- **Response**: 200 - Danh sách nhà xuất bản theo trạng thái

### 5. Lấy Danh Sách Theo Quốc Gia
```http
GET /publishers/country/:country
```
- **Mô tả**: Lấy danh sách nhà xuất bản theo quốc gia
- **Parameters**:
  - country: Tên quốc gia
- **Query Parameters**: Hỗ trợ phân trang
- **Response**: 200 - Danh sách nhà xuất bản theo quốc gia

### 6. Lấy Thống Kê Nhà Xuất Bản
```http
GET /publishers/stats
```
- **Mô tả**: Lấy thống kê tổng quan về nhà xuất bản
- **Response**: 200 - Thống kê chi tiết
  ```json
  {
    "total": 100,
    "active": 85,
    "inactive": 15,
    "byCountry": [
      {"country": "Việt Nam", "count": 60},
      {"country": "Hoa Kỳ", "count": 25}
    ]
  }
  ```

### 7. Lấy Thông Tin Nhà Xuất Bản
```http
GET /publishers/:id
GET /publishers/slug/:slug
```
- **Mô tả**: Lấy thông tin chi tiết nhà xuất bản theo ID hoặc slug
- **Response**: 200 - Thông tin chi tiết nhà xuất bản
- **Lỗi**: 404 - Không tìm thấy nhà xuất bản

### 8. Cập Nhật Thông Tin Nhà Xuất Bản
```http
PATCH /publishers/:id
PATCH /publishers/slug/:slug
```
- **Mô tả**: Cập nhật thông tin nhà xuất bản theo ID hoặc slug
- **Body**: UpdatePublisherDto
- **Response**: 200 - Thông tin nhà xuất bản đã cập nhật
- **Lỗi**:
  - 404: Không tìm thấy nhà xuất bản
  - 400: Dữ liệu không hợp lệ

### 9. Chuyển Đổi Trạng Thái
```http
PATCH /publishers/:id/toggle-status
```
- **Mô tả**: Chuyển đổi trạng thái hoạt động của nhà xuất bản
- **Response**: 200 - Thông tin nhà xuất bản sau khi cập nhật
- **Lỗi**: 404 - Không tìm thấy nhà xuất bản

### 10. Xóa Nhà Xuất Bản
```http
DELETE /publishers/:id
DELETE /publishers/slug/:slug
```
- **Mô tả**: Xóa nhà xuất bản khỏi hệ thống theo ID hoặc slug
- **Response**: 204 - Xóa thành công
- **Lỗi**: 404 - Không tìm thấy nhà xuất bản

## 📝 Validation Rules

### CreatePublisherDto
- **publisherName**: Bắt buộc, chuỗi, tối đa 255 ký tự
- **address**: Bắt buộc, chuỗi
- **phone**: Bắt buộc, định dạng số điện thoại (10-20 ký tự)
- **email**: Bắt buộc, định dạng email hợp lệ, tối đa 255 ký tự
- **website**: Tùy chọn, URL hợp lệ, tối đa 255 ký tự
- **description**: Tùy chọn, chuỗi
- **isActive**: Tùy chọn, boolean (mặc định: true)
- **establishedDate**: Tùy chọn, định dạng YYYY-MM-DD
- **country**: Tùy chọn, chuỗi, tối đa 100 ký tự

### UpdatePublisherDto
- Tất cả trường là không bắt buộc
- Các quy tắc validation giống CreatePublisherDto

## 🎯 Business Rules

1. **Tạo Nhà Xuất Bản**
   - Tên nhà xuất bản không được trùng lặp
   - Slug tự động tạo từ tên nhà xuất bản
   - Mặc định trạng thái active khi tạo mới

2. **Quản Lý Trạng Thái**
   - Nhà xuất bản inactive không thể được gán cho sách mới
   - Có thể chuyển đổi trạng thái bất kỳ lúc nào

3. **Xóa Nhà Xuất Bản**
   - Chỉ có thể xóa nhà xuất bản không có sách liên quan
   - Xóa vĩnh viễn khỏi hệ thống

4. **Slug Generation**
   - Tự động tạo slug từ tên nhà xuất bản
   - Slug phải là duy nhất trong hệ thống
   - Hỗ trợ tiếng Việt có dấu

## 📊 Monitoring

- Theo dõi số lượng nhà xuất bản active/inactive
- Thống kê nhà xuất bản theo quốc gia
- Theo dõi hoạt động tạo/sửa/xóa nhà xuất bản
- Monitoring hiệu suất tìm kiếm

## 🔍 Tính năng Tìm kiếm

### Tìm kiếm cơ bản
- Tìm theo tên nhà xuất bản
- Tìm theo địa chỉ
- Tìm theo email
- Tìm theo số điện thoại
- Tìm theo quốc gia

### Lọc dữ liệu
- Lọc theo trạng thái hoạt động
- Lọc theo quốc gia
- Sắp xếp theo ngày tạo (mới nhất)

## 🚀 Tối ưu hóa

### Database Indexes
- Index trên publisherName để tìm kiếm nhanh
- Index trên slug để truy cập nhanh
- Index trên isActive để lọc trạng thái
- Index trên country để lọc quốc gia

### Performance Tips
- Sử dụng pagination cho tất cả danh sách
- Cache thống kê để giảm tải database
- Optimize query với proper indexing

## 📈 Tương lai

### Tính năng mở rộng
- Quản lý hợp đồng với nhà xuất bản
- Theo dõi lịch sử giao dịch
- Đánh giá và xếp hạng nhà xuất bản
- Tích hợp API của nhà xuất bản

### Tích hợp
- Kết nối với module Books
- Báo cáo thống kê nâng cao
- Notification system
- Audit trail cho các thay đổi