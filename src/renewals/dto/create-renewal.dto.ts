import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateRenewalDto {
  @ApiProperty({
    description: 'ID của bản ghi mượn sách',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: 'ID bản ghi mượn sách không được để trống' })
  @IsUUID('4', { message: 'ID bản ghi mượn sách phải là UUID hợp lệ' })
  borrow_id: string;

  @ApiProperty({
    description: 'Ngày gia hạn',
    example: '2024-01-10T10:00:00.000Z',
  })
  @IsNotEmpty({ message: 'Ngày gia hạn không được để trống' })
  @IsDateString({}, { message: 'Ngày gia hạn phải là định dạng ngày hợp lệ' })
  renewal_date: string;

  @ApiProperty({
    description: 'Ngày hạn mới sau khi gia hạn',
    example: '2024-01-25T10:00:00.000Z',
  })
  @IsNotEmpty({ message: 'Ngày hạn mới không được để trống' })
  @IsDateString({}, { message: 'Ngày hạn mới phải là định dạng ngày hợp lệ' })
  new_due_date: string;

  @ApiProperty({
    description: 'ID của thủ thư xử lý gia hạn',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: 'ID thủ thư không được để trống' })
  @IsUUID('4', { message: 'ID thủ thư phải là UUID hợp lệ' })
  librarian_id: string;

  @ApiProperty({
    description: 'Lý do gia hạn',
    example: 'Độc giả yêu cầu gia hạn thêm thời gian để hoàn thành nghiên cứu',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Lý do gia hạn phải là chuỗi ký tự' })
  @MaxLength(1000, { message: 'Lý do gia hạn không được quá 1000 ký tự' })
  reason?: string;

  @ApiProperty({
    description: 'Ghi chú của thủ thư',
    example: 'Gia hạn theo yêu cầu của độc giả',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú thủ thư phải là chuỗi ký tự' })
  @MaxLength(1000, { message: 'Ghi chú thủ thư không được quá 1000 ký tự' })
  librarian_notes?: string;

  @ApiProperty({
    description: 'Số lần gia hạn trong bản ghi mượn sách này',
    example: 1,
  })
  @IsNotEmpty({ message: 'Số lần gia hạn không được để trống' })
  @IsInt({ message: 'Số lần gia hạn phải là số nguyên' })
  @Min(1, { message: 'Số lần gia hạn phải lớn hơn 0' })
  @Max(10, { message: 'Số lần gia hạn không được quá 10' })
  renewal_number: number;

  @ApiProperty({
    description: 'Trạng thái gia hạn',
    example: 'approved',
    enum: ['approved', 'pending', 'rejected'],
  })
  @IsOptional()
  @IsString({ message: 'Trạng thái gia hạn phải là chuỗi ký tự' })
  @IsIn(['approved', 'pending', 'rejected'], {
    message: 'Trạng thái gia hạn không hợp lệ',
  })
  status?: string;
}
