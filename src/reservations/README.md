# 📚 Module Reservations - Quản lý Đặt trước Sách

## 🎯 Tổng quan

Module Reservations được thiết kế để quản lý việc đặt trước sách trong hệ thống thư viện. Module này hỗ trợ:

- ✅ **Tạo đặt trước** với validation nghiêm ngặt
- ✅ **Quản lý trạng thái** đặt trước (pending, fulfilled, cancelled, expired)
- ✅ **Tự động hết hạn** đặt trước
- ✅ **Thống kê** và báo cáo
- ✅ **Tìm kiếm** và lọc đặt trước
- ✅ **Bulk operations** cho nhiều đặt trước

## 🚀 API Endpoints

### **Quản lý Đặt trước**

#### 1. **Tạo đặt trước mới**
```http
POST /api/reservations
```

#### 2. **Tạo nhiều đặt trước cùng lúc**
```http
POST /api/reservations/bulk
```

#### 3. **Lấy danh sách đặt trước**
```http
GET /api/reservations?page=1&limit=10
```

#### 4. **Tìm kiếm đặt trước**
```http
GET /api/reservations/search?q=từ khóa
```

### **Quản lý Trạng thái**

#### 5. **Thực hiện đặt trước (Admin)**
```http
PATCH /api/reservations/{id}/fulfill
```

#### 6. **Hủy đặt trước (Admin)**
```http
PATCH /api/reservations/{id}/cancel
```

#### 7. **Đánh dấu đặt trước hết hạn (Admin)** ⭐ **MỚI**
```http
PATCH /api/reservations/{id}/expire
```

**Request Body:**
```json
{
  "librarianId": "550e8400-e29b-41d4-a716-446655440000",
  "reason": "Độc giả không đến nhận sách"
}
```

#### 8. **Đánh dấu nhiều đặt trước hết hạn (Admin)** ⭐ **MỚI**
```http
POST /api/reservations/bulk-expire
```

**Request Body:**
```json
{
  "reservationIds": [
    "550e8400-e29b-41d4-a716-446655440000",
    "550e8400-e29b-41d4-a716-446655440001"
  ],
  "librarianId": "550e8400-e29b-41d4-a716-446655440000",
  "reason": "Độc giả không đến nhận sách"
}
```

#### 9. **Tự động đánh dấu đặt trước hết hạn (Admin)** ⭐ **MỚI**
```http
POST /api/reservations/auto-expire-expired
```

### **Truy vấn và Lọc**

#### 10. **Lấy đặt trước theo trạng thái**
```http
GET /api/reservations/status/{status}?page=1&limit=10
```

#### 11. **Lấy đặt trước theo độc giả**
```http
GET /api/reservations/reader/{readerId}?page=1&limit=10
```

#### 12. **Lấy đặt trước theo sách**
```http
GET /api/reservations/book/{bookId}?page=1&limit=10
```

#### 13. **Lấy đặt trước sắp hết hạn**
```http
GET /api/reservations/expiring-soon?days=3
```

#### 14. **Lấy đặt trước đã hết hạn**
```http
GET /api/reservations/expired?page=1&limit=10
```

### **Thống kê**

#### 15. **Thống kê tổng quan**
```http
GET /api/reservations/stats
```

#### 16. **Thống kê theo trạng thái**
```http
GET /api/reservations/stats/by-status
```

## 🔧 Business Logic

### **Trạng thái Đặt trước**

- **PENDING**: Đang chờ xử lý
- **FULFILLED**: Đã thực hiện
- **CANCELLED**: Đã hủy
- **EXPIRED**: Đã hết hạn

### **Validation Rules**

1. **Tạo đặt trước:**
   - Độc giả phải đang hoạt động
   - Không được đặt trước trùng lặp
   - Ngày hết hạn phải sau ngày đặt trước

2. **Thực hiện đặt trước:**
   - Chỉ có thể thực hiện đặt trước đang chờ
   - Cần ID thủ thư thực hiện

3. **Hủy đặt trước:**
   - Chỉ có thể hủy đặt trước đang chờ
   - Cần ID thủ thư hủy và lý do

4. **Đánh dấu hết hạn:** ⭐ **MỚI**
   - Có thể đánh dấu đặt trước đang chờ hoặc đã hủy
   - Không thể đánh dấu đặt trước đã thực hiện
   - Cần ID thủ thư và lý do (optional)

## 📊 Database Schema

```sql
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reader_id UUID NOT NULL REFERENCES readers(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  physical_copy_id UUID REFERENCES physical_copies(id) ON DELETE SET NULL,
  reservation_date TIMESTAMP NOT NULL,
  expiry_date TIMESTAMP NOT NULL,
  status ENUM('pending', 'fulfilled', 'cancelled', 'expired') DEFAULT 'pending',
  reader_notes TEXT,
  librarian_notes TEXT,
  fulfillment_date TIMESTAMP,
  fulfilled_by UUID,
  cancelled_date TIMESTAMP,
  cancellation_reason TEXT,
  cancelled_by UUID,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🧪 Testing

### **Test với cURL**

```bash
# Đánh dấu một đặt trước hết hạn
curl -X PATCH "http://localhost:8002/api/reservations/550e8400-e29b-41d4-a716-446655440000/expire" \
  -H "Content-Type: application/json" \
  -d '{
    "librarianId": "550e8400-e29b-41d4-a716-446655440000",
    "reason": "Độc giả không đến nhận sách"
  }'

# Đánh dấu nhiều đặt trước hết hạn
curl -X POST "http://localhost:8002/api/reservations/bulk-expire" \
  -H "Content-Type: application/json" \
  -d '{
    "reservationIds": ["550e8400-e29b-41d4-a716-446655440000"],
    "librarianId": "550e8400-e29b-41d4-a716-446655440000",
    "reason": "Độc giả không đến nhận sách"
  }'

# Tự động đánh dấu tất cả đặt trước hết hạn
curl -X POST "http://localhost:8002/api/reservations/auto-expire-expired"
```

### **Test với Swagger UI**

1. Truy cập: `http://localhost:8002/api`
2. Tìm section "Reservations - Quản lý Đặt trước"
3. Test các endpoint trực tiếp

## ⚠️ Error Handling

### **Common Errors**

#### **400 Bad Request**
```json
{
  "statusCode": 400,
  "message": "Đặt trước đã hết hạn"
}
```

```json
{
  "statusCode": 400,
  "message": "Không thể đánh dấu hết hạn cho đặt trước đã thực hiện"
}
```

#### **404 Not Found**
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy đặt trước với ID {id}"
}
```

## 🔄 Integration

Module Reservations tích hợp với:

- **Readers**: Kiểm tra độc giả hoạt động
- **Books**: Kiểm tra sách tồn tại
- **PhysicalCopies**: Quản lý bản sao vật lý
- **Users**: Thủ thư thực hiện/hủy đặt trước

## 📈 Performance Considerations

- **Indexes** cho các trường thường query
- **Pagination** cho danh sách lớn
- **Bulk operations** cho hiệu suất cao
- **Auto-expire** với batch processing

---

## 📝 Changelog

- `2024-01-01`: Khởi tạo module Reservations
- `2024-01-01`: Thêm API expire reservations ⭐ **MỚI**
- `2024-01-01`: Thêm bulk expire operations ⭐ **MỚI**
- `2024-01-01`: Thêm auto-expire functionality ⭐ **MỚI**
