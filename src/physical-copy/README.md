# Module Quản lý Bản sao Vật lý (Physical Copies)

## 📑 Tổng quan

Module Quản lý Bản sao Vật lý cung cấp các API để quản lý thông tin về các bản sao vật lý của sách trong hệ thống thư viện. Module này cho phép theo dõi tình trạng, vị trí và thông tin chi tiết của từng bản sao.

## 🔒 Yêu cầu xác thực

- **JWT Authentication**: Tất cả API yêu cầu JWT token hợp lệ.
- **Role Required**: Chỉ user có role `admin` mới có quyền thêm/sửa/xóa.
- **Header**: Gửi kèm Bearer token trong header
  ```
  Authorization: Bearer <your_jwt_token>
  ```

## 🔑 Quyền hạn

- ✅ ADMIN: Có quyền thực hiện tất cả các operations.
- ✅ USER: Chỉ có quyền xem (GET endpoints).

## 📋 Danh sách API Endpoints

### 1. Tạo Bản sao Vật lý Mới
```http
POST /physical-copies
```
- **Mô tả**: Tạo bản sao vật lý mới trong hệ thống.
- **Role**: Admin
- **Body**:
  ```json
  {
    "book_id": "550e8400-e29b-41d4-a716-446655440000",
    "barcode": "LIB-2024-001",
    "status": "available",
    "current_condition": "new",
    "purchase_date": "2024-01-01",
    "purchase_price": 75000,
    "location": "Kệ A2-T3",
    "notes": "Sách mới, chưa sử dụng."
  }
  ```
- **Response**: 201 - Thông tin bản sao đã tạo.

### 2. Lấy Danh Sách Bản sao Vật lý
```http
GET /physical-copies
```
- **Mô tả**: Lấy danh sách các bản sao vật lý có phân trang.
- **Query Parameters**:
  - page: Số trang (mặc định: 1)
  - limit: Số lượng mỗi trang (mặc định: 10)
- **Response**: 200 - Danh sách bản sao và thông tin phân trang.

### 3. Tìm Kiếm Bản sao Vật lý
```http
GET /physical-copies/search
```
- **Mô tả**: Tìm kiếm bản sao vật lý theo mã barcode hoặc trạng thái.
- **Query Parameters**:
  - q: Từ khóa tìm kiếm
  - page, limit: Thông tin phân trang
- **Response**: 200 - Kết quả tìm kiếm.

### 4. Lấy Chi tiết Bản sao Vật lý
```http
GET /physical-copies/:id
```
- **Mô tả**: Lấy thông tin chi tiết của bản sao vật lý.
- **Response**: 200 - Thông tin bản sao.

### 5. Cập nhật Bản sao Vật lý
```http
PATCH /physical-copies/:id
```
- **Role**: Admin
- **Body**: Cập nhật thông tin bản sao.
- **Response**: 200 - Thông tin bản sao sau khi cập nhật.

### 6. Xóa Bản sao Vật lý
```http
DELETE /physical-copies/:id
```
- **Role**: Admin
- **Response**: 204 - Xóa thành công.

## 📝 Validation Rules

### CreatePhysicalCopyDto
- **book_id**: Bắt buộc, UUID của sách.
- **barcode**: Bắt buộc, string, unique.
- **status**: Bắt buộc, enum (available, borrowed, reserved, damaged, lost, maintenance).
- **current_condition**: Bắt buộc, enum (new, good, worn, damaged).
- **purchase_date**: Bắt buộc, date.
- **purchase_price**: Bắt buộc, decimal.
- **location**: Bắt buộc, string.
- **notes**: Optional, string.

## 🎯 Business Rules

1. **Quy tắc Tình trạng**:
   - Bản sao có thể có các trạng thái khác nhau (available, borrowed, reserved, damaged, lost, maintenance).
   - Chỉ những bản sao có trạng thái `available` mới có thể được mượn.

2. **Quy tắc Barcode**:
   - Mỗi bản sao phải có mã barcode duy nhất để dễ dàng theo dõi và quản lý.

3. **Quy tắc Vị trí**:
   - Vị trí của bản sao trong thư viện phải được ghi rõ để dễ dàng tìm kiếm.

## 🔍 Response Format

### Bản sao Đơn lẻ
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "book_id": "550e8400-e29b-41d4-a716-446655440000",
  "barcode": "LIB-2024-001",
  "status": "available",
  "current_condition": "new",
  "purchase_date": "2024-01-01",
  "purchase_price": 75000,
  "location": "Kệ A2-T3",
  "notes": "Sách mới, chưa sử dụng.",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Danh sách có Phân trang
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "barcode": "LIB-2024-001",
      "status": "available",
      // ... các trường khác
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 50,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## 🚀 Ví dụ Sử dụng

### 1. Tạo Bản sao Vật lý
```bash
curl -X POST "http://localhost:8000/physical-copies" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "book_id": "550e8400-e29b-41d4-a716-446655440000",
    "barcode": "LIB-2024-001",
    "status": "available",
    "current_condition": "new",
    "purchase_date": "2024-01-01",
    "purchase_price": 75000,
    "location": "Kệ A2-T3",
    "notes": "Sách mới, chưa sử dụng."
  }'
```

### 2. Tìm Kiếm Bản sao Vật lý
```bash
curl "http://localhost:8000/physical-copies/search?q=LIB-2024-001"
```

### 3. Lấy Danh Sách Bản sao Vật lý
```bash
curl "http://localhost:8000/physical-copies?page=1&limit=10"
```

## 📊 Monitoring

- Theo dõi số lượng bản sao theo trạng thái.
- Theo dõi vị trí của các bản sao trong thư viện.
- Theo dõi tình trạng của các bản sao để đảm bảo chất lượng.
