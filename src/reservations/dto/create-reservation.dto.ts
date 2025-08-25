import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateReservationDto {
  @ApiProperty({
    description: 'ID của độc giả',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: 'ID độc giả không được để trống' })
  @IsUUID('4', { message: 'ID độc giả phải là UUID hợp lệ' })
  reader_id: string;

  @ApiProperty({
    description: 'ID của sách',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: 'ID sách không được để trống' })
  @IsUUID('4', { message: 'ID sách phải là UUID hợp lệ' })
  book_id: string;

  @ApiProperty({
    description: 'ID của bản sao vật lý (optional)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID bản sao vật lý phải là UUID hợp lệ' })
  physical_copy_id?: string;

  @ApiProperty({
    description: 'Ngày đặt trước',
    example: '2024-01-01T10:00:00.000Z',
  })
  @IsNotEmpty({ message: 'Ngày đặt trước không được để trống' })
  @IsDateString({}, { message: 'Ngày đặt trước phải là định dạng ngày hợp lệ' })
  reservation_date: string;

  @ApiProperty({
    description: 'Ngày hết hạn đặt trước',
    example: '2024-01-08T10:00:00.000Z',
  })
  @IsNotEmpty({ message: 'Ngày hết hạn không được để trống' })
  @IsDateString({}, { message: 'Ngày hết hạn phải là định dạng ngày hợp lệ' })
  expiry_date: string;

  @ApiProperty({
    description: 'Ghi chú của độc giả',
    example: 'Cần sách này cho nghiên cứu',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi ký tự' })
  @MaxLength(500, { message: 'Ghi chú không được quá 500 ký tự' })
  reader_notes?: string;

  @ApiProperty({
    description: 'Thứ tự ưu tiên trong danh sách đặt trước',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Thứ tự ưu tiên phải là số nguyên' })
  @Min(1, { message: 'Thứ tự ưu tiên phải lớn hơn 0' })
  priority?: number;
}
