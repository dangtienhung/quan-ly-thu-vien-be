import { IsOptional, IsString, IsUUID } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class ExpireReservationDto {
  @ApiProperty({
    description: 'ID của thủ thư đánh dấu hết hạn',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  librarianId: string;

  @ApiProperty({
    description: 'Lý do đánh dấu hết hạn',
    example: 'Độc giả không đến nhận sách',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
