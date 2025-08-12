import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export enum BookType {
  PHYSICAL = 'physical',
  EBOOK = 'ebook',
}

export class FindAllBooksDto extends PaginationQueryDto {
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
}
