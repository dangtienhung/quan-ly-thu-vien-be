import { IsOptional, IsString, MaxLength } from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationWithPathDto } from '../../common/dto/pagination-with-path.dto';

export class FindByReaderWithSearchDto extends PaginationWithPathDto {
  @ApiPropertyOptional({
    description: 'Tìm kiếm theo tên sách hoặc tên người dùng đã mượn',
    example: 'Harry Potter',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Từ khóa tìm kiếm không được vượt quá 255 ký tự' })
  @Type(() => String)
  q?: string;
}
