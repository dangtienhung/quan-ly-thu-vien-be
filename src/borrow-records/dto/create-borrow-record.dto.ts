import {
  IsDateString,
  IsEnum,
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
import { BorrowStatus } from '../entities/borrow-record.entity';

export class CreateBorrowRecordDto {
  @ApiProperty({
    description: 'ID của độc giả',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: 'ID độc giả không được để trống' })
  @IsUUID('4', { message: 'ID độc giả phải là UUID hợp lệ' })
  reader_id: string;

  @ApiProperty({
    description: 'ID của bản sao sách vật lý',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: 'ID bản sao sách không được để trống' })
  @IsUUID('4', { message: 'ID bản sao sách phải là UUID hợp lệ' })
  copy_id: string;

  @ApiProperty({
    description: 'Ngày mượn sách',
    example: '2024-01-01T10:00:00.000Z',
  })
  @IsNotEmpty({ message: 'Ngày mượn sách không được để trống' })
  @IsDateString({}, { message: 'Ngày mượn sách phải là định dạng ngày hợp lệ' })
  borrow_date: string;

  @ApiProperty({
    description: 'Ngày phải trả sách',
    example: '2024-01-15T10:00:00.000Z',
  })
  @IsNotEmpty({ message: 'Ngày phải trả sách không được để trống' })
  @IsDateString(
    {},
    { message: 'Ngày phải trả sách phải là định dạng ngày hợp lệ' },
  )
  due_date: string;

  @ApiProperty({
    description: 'Ngày thực tế trả sách',
    example: '2024-01-14T15:30:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Ngày trả sách phải là định dạng ngày hợp lệ' })
  return_date?: string;

  @ApiProperty({
    description: 'Trạng thái mượn sách',
    enum: BorrowStatus,
    example: BorrowStatus.BORROWED,
    required: false,
  })
  @IsOptional()
  @IsEnum(BorrowStatus, { message: 'Trạng thái không hợp lệ' })
  status?: BorrowStatus;

  @ApiProperty({
    description: 'ID của thủ thư xử lý giao dịch',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: 'ID thủ thư không được để trống' })
  @IsUUID('4', { message: 'ID thủ thư phải là UUID hợp lệ' })
  librarian_id: string;

  @ApiProperty({
    description: 'Ghi chú khi mượn sách',
    example: 'Độc giả yêu cầu giữ sách cẩn thận',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú mượn sách phải là chuỗi ký tự' })
  @MaxLength(1000, { message: 'Ghi chú mượn sách không được quá 1000 ký tự' })
  borrow_notes?: string;

  @ApiProperty({
    description: 'Ghi chú khi trả sách',
    example: 'Sách trả đúng hạn, tình trạng tốt',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú trả sách phải là chuỗi ký tự' })
  @MaxLength(1000, { message: 'Ghi chú trả sách không được quá 1000 ký tự' })
  return_notes?: string;

  @ApiProperty({
    description: 'Số lần gia hạn',
    example: 0,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Số lần gia hạn phải là số nguyên' })
  @Min(0, { message: 'Số lần gia hạn không được âm' })
  @Max(10, { message: 'Số lần gia hạn không được quá 10' })
  renewal_count?: number;
}
