# 🔐 Hệ thống Xác thực (Authentication)

## 📋 Tổng quan

Hệ thống xác thực được xây dựng với JWT (JSON Web Token) và Passport.js, cung cấp các tính năng:

- ✅ Đăng nhập với JWT token
- ✅ Đổi mật khẩu
- ✅ Quên mật khẩu và đặt lại mật khẩu
- ✅ Kiểm tra trạng thái tài khoản
- ✅ Bảo vệ API endpoints với JWT Guard
- ✅ Thông báo lỗi song ngữ Việt-Anh
- ✅ Tài liệu Swagger đầy đủ
- ✅ Lọc danh sách users theo loại (reader/admin)

## 🛠️ Cấu hình

### Environment Variables (.env)

```bash
# JWT Configuration
JWT_SECRET=dangtienhung      # Khóa bí mật cho JWT
JWT_EXPIRES_IN=1d           # Thời gian token hết hạn (1 ngày)
```

## 📝 API Endpoints

### 1. Đăng nhập

```http
POST /api/auth/login
```

**Request Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "accessToken": "string",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "role": "admin | reader",
    "accountStatus": "active | suspended | banned"
  }
}
```

### 2. Lấy thông tin người dùng hiện tại

```http
GET /api/users/me
```

**Headers:** `Authorization: Bearer {token}`

**Response:**

```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "role": "reader",
  "accountStatus": "active",
  "lastLogin": "2024-01-01T10:30:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 3. Lấy danh sách người dùng (Admin)

```http
GET /api/users?page=1&limit=10&type=reader
```

**Query Parameters:**

- `page` (optional): Số trang (mặc định: 1)
- `limit` (optional): Số lượng mỗi trang (mặc định: 10)
- `type` (optional): Lọc theo loại người dùng (`reader` hoặc `admin`)

**Ví dụ:**

```http
GET /api/users?type=reader          # Chỉ lấy danh sách độc giả
GET /api/users?type=admin           # Chỉ lấy danh sách admin
GET /api/users?page=2&limit=20      # Lấy trang 2, 20 items mỗi trang
GET /api/users?type=reader&page=1&limit=5  # Lấy 5 độc giả đầu tiên
```

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "username": "string",
      "email": "string",
      "role": "reader",
      "accountStatus": "active",
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

### 4. Đổi mật khẩu

```http
POST /api/auth/change-password
```

**Headers:** `Authorization: Bearer {token}`

**Request Body:**

```json
{
  "currentPassword": "string",
  "newPassword": "string",
  "confirmNewPassword": "string"
}
```

### 5. Quên mật khẩu

```http
POST /api/auth/forgot-password
```

**Request Body:**

```json
{
  "email": "string"
}
```

### 6. Đặt lại mật khẩu

```http
POST /api/auth/reset-password
```

**Request Body:**

```json
{
  "token": "string",
  "newPassword": "string",
  "confirmNewPassword": "string"
}
```

## 🔒 Bảo mật

1. **Mật khẩu:**
   - Được mã hóa với bcrypt
   - Yêu cầu độ dài tối thiểu 8 ký tự
   - Phải chứa chữ hoa, chữ thường và số

2. **JWT Token:**
   - Thời gian hết hạn: 1 ngày
   - Được gửi qua Authorization header
   - Tự động kiểm tra trạng thái tài khoản

3. **Tài khoản:**
   - Có 3 trạng thái: active, suspended, banned
   - Tự động khóa sau nhiều lần đăng nhập thất bại
   - Chỉ tài khoản active mới có thể đăng nhập

## 🛡️ Guards và Decorators

### JWT Guard

```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@Request() req) {
  return req.user;
}
```

### Role Guard (Coming soon)

```typescript
// @Roles('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Get('admin-only')
adminEndpoint() {
  return 'Only admins can see this';
}
```

## 🔍 Validation

### Login DTO

```typescript
export class LoginDto {
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  @IsString({ message: 'Tên đăng nhập phải là chuỗi ký tự' })
  username: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  password: string;
}
```

### Filter Users DTO

```typescript
export class FilterUsersDto {
  @IsOptional()
  @IsEnum(UserRole, { message: 'Type phải là reader hoặc admin' })
  type?: UserRole;
}
```

### Change Password DTO

```typescript
export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Mật khẩu hiện tại không được để trống' })
  currentPassword: string;

  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @MinLength(8, { message: 'Mật khẩu mới phải có ít nhất 8 ký tự' })
  newPassword: string;

  @IsNotEmpty({ message: 'Xác nhận mật khẩu không được để trống' })
  @Match('newPassword', { message: 'Xác nhận mật khẩu không khớp' })
  confirmNewPassword: string;
}
```

## 📚 Swagger Documentation

Truy cập `/api` để xem tài liệu API đầy đủ với:

- Mô tả chi tiết các endpoints
- Request/Response schemas
- Authentication requirements
- Test trực tiếp API
- Thông báo lỗi tiếng Việt

## 🔄 Quy trình Xác thực

1. **Đăng nhập:**
   - Client gửi username/password
   - Server kiểm tra thông tin
   - Nếu hợp lệ, tạo JWT token
   - Trả về token và thông tin user

2. **Sử dụng API:**
   - Client gửi token trong header
   - JWT Guard xác thực token
   - Kiểm tra trạng thái tài khoản
   - Cho phép/từ chối truy cập

3. **Đổi mật khẩu:**
   - Yêu cầu token hợp lệ
   - Xác thực mật khẩu hiện tại
   - Kiểm tra định dạng mật khẩu mới
   - Cập nhật và mã hóa mật khẩu

4. **Quên mật khẩu:**
   - Gửi email xác thực
   - Tạo token reset password
   - Token có thời hạn giới hạn
   - Xác thực token khi reset

## 🐛 Xử lý Lỗi

Tất cả lỗi authentication được xử lý tập trung và trả về format thống nhất:

```json
{
  "statusCode": 401,
  "message": "Thông tin đăng nhập không hợp lệ",
  "error": "Unauthorized"
}
```

Các mã lỗi phổ biến:

- 401: Chưa đăng nhập hoặc token hết hạn
- 403: Không có quyền truy cập
- 404: Tài khoản không tồn tại
- 422: Dữ liệu đầu vào không hợp lệ
- 429: Quá nhiều yêu cầu đăng nhập thất bại

## 🔜 Tính năng Sắp Tới

1. **Role-based Access Control (RBAC)**
   - Phân quyền chi tiết theo chức năng
   - Quản lý nhóm quyền
   - Kiểm tra quyền động

2. **Two-Factor Authentication (2FA)**
   - Xác thực qua email/SMS
   - Mã OTP
   - Backup codes

3. **OAuth Integration**
   - Đăng nhập qua Google
   - Đăng nhập qua Facebook
   - Đăng nhập qua GitHub

4. **Session Management**
   - Quản lý phiên đăng nhập
   - Đăng xuất từ xa
   - Theo dõi thiết bị

5. **Security Enhancements**
   - Rate limiting
   - IP blocking
   - CAPTCHA integration
