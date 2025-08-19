import { ApiProperty } from '@nestjs/swagger';
import { Reservation } from '../entities/reservation.entity';

export class CreateMultipleReservationsResponseDto {
  @ApiProperty({
    description: 'Danh sách các đặt trước đã tạo thành công',
    type: [Reservation],
  })
  created: Reservation[];

  @ApiProperty({
    description: 'Danh sách các đặt trước tạo thất bại',
    type: 'array',
    example: [
      {
        index: 1,
        error: 'Độc giả đã đặt trước sách này',
        data: {
          reader_id: '550e8400-e29b-41d4-a716-446655440000',
          book_id: '550e8400-e29b-41d4-a716-446655440001',
        },
      },
    ],
  })
  failed: Array<{
    index: number;
    error: string;
    data: any;
  }>;

  @ApiProperty({
    description: 'Tổng số đặt trước được gửi',
    example: 5,
  })
  total: number;

  @ApiProperty({
    description: 'Số đặt trước tạo thành công',
    example: 3,
  })
  successCount: number;

  @ApiProperty({
    description: 'Số đặt trước tạo thất bại',
    example: 2,
  })
  failureCount: number;
}
