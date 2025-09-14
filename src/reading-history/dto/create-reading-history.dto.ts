import { IsEnum, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateReadingHistoryDto {
  @ApiProperty({ description: 'ID độc giả' })
  @IsUUID()
  reader_id: string;

  @ApiProperty({ description: 'ID sách' })
  @IsUUID()
  book_id: string;

  @ApiProperty({
    description: 'Trạng thái đọc',
    enum: ['reading', 'completed', 'paused', 'abandoned'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['reading', 'completed', 'paused', 'abandoned'])
  status?: 'reading' | 'completed' | 'paused' | 'abandoned';

  @ApiProperty({ description: 'Trang hiện tại', required: false, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  current_page?: number;

  @ApiProperty({
    description: 'Thời gian đọc tổng (giây)',
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  total_reading_time_seconds?: number;

  @ApiProperty({
    description: 'Sách yêu thích',
    required: false,
    default: false,
  })
  @IsOptional()
  is_favorite?: boolean;
}
