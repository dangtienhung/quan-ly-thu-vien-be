import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateReservationDto } from './create-reservation.dto';

export class CreateMultipleReservationsDto {
  @ApiProperty({
    description: 'Danh sách các đặt trước cần tạo',
    type: [CreateReservationDto],
    example: [
      {
        reader_id: '550e8400-e29b-41d4-a716-446655440000',
        book_id: '550e8400-e29b-41d4-a716-446655440001',
        physical_copy_id: '550e8400-e29b-41d4-a716-446655440003',
        reservation_date: '2024-01-01T10:00:00.000Z',
        expiry_date: '2024-01-08T10:00:00.000Z',
        reader_notes: 'Cần sách này cho nghiên cứu',
        priority: 1,
      },
      {
        reader_id: '550e8400-e29b-41d4-a716-446655440000',
        book_id: '550e8400-e29b-41d4-a716-446655440002',
        reservation_date: '2024-01-01T10:00:00.000Z',
        expiry_date: '2024-01-08T10:00:00.000Z',
        reader_notes: 'Sách tham khảo cho luận văn',
        priority: 2,
      },
    ],
  })
  @IsArray({ message: 'Danh sách đặt trước phải là một mảng' })
  @ArrayMinSize(1, { message: 'Phải có ít nhất 1 đặt trước' })
  @ValidateNested({ each: true })
  @Type(() => CreateReservationDto)
  reservations: CreateReservationDto[];
}
