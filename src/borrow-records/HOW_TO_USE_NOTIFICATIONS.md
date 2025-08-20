# Hướng Dẫn Sử Dụng Hệ Thống Thông Báo

## 📋 Tổng quan

Hệ thống thông báo cho phép:

- **Admin**: Gửi thông báo nhắc nhở cho độc giả sắp đến hạn trả sách
- **Độc giả**: Xem thông báo của mình và đánh dấu đã đọc

## 🔗 Các API chính

### 1. **Admin gửi thông báo nhắc nhở**

```http
POST /api/borrow-records/send-reminders
```

**Request Body:**

```json
{
  "daysBeforeDue": 2,
  "customMessage": "Sách của bạn sắp đến hạn trả trong 2 ngày tới.",
  "readerId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Parameters:**

- `daysBeforeDue`: Số ngày trước khi đến hạn (1-7, mặc định: 2)
- `customMessage`: Nội dung thông báo tùy chỉnh
- `readerId`: ID độc giả cụ thể (nếu không có sẽ gửi cho tất cả)

**Response:**

```json
{
  "success": true,
  "message": "Đã tạo thông báo nhắc nhở cho 3 độc giả về 5 cuốn sách sắp đến hạn trả.",
  "totalReaders": 3,
  "notificationsSent": 5,
  "details": [
    {
      "readerId": "uuid",
      "readerName": "Nguyễn Văn A",
      "bookTitle": "Lập trình Python",
      "dueDate": "2024-12-21T10:00:00.000Z",
      "daysUntilDue": 2
    }
  ]
}
```

### 2. **Độc giả xem thông báo của mình**

```http
GET /api/notifications/reader/{readerId}?page=1&limit=10&status=sent
```

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Nhắc nhở trả sách",
      "message": "Sách của bạn sắp đến hạn trả trong 2 ngày tới.",
      "type": "due_date_reminder",
      "status": "sent",
      "metadata": {
        "bookTitle": "Lập trình Python",
        "dueDate": "2024-12-21T10:00:00.000Z",
        "daysUntilDue": 2
      },
      "created_at": "2024-12-19T10:00:00.000Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

### 3. **Độc giả xem số thông báo chưa đọc**

```http
GET /api/notifications/reader/{readerId}/unread-count
```

**Response:**

```json
{
  "unreadCount": 3
}
```

### 4. **Độc giả đánh dấu thông báo đã đọc**

```http
PATCH /api/notifications/{notificationId}/read
```

### 5. **Độc giả đánh dấu tất cả thông báo đã đọc**

```http
PATCH /api/notifications/reader/{readerId}/read-all
```

### 6. **Admin lấy danh sách tất cả thông báo**

```http
GET /api/notifications?page=1&limit=10&status=sent&type=due_date_reminder&readerId=uuid&startDate=2024-12-01&endDate=2024-12-31
```

**Query Parameters:**

- `page`: Số trang (mặc định: 1)
- `limit`: Số lượng mỗi trang (mặc định: 10)
- `status`: Lọc theo trạng thái (pending, sent, read, failed)
- `type`: Lọc theo loại thông báo
- `readerId`: Lọc theo ID độc giả
- `startDate`: Lọc từ ngày (YYYY-MM-DD)
- `endDate`: Lọc đến ngày (YYYY-MM-DD)

### 7. **Admin lấy thống kê thông báo**

```http
GET /api/notifications/stats
```

**Response:**

```json
{
  "total": 150,
  "byStatus": [
    { "status": "sent", "count": 100 },
    { "status": "read", "count": 45 },
    { "status": "pending", "count": 5 }
  ],
  "byType": [
    { "type": "due_date_reminder", "count": 80 },
    { "type": "overdue_notice", "count": 20 },
    { "type": "general", "count": 50 }
  ],
  "byDate": [
    { "date": "2024-12-19", "count": 25 },
    { "date": "2024-12-18", "count": 30 }
  ]
}
```

### 8. **Admin lấy thống kê thông báo của độc giả**

```http
GET /api/notifications/reader/{readerId}/stats
```

### 9. **Admin xóa thông báo**

```http
DELETE /api/notifications/{notificationId}
```

### 10. **Admin xóa tất cả thông báo của độc giả**

```http
DELETE /api/notifications/reader/{readerId}/clear-all
```

## 🚀 Cách sử dụng

### **Bước 1: Admin gửi thông báo**

```bash
# Gửi thông báo cho tất cả độc giả sắp đến hạn (2 ngày)
curl -X POST http://localhost:3000/api/borrow-records/send-reminders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "daysBeforeDue": 2,
    "customMessage": "Sách của bạn sắp đến hạn trả trong 2 ngày tới."
  }'
