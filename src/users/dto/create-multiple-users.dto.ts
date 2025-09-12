import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Gender } from '../../readers/entities/reader.entity';

export class CreateUserItemDto {
  @ApiProperty({
    description: 'Mã Học Sinh/giảng viên/nhân viên',
    example: 'SV20020001',
    maxLength: 20,
  })
  @IsNotEmpty({ message: 'Mã người dùng không được để trống' })
  @IsString({ message: 'Mã người dùng phải là chuỗi ký tự' })
  @MaxLength(20, { message: 'Mã người dùng không được quá 20 ký tự' })
  userCode: string;

  @ApiProperty({
    description: 'Tên đăng nhập (duy nhất)',
    example: 'nguyen_van_a',
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  username: string;

  @ApiProperty({
    description: 'Mật khẩu',
    example: 'matKhauAnToan123',
    minLength: 6,
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(255)
  password: string;

  @ApiProperty({
    description: 'Địa chỉ email',
    example: 'nguyenvana@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(100)
  email: string;

  @ApiProperty({
    description: 'Vai trò (Học Sinh/nhân viên/giáo viên)',
    example: 'Học Sinh',
    enum: ['Học Sinh', 'nhân viên', 'giáo viên'],
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(['Học Sinh', 'nhân viên', 'giáo viên'])
  vaiTro: string;

  @ApiProperty({
    description: 'Trạng thái hoạt động',
    example: 'hoạt động',
    enum: ['hoạt động', 'bị cấm'],
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(['hoạt động', 'bị cấm'])
  trangThaiHoatDong: string;

  @ApiProperty({
    description: 'Ngày sinh (dd/mm/yyyy)',
    example: '15/06/1995',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/, {
    message: 'Ngày sinh phải có định dạng dd/mm/yyyy',
  })
  ngaySinh: string;

  @ApiProperty({
    description: 'Giới tính',
    example: 'male',
    enum: Gender,
  })
  @IsNotEmpty()
  @IsEnum(Gender)
  gioiTinh: Gender;

  @ApiProperty({
    description: 'Địa chỉ',
    example: '123 Đường ABC, Quận 1, TP.HCM',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  diaChi: string;

  @ApiProperty({
    description: 'Số điện thoại',
    example: '0123456789',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  soDienThoai: string;

  @ApiProperty({
    description: 'Loại độc giả (Học Sinh/giáo viên/nhân viên)',
    example: 'Học Sinh',
    enum: ['Học Sinh', 'giáo viên', 'nhân viên'],
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(['Học Sinh', 'giáo viên', 'nhân viên'])
  loaiDocGia: string;

  @ApiProperty({
    description: 'Ngày bắt đầu (dd/mm/yyyy)',
    example: '01/01/2024',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/, {
    message: 'Ngày bắt đầu phải có định dạng dd/mm/yyyy',
  })
  ngayBatDau: string;

  @ApiProperty({
    description: 'Ngày kết thúc (dd/mm/yyyy)',
    example: '31/12/2025',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/, {
    message: 'Ngày kết thúc phải có định dạng dd/mm/yyyy',
  })
  ngayKetThuc: string;
}

export class CreateMultipleUsersDto {
  @ApiProperty({
    description: 'Danh sách người dùng cần tạo (tối đa 1000 users)',
    type: [CreateUserItemDto],
  })
  @IsArray()
  @ArrayMaxSize(1000, { message: 'Không thể tạo quá 1000 users trong một lần' })
  @ValidateNested({ each: true })
  @Type(() => CreateUserItemDto)
  users: CreateUserItemDto[];
}
