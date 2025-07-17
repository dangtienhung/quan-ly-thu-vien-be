import { AccountStatus, UserRole } from '../entities/user.entity';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Mã người dùng (mã sinh viên/giảng viên/nhân viên)',
    example: 'GV001 hoặc SV20020001 hoặc NV001',
    maxLength: 20,
  })
  @IsNotEmpty({ message: 'Mã người dùng không được để trống' })
  @IsString({ message: 'Mã người dùng phải là chuỗi ký tự' })
  @MaxLength(20, { message: 'Mã người dùng không được quá 20 ký tự' })
  @Matches(/^[A-Z]{2}[0-9]+$/, {
    message:
      'Mã người dùng phải bắt đầu bằng 2 chữ cái in hoa (GV/SV/NV) và theo sau là số',
  })
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
    description: 'Vai trò người dùng',
    example: 'reader',
    enum: UserRole,
    default: UserRole.READER,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole = UserRole.READER;

  @ApiProperty({
    description: 'Trạng thái tài khoản',
    example: 'active',
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(AccountStatus)
  accountStatus?: AccountStatus = AccountStatus.ACTIVE;
}
