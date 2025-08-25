import { IsOptional, IsString } from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class FilterPublishersDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Tìm kiếm theo tên, địa chỉ, email, điện thoại hoặc quốc gia',
    example: 'Kim Đồng',
  })
  @IsOptional()
  @IsString({ message: 'Search phải là chuỗi ký tự' })
  search?: string;
}
