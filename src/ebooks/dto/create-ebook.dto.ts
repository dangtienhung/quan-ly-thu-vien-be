import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateEBookDto {
  @ApiProperty({
    description: 'ID của sách',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: 'ID sách không được để trống' })
  @IsUUID('4', { message: 'ID sách không hợp lệ' })
  book_id: string;

  @ApiProperty({
    description: 'Đường dẫn đến file',
    example: '/storage/ebooks/sample.pdf',
  })
  @IsNotEmpty({ message: 'Đường dẫn file không được để trống' })
  @IsString({ message: 'Đường dẫn file phải là chuỗi ký tự' })
  @MaxLength(255, { message: 'Đường dẫn file không được quá 255 ký tự' })
  file_path: string;

  @ApiProperty({
    description: 'Kích thước file (bytes)',
    example: 1024000,
  })
  @IsNotEmpty({ message: 'Kích thước file không được để trống' })
  @IsNumber({}, { message: 'Kích thước file phải là số' })
  @Min(0, { message: 'Kích thước file không được âm' })
  file_size: number;

  @ApiProperty({
    description: 'Định dạng file',
    example: 'PDF',
  })
  @IsNotEmpty({ message: 'Định dạng file không được để trống' })
  @IsString({ message: 'Định dạng file phải là chuỗi ký tự' })
  @MaxLength(20, { message: 'Định dạng file không được quá 20 ký tự' })
  @Matches(/^[A-Z0-9]+$/, { message: 'Định dạng file không hợp lệ' })
  file_format: string;
}
