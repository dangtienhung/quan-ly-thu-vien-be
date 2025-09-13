import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreatePublisherNewDto {
  @ApiProperty({
    description: 'Tên nhà xuất bản',
    example: 'Nhà xuất bản Giáo dục Việt Nam',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Tên nhà xuất bản phải là chuỗi ký tự' })
  @MaxLength(255, { message: 'Tên nhà xuất bản không được quá 255 ký tự' })
  publisherName?: string;

  @ApiProperty({
    description: 'Email liên hệ (bắt buộc)',
    example: 'contact@publisher.com',
  })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @MaxLength(255, { message: 'Email không được quá 255 ký tự' })
  email: string;

  @ApiProperty({
    description: 'Địa chỉ nhà xuất bản',
    example: '123 Đường ABC, Quận 1, TP.HCM',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Địa chỉ phải là chuỗi ký tự' })
  @MaxLength(1000, { message: 'Địa chỉ không được quá 1000 ký tự' })
  address?: string;

  @ApiProperty({
    description: 'Số điện thoại liên hệ',
    example: '0123456789',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  @Matches(/^[0-9+\-\s\(\)]{10,20}$/, {
    message: 'Số điện thoại không hợp lệ',
  })
  phone?: string;

  @ApiProperty({
    description: 'Website của nhà xuất bản',
    example: 'https://publisher.com',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: 'Website phải là URL hợp lệ' })
  @MaxLength(255, { message: 'Website không được quá 255 ký tự' })
  website?: string;

  @ApiProperty({
    description: 'Mô tả về nhà xuất bản',
    example: 'Nhà xuất bản chuyên về sách giáo dục',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  description?: string;

  @ApiProperty({
    description: 'Trạng thái hoạt động (mặc định: true)',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái hoạt động phải là true hoặc false' })
  isActive?: boolean;

  @ApiProperty({
    description: 'Ngày thành lập (YYYY-MM-DD)',
    example: '2000-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Ngày thành lập phải có định dạng YYYY-MM-DD' })
  establishedDate?: string;

  @ApiProperty({
    description: 'Quốc gia',
    example: 'Việt Nam',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Quốc gia phải là chuỗi ký tự' })
  @MaxLength(100, { message: 'Quốc gia không được quá 100 ký tự' })
  country?: string;
}
