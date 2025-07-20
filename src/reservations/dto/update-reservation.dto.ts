import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { CreateReservationDto } from './create-reservation.dto';
import { ReservationStatus } from '../entities/reservation.entity';

export class UpdateReservationDto extends PartialType(CreateReservationDto) {
  @ApiProperty({
    description: 'Trạng thái đặt trước',
    enum: ReservationStatus,
    example: ReservationStatus.FULFILLED,
    required: false,
  })
  @IsOptional()
  @IsEnum(ReservationStatus, { message: 'Trạng thái không hợp lệ' })
  status?: ReservationStatus;

  @ApiProperty({
    description: 'Ghi chú của thủ thư',
    example: 'Sách sẽ có sau 3 ngày',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú thủ thư phải là chuỗi ký tự' })
  @MaxLength(500, { message: 'Ghi chú thủ thư không được quá 500 ký tự' })
  librarian_notes?: string;

  @ApiProperty({
    description: 'Ngày thực hiện đặt trước',
    example: '2024-01-05T10:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Ngày thực hiện phải là định dạng ngày hợp lệ' })
  fulfillment_date?: string;

  @ApiProperty({
    description: 'ID của thủ thư thực hiện đặt trước',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID thủ thư phải là UUID hợp lệ' })
  fulfilled_by?: string;

  @ApiProperty({
    description: 'Ngày hủy đặt trước',
    example: '2024-01-03T10:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Ngày hủy phải là định dạng ngày hợp lệ' })
  cancelled_date?: string;

  @ApiProperty({
    description: 'Lý do hủy đặt trước',
    example: 'Không còn cần thiết',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Lý do hủy phải là chuỗi ký tự' })
  @MaxLength(500, { message: 'Lý do hủy không được quá 500 ký tự' })
  cancellation_reason?: string;

  @ApiProperty({
    description: 'ID của thủ thư hủy đặt trước',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID thủ thư hủy phải là UUID hợp lệ' })
  cancelled_by?: string;
}
