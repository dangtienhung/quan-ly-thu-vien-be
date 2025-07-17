import { AccountStatus, UserRole } from '../entities/user.entity';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Mã người dùng (mã sinh viên/giảng viên/nhân viên)',
    example: 'GV001 hoặc SV20020001 hoặc NV001',
    maxLength: 20,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Mã người dùng phải là chuỗi ký tự' })
  @MaxLength(20, { message: 'Mã người dùng không được quá 20 ký tự' })
  @Matches(/^[A-Z]{2}[0-9]+$/, {
    message:
      'Mã người dùng phải bắt đầu bằng 2 chữ cái in hoa (GV/SV/NV) và theo sau là số',
  })
  userCode?: string;

  @ApiProperty({
    description: 'Tên đăng nhập (duy nhất)',
    example: 'nguyen_van_a',
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  username?: string;

  @ApiProperty({
    description: 'Mật khẩu',
    example: 'matKhauMoiAnToan123',
    minLength: 6,
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(255)
  password?: string;

  @ApiProperty({
    description: 'Địa chỉ email',
    example: 'nguyenvana@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @ApiProperty({
    description: 'Vai trò người dùng',
    example: 'reader',
    enum: UserRole,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({
    description: 'Trạng thái tài khoản',
    example: 'active',
    enum: AccountStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(AccountStatus)
  accountStatus?: AccountStatus;
}
