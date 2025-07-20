import { FineStatus, FineType } from '../entities/fine.entity';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateFineDto {
  @ApiProperty({
    description: 'ID của bản ghi mượn sách',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: 'ID bản ghi mượn sách không được để trống' })
  @IsUUID('4', { message: 'ID bản ghi mượn sách phải là UUID hợp lệ' })
  borrow_id: string;

  @ApiProperty({
    description: 'Số tiền phạt',
    example: 50000,
  })
  @IsNotEmpty({ message: 'Số tiền phạt không được để trống' })
  @IsNumber({}, { message: 'Số tiền phạt phải là số' })
  @IsPositive({ message: 'Số tiền phạt phải lớn hơn 0' })
  fine_amount: number;

  @ApiProperty({
    description: 'Số tiền đã thanh toán',
    example: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Số tiền đã thanh toán phải là số' })
  @Min(0, { message: 'Số tiền đã thanh toán không được âm' })
  paid_amount?: number;

  @ApiProperty({
    description: 'Ngày tạo phạt',
    example: '2024-01-15T10:00:00.000Z',
  })
  @IsNotEmpty({ message: 'Ngày tạo phạt không được để trống' })
  @IsDateString({}, { message: 'Ngày tạo phạt phải là định dạng ngày hợp lệ' })
  fine_date: string;

  @ApiProperty({
    description: 'Ngày thanh toán',
    example: '2024-01-20T15:30:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'Ngày thanh toán phải là định dạng ngày hợp lệ' },
  )
  payment_date?: string;

  @ApiProperty({
    description: 'Lý do phạt',
    enum: FineType,
    example: FineType.OVERDUE,
  })
  @IsNotEmpty({ message: 'Lý do phạt không được để trống' })
  @IsEnum(FineType, { message: 'Lý do phạt không hợp lệ' })
  reason: FineType;

  @ApiProperty({
    description: 'Mô tả chi tiết lý do phạt',
    example: 'Sách trả muộn 5 ngày so với hạn',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  @MaxLength(1000, { message: 'Mô tả không được quá 1000 ký tự' })
  description?: string;

  @ApiProperty({
    description: 'Trạng thái phạt',
    enum: FineStatus,
    example: FineStatus.UNPAID,
    required: false,
  })
  @IsOptional()
  @IsEnum(FineStatus, { message: 'Trạng thái phạt không hợp lệ' })
  status?: FineStatus;

  @ApiProperty({
    description: 'Số ngày trễ (cho phạt trễ hạn)',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Số ngày trễ phải là số nguyên' })
  @Min(0, { message: 'Số ngày trễ không được âm' })
  @Max(365, { message: 'Số ngày trễ không được quá 365 ngày' })
  overdue_days?: number;

  @ApiProperty({
    description: 'Mức phạt mỗi ngày trễ',
    example: 10000,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Mức phạt mỗi ngày trễ phải là số' })
  @IsPositive({ message: 'Mức phạt mỗi ngày trễ phải lớn hơn 0' })
  daily_rate?: number;

  @ApiProperty({
    description: 'Ghi chú của thủ thư',
    example: 'Phạt theo quy định thư viện',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú thủ thư phải là chuỗi ký tự' })
  @MaxLength(1000, { message: 'Ghi chú thủ thư không được quá 1000 ký tự' })
  librarian_notes?: string;

  @ApiProperty({
    description: 'Ghi chú của độc giả',
    example: 'Xin lỗi vì sự cố này',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú độc giả phải là chuỗi ký tự' })
  @MaxLength(1000, { message: 'Ghi chú độc giả không được quá 1000 ký tự' })
  reader_notes?: string;

  @ApiProperty({
    description: 'Ngày hạn thanh toán',
    example: '2024-02-15T10:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'Ngày hạn thanh toán phải là định dạng ngày hợp lệ' },
  )
  due_date?: string;

  @ApiProperty({
    description: 'Phương thức thanh toán',
    example: 'cash',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Phương thức thanh toán phải là chuỗi ký tự' })
  @IsIn(['cash', 'card', 'bank_transfer', 'online'], {
    message: 'Phương thức thanh toán không hợp lệ',
  })
  @MaxLength(50, { message: 'Phương thức thanh toán không được quá 50 ký tự' })
  payment_method?: string;

  @ApiProperty({
    description: 'Mã giao dịch thanh toán',
    example: 'TXN123456789',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Mã giao dịch thanh toán phải là chuỗi ký tự' })
  @MaxLength(100, {
    message: 'Mã giao dịch thanh toán không được quá 100 ký tự',
  })
  transaction_id?: string;
}
