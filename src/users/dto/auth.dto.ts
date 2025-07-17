import { IsNotEmpty, IsString, MinLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Tên đăng nhập hoặc email',
    example: 'nguyen_van_a hoặc nguyenvana@example.com',
  })
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  @IsString({ message: 'Tên đăng nhập phải là chuỗi ký tự' })
  username: string;

  @ApiProperty({
    description: 'Mật khẩu',
    example: 'matKhauAnToan123',
  })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Mật khẩu hiện tại',
    example: 'matKhauHienTai123',
  })
  @IsNotEmpty({ message: 'Mật khẩu hiện tại không được để trống' })
  @IsString({ message: 'Mật khẩu hiện tại phải là chuỗi ký tự' })
  currentPassword: string;

  @ApiProperty({
    description: 'Mật khẩu mới',
    example: 'matKhauMoi123',
  })
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @IsString({ message: 'Mật khẩu mới phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
  newPassword: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Mật khẩu mới',
    example: 'matKhauMoi123',
  })
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @IsString({ message: 'Mật khẩu mới phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
  newPassword: string;

  @ApiProperty({
    description: 'Mã token đặt lại mật khẩu',
    example: 'reset-token-123',
  })
  @IsNotEmpty({ message: 'Token không được để trống' })
  @IsString({ message: 'Token phải là chuỗi ký tự' })
  resetToken: string;
}
