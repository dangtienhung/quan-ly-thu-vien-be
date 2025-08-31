import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class SendNotificationDto {
  @ApiPropertyOptional({
    description:
      'Số ngày trước khi đến hạn để gửi thông báo (mặc định: 2, 0 = gửi ngay)',
    example: 2,
    minimum: 0,
    maximum: 30,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(30)
  daysBeforeDue?: number = 2;

  @ApiPropertyOptional({
    description: 'Nội dung thông báo tùy chỉnh',
    example: 'Sách của bạn sắp đến hạn trả, vui lòng trả sách đúng hạn.',
  })
  @IsOptional()
  @IsString()
  customMessage?: string;

  @ApiPropertyOptional({
    description: 'ID độc giả cụ thể (nếu không có sẽ gửi cho tất cả)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  readerId?: string;
}
