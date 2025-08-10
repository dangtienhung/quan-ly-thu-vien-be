import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateBookCategoryDto {
  @ApiProperty({ description: 'Tên thể loại chi tiết', example: 'Sách Toán' })
  @IsNotEmpty({ message: 'Tên thể loại không được để trống' })
  @IsString({ message: 'Tên thể loại phải là chuỗi ký tự' })
  @MaxLength(100, { message: 'Tên thể loại không được quá 100 ký tự' })
  name: string;

  @ApiProperty({
    description: 'ID danh mục cha',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsUUID('4', { message: 'parent_id phải là UUID hợp lệ' })
  parent_id?: string | null;
}
