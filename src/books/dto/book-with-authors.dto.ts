import { BookType, PhysicalType } from '../entities/book.entity';

import { ApiProperty } from '@nestjs/swagger';

export class AuthorDto {
  @ApiProperty({
    description: 'ID của tác giả',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Tên tác giả',
    example: 'Tô Hoài',
  })
  author_name: string;

  @ApiProperty({
    description: 'Slug của tác giả',
    example: 'to-hoai',
  })
  slug: string;

  @ApiProperty({
    description: 'Tiểu sử tác giả',
    example: 'Nhà văn nổi tiếng Việt Nam',
    required: false,
  })
  bio?: string;

  @ApiProperty({
    description: 'Quốc tịch',
    example: 'Việt Nam',
    required: false,
  })
  nationality?: string;
}

export class BookWithAuthorsDto {
  @ApiProperty({
    description: 'ID duy nhất của sách (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Tên sách',
    example: 'Dế Mèn Phiêu Lưu Ký',
  })
  title: string;

  @ApiProperty({
    description: 'Slug của sách (tự động tạo từ tên)',
    example: 'de-men-phieu-luu-ky',
  })
  slug: string;

  @ApiProperty({
    description: 'Mã ISBN của sách',
    example: '978-604-1-08525-9',
  })
  isbn: string;

  @ApiProperty({
    description: 'Năm xuất bản',
    example: 2020,
  })
  publish_year: number;

  @ApiProperty({
    description: 'Phiên bản/Lần tái bản',
    example: '2nd Edition',
    required: false,
  })
  edition?: string;

  @ApiProperty({
    description: 'Mô tả về sách',
    example: 'Câu chuyện về cuộc phiêu lưu của chú Dế Mèn...',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Đường dẫn đến ảnh bìa sách',
    example: 'https://example.com/book-cover.jpg',
    required: false,
  })
  cover_image?: string;

  @ApiProperty({
    description: 'Ngôn ngữ của sách',
    example: 'Tiếng Việt',
  })
  language: string;

  @ApiProperty({
    description: 'Số trang',
    example: 200,
  })
  page_count: number;

  @ApiProperty({
    description: 'Loại sách (physical/ebook)',
    enum: BookType,
    example: BookType.PHYSICAL,
  })
  book_type: BookType;

  @ApiProperty({
    description: 'Loại sách vật lý (chỉ áp dụng cho sách physical)',
    enum: PhysicalType,
    example: PhysicalType.BORROWABLE,
    required: false,
  })
  physical_type?: PhysicalType;

  @ApiProperty({
    description: 'Danh sách các tác giả',
    type: [AuthorDto],
  })
  authors: AuthorDto[];

  @ApiProperty({
    description: 'Thể loại sách',
    type: 'object',
    properties: {
      id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
      category_name: { type: 'string', example: 'Văn học thiếu nhi' },
      slug: { type: 'string', example: 'van-hoc-thieu-nhi' },
    },
  })
  category: any;

  @ApiProperty({
    description: 'Nhà xuất bản',
    type: 'object',
    properties: {
      id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
      publisher_name: { type: 'string', example: 'NXB Kim Đồng' },
      slug: { type: 'string', example: 'nxb-kim-dong' },
    },
  })
  publisher: any;

  @ApiProperty({
    description: 'Ngày tạo',
    example: '2024-01-01T00:00:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Ngày cập nhật cuối cùng',
    example: '2024-01-01T00:00:00.000Z',
  })
  updated_at: Date;
}
