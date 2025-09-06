import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({
    description: 'Tên vị trí kệ sách',
    example: 'Kệ A1 - Tầng 1',
  })
  @IsNotEmpty({ message: 'Tên vị trí không được để trống' })
  @IsString({ message: 'Tên vị trí phải là chuỗi ký tự' })
  @MaxLength(255, { message: 'Tên vị trí không được quá 255 ký tự' })
  name: string;

  @ApiPropertyOptional({
    description: 'Mô tả chi tiết về vị trí',
    example: 'Kệ sách khoa học tự nhiên, tầng 1, khu A',
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Tầng của thư viện',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Tầng phải là số nguyên' })
  @Min(1, { message: 'Tầng phải lớn hơn 0' })
  floor?: number;

  @ApiPropertyOptional({
    description: 'Khu vực trong thư viện',
    example: 'Khu A',
  })
  @IsOptional()
  @IsString({ message: 'Khu vực phải là chuỗi ký tự' })
  @MaxLength(100, { message: 'Khu vực không được quá 100 ký tự' })
  section?: string;

  @ApiPropertyOptional({
    description: 'Số kệ',
    example: 'A1',
  })
  @IsOptional()
  @IsString({ message: 'Số kệ phải là chuỗi ký tự' })
  @MaxLength(50, { message: 'Số kệ không được quá 50 ký tự' })
  shelf?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái hoạt động của vị trí',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái hoạt động phải là boolean' })
  isActive?: boolean = true;
}
