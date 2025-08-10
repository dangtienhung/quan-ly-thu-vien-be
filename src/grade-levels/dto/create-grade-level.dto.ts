import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateGradeLevelDto {
  @ApiProperty({ description: 'Tên khối lớp', example: 'Lớp 1' })
  @IsNotEmpty({ message: 'Tên khối lớp không được để trống' })
  @IsString({ message: 'Tên khối lớp phải là chuỗi ký tự' })
  @MaxLength(50, { message: 'Tên khối lớp không được quá 50 ký tự' })
  name: string;

  @ApiProperty({ description: 'Mô tả', required: false })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  description?: string;

  @ApiProperty({ description: 'Thứ tự sắp xếp', example: 1, required: false })
  @IsOptional()
  @IsInt({ message: 'Thứ tự sắp xếp phải là số nguyên' })
  @Min(0, { message: 'Thứ tự sắp xếp phải >= 0' })
  order?: number = 0;
}
