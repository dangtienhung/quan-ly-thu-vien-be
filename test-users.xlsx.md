# File Excel Test cho API Upload

## Format cột cần thiết:

| Mã | Tên đăng nhập | Mật khẩu | Email | Vai trò | Trạng thái | Ngày sinh | Giới tính | Địa chỉ | Số điện thoại | Loại độc giả | Ngày bắt đầu | Ngày kết thúc |
|----|----------------|----------|-------|---------|-------------|-----------|-----------|---------|----------------|---------------|---------------|---------------|
| SV001 | nguyen_van_a | 123456 | nguyenvana@example.com | học sinh | hoạt động | 15/06/1995 | male | 123 Đường ABC, Quận 1, TP.HCM | 0123456789 | học sinh | 01/01/2024 | 31/12/2025 |
| SV002 | tran_thi_b | 123456 | tranthib@example.com | học sinh | hoạt động | 20/08/1996 | female | 456 Đường XYZ, Quận 2, TP.HCM | 0987654321 | học sinh | 01/01/2024 | 31/12/2025 |

## Giá trị enum được chấp nhận:

### Vai trò:
- học sinh
- nhân viên
- giáo viên

### Trạng thái:
- hoạt động
- bị cấm

### Giới tính:
- male
- female
- other

### Loại độc giả:
- học sinh
- giáo viên
- nhân viên

## Định dạng ngày:
- dd/mm/yyyy (ví dụ: 15/06/1995)

## Yêu cầu mật khẩu:
- Tối thiểu: 6 ký tự
- Tối đa: 255 ký tự
