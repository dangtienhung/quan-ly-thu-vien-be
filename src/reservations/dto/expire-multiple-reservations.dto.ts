import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class ExpireMultipleReservationsDto {
  @ApiProperty({
    description: 'Danh sách ID của các đặt trước cần đánh dấu hết hạn',
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '550e8400-e29b-41d4-a716-446655440001',
    ],
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  reservationIds: string[];

  @ApiProperty({
    description: 'ID của thủ thư đánh dấu hết hạn',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  librarianId: string;

  @ApiProperty({
    description: 'Lý do đánh dấu hết hạn (áp dụng cho tất cả)',
    example: 'Độc giả không đến nhận sách',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
