import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
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
}
