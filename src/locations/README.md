# 📍 Module Locations - Quản lý Vị trí Kệ sách

## 📋 Tổng quan

Module Locations quản lý các vị trí kệ sách trong thư viện, bao gồm thông tin chi tiết về tầng, khu vực, số kệ và trạng thái hoạt động của từng vị trí.

## 🔐 Xác thực và Phân quyền

### **Vai trò được phép:**

- **Reader**: Xem danh sách vị trí, tìm kiếm vị trí
- **Admin**: Tất cả quyền (tạo, cập nhật, xóa, quản lý trạng thái)

### **Endpoints yêu cầu quyền Admin:**

- `POST /locations` - Tạo vị trí mới
- `PATCH /locations/:id` - Cập nhật vị trí
- `PATCH /locations/slug/:slug` - Cập nhật vị trí theo slug
- `DELETE /locations/:id` - Xóa vị trí
- `DELETE /locations/slug/:slug` - Xóa vị trí theo slug

## 🚀 API Endpoints

### **1. Tạo vị trí mới**

```http
POST /locations
```

**Request Body:**

```json
{
  "name": "Kệ A1 - Tầng 1",
  "description": "Kệ sách khoa học tự nhiên, tầng 1, khu A",
  "floor": 1,
  "section": "Khu A",
  "shelf": "A1",
  "isActive": true
}
```

### **2. Lấy danh sách tất cả vị trí**

```http
GET /locations?page=1&limit=10
```

**Response:**

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Kệ A1 - Tầng 1",
      "slug": "ke-a1-tang-1",
      "description": "Kệ sách khoa học tự nhiên, tầng 1, khu A",
      "floor": 1,
      "section": "Khu A",
      "shelf": "A1",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
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

### **3. Tìm kiếm vị trí**

```http
GET /locations/search?q=Kệ A1&page=1&limit=10
```

**Mô tả:** Tìm kiếm vị trí theo tên, mô tả, khu vực hoặc số kệ.

### **4. Lấy vị trí theo ID**

```http
GET /locations/550e8400-e29b-41d4-a716-446655440000
```

### **5. Lấy vị trí theo slug**

```http
GET /locations/slug/ke-a1-tang-1
```

### **6. Cập nhật vị trí theo ID**

```http
PATCH /locations/550e8400-e29b-41d4-a716-446655440000
```

**Request Body:**

```json
{
  "name": "Kệ A1 - Tầng 1 (Cập nhật)",
  "description": "Kệ sách khoa học tự nhiên, tầng 1, khu A - Đã cập nhật",
  "isActive": false
}
```

### **7. Cập nhật vị trí theo slug**

```http
PATCH /locations/slug/ke-a1-tang-1
```

### **8. Xóa vị trí theo ID**

```http
DELETE /locations/550e8400-e29b-41d4-a716-446655440000
```

### **9. Xóa vị trí theo slug**

```http
DELETE /locations/slug/ke-a1-tang-1
```

## 📊 Cấu trúc Dữ liệu

### **Location Entity:**

```typescript
interface Location {
  id: string;                    // UUID - ID duy nhất
  name: string;                  // Tên vị trí (VD: "Kệ A1 - Tầng 1")
  slug: string;                  // Slug cho URL thân thiện (tự động tạo)
  description?: string;          // Mô tả chi tiết
  floor?: number;                // Tầng của thư viện
  section?: string;              // Khu vực (VD: "Khu A", "Khu B")
  shelf?: string;                // Số kệ (VD: "A1", "B2")
  isActive: boolean;             // Trạng thái hoạt động
  createdAt: Date;               // Ngày tạo
  updatedAt: Date;               // Ngày cập nhật cuối
}
```

## ✅ Quy tắc Nghiệp vụ

### **1. Tạo vị trí:**

- ✅ Tên vị trí phải unique
- ✅ Slug được tự động tạo từ tên
- ✅ Mặc định `isActive = true`
- ✅ Tất cả trường khác đều tùy chọn

### **2. Quản lý trạng thái:**

- ✅ Chỉ admin có thể thay đổi trạng thái
- ✅ Khi `isActive = false`, vị trí không thể được gán cho PhysicalCopy mới
- ✅ PhysicalCopy hiện tại vẫn giữ nguyên vị trí

### **3. Xóa vị trí:**

- ✅ Khi xóa Location, PhysicalCopy.location_id được set NULL
- ✅ Không thể xóa vị trí đang có PhysicalCopy (nếu cần thiết)

### **4. Tìm kiếm:**

- ✅ Tìm kiếm theo tên, mô tả, khu vực, số kệ
- ✅ Hỗ trợ phân trang
- ✅ Sắp xếp theo ngày tạo (mới nhất trước)

## 🔍 Tính năng Tìm kiếm

### **Tìm kiếm theo:**

- Tên vị trí (VD: "Kệ A1")
- Mô tả chi tiết
- Khu vực (VD: "Khu A")
- Số kệ (VD: "A1")

### **Lọc theo:**

- Trạng thái hoạt động (`isActive`)
- Tầng (`floor`)
- Khu vực (`section`)

## 📈 Thống kê và Báo cáo

### **Thống kê tổng quan:**

