import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class SendNotificationDto {
  @ApiPropertyOptional({
    description: 'Số ngày trước khi đến hạn để gửi thông báo (mặc định: 2)',
    example: 2,
    minimum: 1,
    maximum: 7,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(7)
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
