import { IsInt, IsOptional, IsString, Min } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class UpdateReadingProgressDto {
  @ApiProperty({ description: 'Trang hiện tại đang đọc' })
  @IsInt()
  @Min(1)
  current_page: number;

  @ApiProperty({
    description: 'Thời gian đọc trong session này (giây)',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  session_duration?: number;

  @ApiProperty({ description: 'Ghi chú session', required: false })
  @IsOptional()
  @IsString()
  session_notes?: string;

  @ApiProperty({ description: 'Thiết bị đọc', required: false })
  @IsOptional()
  @IsString()
  device?: string;
}