- Tổng số vị trí
- Số vị trí đang hoạt động
- Số vị trí tạm ngưng
- Phân bố theo tầng
- Phân bố theo khu vực

### **Thống kê sử dụng:**

- Vị trí có nhiều PhysicalCopy nhất
- Vị trí trống
- Hiệu quả sử dụng không gian

## ⚡ Tối ưu Hiệu suất

### **Database Indexes:**

```sql
-- Indexes cho performance
CREATE INDEX idx_locations_name ON locations(name);
CREATE INDEX idx_locations_slug ON locations(slug);
CREATE INDEX idx_locations_floor ON locations(floor);
CREATE INDEX idx_locations_section ON locations(section);
CREATE INDEX idx_locations_is_active ON locations(isActive);
CREATE INDEX idx_locations_created_at ON locations(createdAt);
```

### **Query Optimization:**

- Sử dụng pagination cho tất cả danh sách
- Efficient filtering và sorting
- Slug-based lookup cho performance tốt

## 🔄 Tích hợp với Module khác

### **PhysicalCopyModule:**

- PhysicalCopy liên kết với Location qua `location_id`
- Khi xóa Location, PhysicalCopy.location_id = NULL
- Hỗ trợ tìm kiếm PhysicalCopy theo vị trí

### **BooksModule:**

- Gián tiếp liên kết qua PhysicalCopy
- Hỗ trợ tìm kiếm sách theo vị trí

## 🚀 Tính năng Nâng cao

### **1. Quản lý phân cấp:**

- Tầng → Khu vực → Kệ
- Hỗ trợ tìm kiếm theo cấp độ
- Thống kê theo từng cấp

### **2. Slug Management:**

- Tự động tạo slug từ tên
- Slug unique và SEO-friendly
- Hỗ trợ truy cập qua URL thân thiện

### **3. Status Management:**

- Quản lý trạng thái hoạt động
- Ảnh hưởng đến việc gán vị trí mới
- Tracking lịch sử thay đổi

### **4. Bulk Operations:**

- Tạo nhiều vị trí cùng lúc
- Cập nhật hàng loạt
- Import/Export dữ liệu

## 📝 Validation Rules

### **CreateLocationDto:**

- `name`: Chuỗi, tối đa 255 ký tự, bắt buộc
- `description`: Chuỗi, tùy chọn
- `floor`: Số nguyên >= 1, tùy chọn
- `section`: Chuỗi, tối đa 100 ký tự, tùy chọn
- `shelf`: Chuỗi, tối đa 50 ký tự, tùy chọn
- `isActive`: Boolean, mặc định true, tùy chọn

### **UpdateLocationDto:**

- Kế thừa tất cả rules từ CreateLocationDto
- Tất cả fields đều tùy chọn

## 🔧 Monitoring và Logging

### **Key Metrics:**

- Số lượng vị trí theo trạng thái
- Tỷ lệ sử dụng vị trí
- Hiệu quả phân bố không gian
- Tần suất truy cập vị trí

### **Error Tracking:**

- Lỗi validation tên duplicate
- Lỗi tạo slug không hợp lệ
- Lỗi cập nhật trạng thái không hợp lệ

## 🏗️ Cấu trúc Thư viện

### **Quy ước đặt tên:**

```
Tầng 1: Khu A, Khu B, Khu C
├── Kệ A1, A2, A3... (Khoa học tự nhiên)
├── Kệ B1, B2, B3... (Khoa học xã hội)
└── Kệ C1, C2, C3... (Văn học)

Tầng 2: Khu D, Khu E, Khu F
├── Kệ D1, D2, D3... (Lịch sử)
├── Kệ E1, E2, E3... (Địa lý)
└── Kệ F1, F2, F3... (Nghệ thuật)
```

### **Format tên vị trí:**

- **Chuẩn**: `Kệ {Shelf} - Tầng {Floor}`
- **Ví dụ**: `Kệ A1 - Tầng 1`, `Kệ B3 - Tầng 2`

## 🚀 Roadmap

### **Phase 1 - Core Features:**

- ✅ CRUD operations
- ✅ Slug management
- ✅ Search và filtering
- ✅ Status management

### **Phase 2 - Advanced Features:**

- 📋 Location hierarchy management
- 📋 Bulk import/export
- 📋 Location analytics dashboard
- 📋 QR code generation

### **Phase 3 - Enterprise Features:**

- 📋 Multi-library support
- 📋 Advanced location tracking
- 📋 Integration với external systems
- 📋 Mobile app support

## 📞 Hỗ trợ

**Module Version**: 1.0
**Last Updated**: 2024-01-01
**Dependencies**: None (Core module)

**Access Points:**

- Swagger UI: `/api#/Locations`
- Base URL: `/locations`

**Performance Targets:**

- Search Response: < 100ms
- Create Location: < 200ms
- Slug Generation: < 50ms
- Concurrent Operations: 100+

## 🔗 Liên kết

- [Physical Copy Module](../physical-copy/README.md) - Quản lý bản sao vật lý
- [Books Module](../books/README.md) - Quản lý sách
- [System Documentation](../../SYSTEM.md) - Tổng quan hệ thống
