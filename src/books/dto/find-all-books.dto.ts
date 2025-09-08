import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export enum BookType {
  PHYSICAL = 'physical',
  EBOOK = 'ebook',
}

export enum ViewSortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class FindAllBooksDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Từ khóa tìm kiếm theo title và description',
    example: 'clean code',
  })
  @IsOptional()
  @IsString({ message: 'Từ khóa tìm kiếm phải là chuỗi ký tự' })
  q?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo loại sách',
    enum: BookType,
    example: BookType.PHYSICAL,
  })
  @IsOptional()
  @IsEnum(BookType, { message: 'Type phải là "physical" hoặc "ebook"' })
  type?: BookType;

  @ApiPropertyOptional({
    description: 'Lọc theo ID thể loại chính (BookCategories)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'main_category_id phải là UUID hợp lệ' })
  main_category_id?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo ID thể loại (Categories)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'category_id phải là UUID hợp lệ' })
  category_id?: string;

  @ApiPropertyOptional({
    description: 'Sắp xếp theo số lượng view',
    enum: ViewSortOrder,
    example: ViewSortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(ViewSortOrder, { message: 'view phải là "asc" hoặc "desc"' })
  view?: ViewSortOrder;
}
