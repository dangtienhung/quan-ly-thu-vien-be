# Users Module

Module quản lý người dùng trong hệ thống thư viện.

## Features

- Tạo, đọc, cập nhật, xóa người dùng
- Quản lý vai trò và trạng thái tài khoản
- Xác thực và phân quyền
- Import người dùng từ file Excel
- Upload và đọc file Excel

## API Endpoints

### 1. Tạo người dùng mới
```
POST /api/users
```

### 2. Lấy danh sách người dùng
```
GET /api/users?page=1&limit=10&type=reader&search=keyword
```

### 3. Lấy thông tin người dùng theo ID
```
GET /api/users/:id
```

### 4. Cập nhật người dùng
```
PATCH /api/users/:id
```

### 5. Xóa người dùng
```
DELETE /api/users/:id
```

### 6. Tạo nhiều người dùng cùng lúc (Bulk Import)
```
POST /api/users/bulk
```

### 7. Upload và đọc file Excel
```
POST /api/users/upload-excel
```

**Endpoint mới:** Upload file Excel để đọc nội dung và validate dữ liệu trước khi import.

#### Request:
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Form data với field `file` chứa file Excel (.xlsx, .xls)
- Authorization: Bearer token (JWT)

#### Response:
```json
{
  "message": "File Excel đã được upload và đọc thành công",
  "filename": "users.xlsx",
  "size": 1024,
  "totalRows": 2,
  "validRows": 2,
  "invalidRows": 0,
  "errors": [
    "Dòng 3: Thiếu email",
    "Dòng 7: Email không hợp lệ"
  ],
  "data": [
    {
      "Mã": "SV001",
      "Tên đăng nhập": "nguyen_van_a",
      "Mật khẩu": "123456",
      "Email": "nguyenvana@example.com",
      "Vai trò": "học sinh",
      "Trạng thái": "hoạt động",
      "Ngày sinh": "15/06/1995",
      "Giới tính": "male",
      "Địa chỉ": "123 Đường ABC, Quận 1, TP.HCM",
      "Số điện thoại": "0123456789",
      "Loại độc giả": "học sinh",
      "Ngày bắt đầu": "01/01/2024",
      "Ngày kết thúc": "31/12/2025",
      "_rowIndex": 2
    }
  ]
}
```

#### Tính năng:
- ✅ Hỗ trợ file .xlsx và .xls
- ✅ Tự động detect và parse các cột Excel
- ✅ Validate dữ liệu theo DTO backend
- ✅ Xử lý ngày tháng từ Excel
- ✅ Báo cáo chi tiết số dòng hợp lệ/không hợp lệ
- ✅ Liệt kê các lỗi validation với số dòng cụ thể
- ✅ Giới hạn hiển thị tối đa 20 lỗi để tránh spam

## Format Excel yêu cầu

### Cột bắt buộc:
| Tên cột | Mô tả | Ví dụ |
|----------|--------|--------|
| Mã | Mã người dùng | SV001 |
| Tên đăng nhập | Username | nguyen_van_a |
| Mật khẩu | Password (6-255 ký tự) | 123456 |
| Email | Địa chỉ email | nguyenvana@example.com |
| Vai trò | Vai trò trong hệ thống | học sinh, nhân viên, giáo viên |
| Trạng thái | Trạng thái hoạt động | hoạt động, bị cấm |
| Ngày sinh | Ngày sinh (dd/mm/yyyy) | 15/06/1995 |
| Giới tính | Giới tính | male, female, other |
| Địa chỉ | Địa chỉ nhà | 123 Đường ABC, Quận 1, TP.HCM |
| Số điện thoại | Số điện thoại | 0123456789 |
| Loại độc giả | Loại độc giả | học sinh, giáo viên, nhân viên |
| Ngày bắt đầu | Ngày bắt đầu thẻ (dd/mm/yyyy) | 01/01/2024 |
| Ngày kết thúc | Ngày kết thúc thẻ (dd/mm/yyyy) | 31/12/2025 |

### Giá trị enum được chấp nhận:

#### Vai trò:
- `học sinh`
- `nhân viên`
- `giáo viên`

#### Trạng thái:
- `hoạt động`
- `bị cấm`

#### Giới tính:
- `male`
- `female`
- `other`

#### Loại độc giả:
- `học sinh`
- `giáo viên`
- `nhân viên`

## Workflow Import

1. **Upload Excel**: Sử dụng endpoint `/api/users/upload-excel` để upload file
2. **Validate**: API sẽ tự động validate dữ liệu và trả về kết quả
3. **Review**: Kiểm tra số dòng hợp lệ/không hợp lệ và các lỗi
4. **Import**: Sử dụng endpoint `/api/users/bulk` để import dữ liệu đã validate

## Error Handling

API sẽ trả về các lỗi validation chi tiết:
- Thiếu trường bắt buộc
- Giá trị enum không hợp lệ
- Độ dài mật khẩu không đúng
- Định dạng ngày không hợp lệ

## Security

- Endpoint yêu cầu JWT authentication
- Chỉ admin mới có quyền upload Excel
- Validate file type và size
- Sanitize dữ liệu đầu vào

## Dependencies

- `xlsx`: Đọc và parse file Excel
- `@nestjs/platform-express`: File upload handling
- `class-validator`: Validation DTO
