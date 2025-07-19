import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Tên thể loại',
    example: 'Sách Khoa Học',
  })
  @IsNotEmpty({ message: 'Tên thể loại không được để trống' })
  @IsString({ message: 'Tên thể loại phải là chuỗi ký tự' })
  @MaxLength(255, { message: 'Tên thể loại không được quá 255 ký tự' })
  category_name: string;

  @ApiProperty({
    description: 'Mô tả về thể loại',
    example: 'Các sách về khoa học, công nghệ, và khám phá',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  description?: string;

  @ApiPropertyOptional({
    description: 'ID của thể loại cha (nếu là thể loại con)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID thể loại cha phải là UUID hợp lệ' })
  parent_id?: string;
}
