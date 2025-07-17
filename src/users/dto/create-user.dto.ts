import { AccountStatus, UserRole } from '../entities/user.entity';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
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
