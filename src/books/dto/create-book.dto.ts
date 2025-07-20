import { BookType, PhysicalType } from '../entities/book.entity';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty({
    description: 'Tên sách',
    example: 'Dế Mèn Phiêu Lưu Ký',
  })
  @IsNotEmpty({ message: 'Tên sách không được để trống' })
  @IsString({ message: 'Tên sách phải là chuỗi ký tự' })
  @MaxLength(255, { message: 'Tên sách không được quá 255 ký tự' })
  title: string;

  @ApiProperty({
    description: 'Mã ISBN của sách',
    example: '978-604-1-08525-9',
  })
  @IsNotEmpty({ message: 'ISBN không được để trống' })
  @IsString({ message: 'ISBN phải là chuỗi ký tự' })
  @MaxLength(20, { message: 'ISBN không được quá 20 ký tự' })
  @Matches(/^(?:\d{10}|\d{13}|(?:\d{3}-){4}\d{3}-\d)$/, {
    message: 'ISBN không đúng định dạng',
  })
  isbn: string;

  @ApiProperty({
    description: 'Năm xuất bản',
    example: 2020,
  })
  @IsNotEmpty({ message: 'Năm xuất bản không được để trống' })
  @IsInt({ message: 'Năm xuất bản phải là số nguyên' })
  @Min(1800, { message: 'Năm xuất bản không hợp lệ' })
  publish_year: number;

  @ApiProperty({
    description: 'Phiên bản/Lần tái bản',
    example: '2nd Edition',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Phiên bản phải là chuỗi ký tự' })
  @MaxLength(50, { message: 'Phiên bản không được quá 50 ký tự' })
  edition?: string;

  @ApiProperty({
    description: 'Mô tả về sách',
    example: 'Câu chuyện về cuộc phiêu lưu của chú Dế Mèn...',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  description?: string;

  @ApiProperty({
    description: 'Đường dẫn đến ảnh bìa sách',
    example: 'https://example.com/book-cover.jpg',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Đường dẫn ảnh phải là chuỗi ký tự' })
  @IsUrl({}, { message: 'Đường dẫn ảnh không hợp lệ' })
  @MaxLength(255, { message: 'Đường dẫn ảnh không được quá 255 ký tự' })
  cover_image?: string;

  @ApiProperty({
    description: 'Ngôn ngữ của sách',
    example: 'Tiếng Việt',
  })
  @IsNotEmpty({ message: 'Ngôn ngữ không được để trống' })
  @IsString({ message: 'Ngôn ngữ phải là chuỗi ký tự' })
  @MaxLength(50, { message: 'Ngôn ngữ không được quá 50 ký tự' })
  language: string;

  @ApiProperty({
    description: 'Số trang',
    example: 200,
  })
  @IsNotEmpty({ message: 'Số trang không được để trống' })
  @IsInt({ message: 'Số trang phải là số nguyên' })
  @Min(1, { message: 'Số trang phải lớn hơn 0' })
  page_count: number;

  @ApiProperty({
    description: 'Loại sách (physical/ebook)',
    enum: BookType,
    example: BookType.PHYSICAL,
  })
  @IsNotEmpty({ message: 'Loại sách không được để trống' })
  @IsEnum(BookType, { message: 'Loại sách không hợp lệ' })
  book_type: BookType;

  @ApiProperty({
    description: 'Loại sách vật lý (chỉ áp dụng cho sách physical)',
    enum: PhysicalType,
    example: PhysicalType.BORROWABLE,
    required: false,
  })
  @IsOptional()
  @IsEnum(PhysicalType, { message: 'Loại sách vật lý không hợp lệ' })
  physical_type?: PhysicalType;

  @ApiProperty({
    description: 'ID của nhà xuất bản',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: 'ID nhà xuất bản không được để trống' })
  @IsUUID('4', { message: 'ID nhà xuất bản không hợp lệ' })
  publisher_id: string;

  @ApiProperty({
    description: 'ID của thể loại',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: 'ID thể loại không được để trống' })
  @IsUUID('4', { message: 'ID thể loại không hợp lệ' })
  category_id: string;

  @ApiProperty({
    description: 'Danh sách ID của các tác giả',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
    type: [String],
  })
  @IsNotEmpty({ message: 'Danh sách tác giả không được để trống' })
  @IsArray({ message: 'Danh sách tác giả phải là mảng' })
  @IsUUID('4', { each: true, message: 'ID tác giả không hợp lệ' })
  author_ids: string[];
}
