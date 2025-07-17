import { AccountStatus, UserRole } from '../entities/user.entity';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
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
