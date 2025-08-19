import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsPositive, Min } from 'class-validator';

export class SearchDto {
  @ApiProperty({
    description: 'Từ khóa tìm kiếm (tên độc giả, tên sách, ghi chú)',
    example: 'Nguyễn Văn A',
  })
  @IsNotEmpty({ message: 'Từ khóa tìm kiếm không được để trống' })
  q: string;

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
}
