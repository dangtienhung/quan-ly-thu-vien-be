# ReaderType Relations Update

## Tổng quan

Đã cập nhật tất cả các methods trong `ReservationsService` để include `readerType` trong relations, cho phép frontend có thể truy cập thông tin chi tiết về loại độc giả.

## Các thay đổi

### 1. **Cập nhật Relations**

Tất cả các methods query reservations đã được cập nhật để include `reader.readerType`:

```typescript
// Trước
relations: ['reader', 'book', 'physicalCopy']

// Sau
relations: ['reader', 'reader.readerType', 'book', 'physicalCopy']
```

### 2. **Methods đã được cập nhật**

#### **findAll()**
- Lấy tất cả đặt trước với phân trang
- Include readerType để frontend có thể hiển thị thông tin loại độc giả

#### **findOne()**
- Tìm đặt trước theo ID
- Include readerType cho chi tiết đặt trước

#### **search()**
- Tìm kiếm đặt trước theo từ khóa
- Include readerType trong kết quả tìm kiếm

#### **findByStatus()**
- Lấy đặt trước theo trạng thái
- Include readerType để phân loại độc giả

#### **findByReader()**
- Lấy đặt trước theo độc giả
- Include readerType để hiển thị thông tin loại độc giả

#### **findByBook()**
- Lấy đặt trước theo sách
- Include readerType để xem ai đã đặt trước sách

#### **findExpiringSoon()**
- Lấy đặt trước sắp hết hạn
- Include readerType để gửi thông báo phù hợp

#### **findExpired()**
- Lấy đặt trước đã hết hạn
- Include readerType để xử lý phù hợp

### 3. **Cấu trúc dữ liệu trả về**

Với cập nhật này, response sẽ có cấu trúc:

```json
{
  "data": [
    {
      "id": "uuid",
      "reader_id": "uuid",
      "reader": {
        "id": "uuid",
        "fullName": "John Doe",
        "readerType": {
          "id": "uuid",
          "typeName": "student",
          "maxBorrowLimit": 5,
          "borrowDurationDays": 14,
          "description": "Student reader type",
          "lateReturnFinePerDay": 1000
        }
      },
      "book": { ... },
      "physicalCopy": { ... }
    }
  ],
  "meta": { ... }
}
```

### 4. **Lợi ích**

1. **Frontend có thể truy cập thông tin readerType**:
   - `borrowDurationDays`: Số ngày mượn tối đa
   - `maxBorrowLimit`: Số lượng sách mượn tối đa
   - `typeName`: Tên loại độc giả
   - `lateReturnFinePerDay`: Phí trả muộn mỗi ngày

2. **Tính toán ngày trả chính xác**:
   - Frontend có thể tính ngày trả dựa trên `borrowDurationDays`
   - Không cần gọi API riêng để lấy thông tin readerType

3. **Hiển thị thông tin phong phú**:
   - Hiển thị loại độc giả trong danh sách
   - Phân loại độc giả theo readerType
   - Áp dụng quy tắc phù hợp với từng loại độc giả

### 5. **Backward Compatibility**

- Tất cả các API endpoints vẫn hoạt động như cũ
- Chỉ thêm thông tin readerType vào response
- Không thay đổi cấu trúc API hiện tại

### 6. **Performance Impact**

- **Minimal**: Chỉ thêm 1 JOIN với bảng reader_types
- **Optimized**: Sử dụng LEFT JOIN để tránh mất dữ liệu
- **Cached**: ReaderType data thường ít thay đổi, có thể cache

### 7. **Testing**

Đã tạo test cases để verify:
- Tất cả methods include `reader.readerType` trong relations
- Response structure có chứa readerType data
- Backward compatibility được đảm bảo

## Sử dụng

### Frontend có thể sử dụng:

```typescript
// Lấy thông tin readerType từ reservation
const reservation = await ReservationsAPI.getById(id);
const readerType = reservation.reader.readerType;

// Tính ngày trả dựa trên readerType
const dueDate = new Date();
dueDate.setDate(dueDate.getDate() + readerType.borrowDurationDays);

// Hiển thị thông tin loại độc giả
console.log(`Loại độc giả: ${readerType.typeName}`);
console.log(`Thời gian mượn: ${readerType.borrowDurationDays} ngày`);
console.log(`Số lượng mượn tối đa: ${readerType.maxBorrowLimit}`);
```

### API Response Example:

```bash
GET /api/reservations
```

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "reader_id": "reader-uuid",
      "reader": {
        "id": "reader-uuid",
        "fullName": "Nguyễn Văn An",
        "readerType": {
          "id": "type-uuid",
          "typeName": "student",
          "maxBorrowLimit": 5,
          "borrowDurationDays": 14,
          "description": "Sinh viên",
          "lateReturnFinePerDay": 1000
        }
      },
      "book": { ... },
      "physicalCopy": { ... }
    }
  ],
  "meta": { ... }
}
```

## Kết luận

Cập nhật này giúp frontend có thể truy cập đầy đủ thông tin về loại độc giả mà không cần gọi API riêng, cải thiện performance và trải nghiệm người dùng.