```

### **Bước 2: Độc giả xem thông báo**

```bash
# Xem danh sách thông báo
curl -X GET "http://localhost:3000/api/notifications/reader/READER_ID?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Xem số thông báo chưa đọc
curl -X GET "http://localhost:3000/api/notifications/reader/READER_ID/unread-count" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Bước 3: Độc giả đánh dấu đã đọc**

```bash
# Đánh dấu một thông báo đã đọc
curl -X PATCH "http://localhost:3000/api/notifications/NOTIFICATION_ID/read" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Đánh dấu tất cả thông báo đã đọc
curl -X PATCH "http://localhost:3000/api/notifications/reader/READER_ID/read-all" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Bước 4: Admin quản lý thông báo**

```bash
# Lấy danh sách tất cả thông báo
curl -X GET "http://localhost:3000/api/notifications?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Lấy thống kê thông báo
curl -X GET "http://localhost:3000/api/notifications/stats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Lọc thông báo theo trạng thái
curl -X GET "http://localhost:3000/api/notifications?status=sent&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Lọc thông báo theo độc giả
curl -X GET "http://localhost:3000/api/notifications?readerId=READER_ID&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Xóa một thông báo
curl -X DELETE "http://localhost:3000/api/notifications/NOTIFICATION_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Xóa tất cả thông báo của độc giả
curl -X DELETE "http://localhost:3000/api/notifications/reader/READER_ID/clear-all" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📱 Tích hợp Frontend

### **Hiển thị số thông báo chưa đọc**

```javascript
// Lấy số thông báo chưa đọc
const getUnreadCount = async (readerId) => {
  const response = await fetch(
    `/api/notifications/reader/${readerId}/unread-count`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  const data = await response.json();
  return data.unreadCount;
};

// Hiển thị badge
const unreadCount = await getUnreadCount(readerId);
if (unreadCount > 0) {
  showNotificationBadge(unreadCount);
}
```

### **Hiển thị danh sách thông báo**

```javascript
// Lấy danh sách thông báo
const getNotifications = async (readerId, page = 1) => {
  const response = await fetch(
    `/api/notifications/reader/${readerId}?page=${page}&limit=10`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return await response.json();
};

// Hiển thị thông báo
const notifications = await getNotifications(readerId);
notifications.data.forEach((notification) => {
  showNotificationItem(notification);
});
```

## 🗄️ Cấu trúc Database

### **Bảng `notifications`**

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reader_id UUID NOT NULL REFERENCES readers(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'general',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  metadata JSONB,
  read_at TIMESTAMP,
  sent_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## ✅ Tính năng đã hoàn thành

### **Cho Admin:**

- ✅ Tạo thông báo trong database
- ✅ Gửi thông báo nhắc nhở cho độc giả sắp đến hạn
- ✅ Xem danh sách tất cả thông báo với bộ lọc nâng cao
- ✅ Thống kê thông báo theo trạng thái, loại, ngày
- ✅ Thống kê thông báo của từng độc giả
- ✅ Xóa thông báo cụ thể
- ✅ Xóa tất cả thông báo của độc giả
- ✅ Phân trang và lọc thông báo

### **Cho Độc giả:**

- ✅ Xem danh sách thông báo của mình
- ✅ Đếm số thông báo chưa đọc
- ✅ Đánh dấu thông báo đã đọc
- ✅ Đánh dấu tất cả thông báo đã đọc
- ✅ Phân trang thông báo
- ✅ Lọc thông báo theo trạng thái

## 🔄 Có thể mở rộng thêm

- 🔄 Gửi email thực tế
- 🔄 Gửi SMS
- 🔄 Push notification
- 🔄 Thông báo real-time (WebSocket)
- 🔄 Lịch sử thông báo chi tiết
- 🔄 Template thông báo
