import {
  IsDateString,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ReadersQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (starting from 1)',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Lọc theo số thẻ thư viện',
    example: 'LIB2024001',
  })
  @IsOptional()
  @IsString()
  cardNumber?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo ngày hết hạn thẻ (từ ngày)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  cardExpiryDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo ngày hết hạn thẻ (đến ngày)',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  cardExpiryDateTo?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo số điện thoại',
    example: '0123456789',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Tìm kiếm theo tên, số thẻ, email của user',
    example: 'Nguyễn Văn A',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: 'Tìm kiếm theo tên, số thẻ, email của user (alias cho q)',
    example: 'Nguyễn Văn A',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
