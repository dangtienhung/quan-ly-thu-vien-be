import { CopyCondition, CopyStatus } from '../entities/physical-copy.entity';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePhysicalCopyDto {
  @ApiProperty({
    description: 'ID của sách',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: 'ID sách không được để trống' })
  @IsUUID('4', { message: 'ID sách không hợp lệ' })
  book_id: string;

  @ApiProperty({
    description: 'Mã barcode của bản sao',
    example: 'LIB-2024-001',
  })
  @IsNotEmpty({ message: 'Barcode không được để trống' })
  @IsString({ message: 'Barcode phải là chuỗi ký tự' })
  @MaxLength(50, { message: 'Barcode không được quá 50 ký tự' })
  barcode: string;

  @ApiProperty({
    description: 'Trạng thái của bản sao',
    enum: CopyStatus,
    example: CopyStatus.AVAILABLE,
  })
  @IsOptional()
  @IsEnum(CopyStatus, { message: 'Trạng thái không hợp lệ' })
  status?: CopyStatus;

  @ApiProperty({
    description: 'Tình trạng của bản sao',
    enum: CopyCondition,
    example: CopyCondition.NEW,
  })
  @IsOptional()
  @IsEnum(CopyCondition, { message: 'Tình trạng không hợp lệ' })
  current_condition?: CopyCondition;

  @ApiProperty({
    description: 'Chi tiết về tình trạng',
    example: 'Có vài trang bị gấp mép',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Chi tiết tình trạng phải là chuỗi ký tự' })
  condition_details?: string;

  @ApiProperty({
    description: 'Ngày mua',
    example: '2024-01-01',
  })
  @IsNotEmpty({ message: 'Ngày mua không được để trống' })
  @Type(() => Date)
  @IsDate({ message: 'Ngày mua không hợp lệ' })
  purchase_date: Date;

  @ApiProperty({
    description: 'Giá mua',
    example: 75000,
  })
  @IsNotEmpty({ message: 'Giá mua không được để trống' })
  @IsNumber({}, { message: 'Giá mua phải là số' })
  @Min(0, { message: 'Giá mua không được âm' })
  purchase_price: number;

  @ApiProperty({
    description: 'ID vị trí kệ sách',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID vị trí không hợp lệ' })
  location_id?: string;

  @ApiProperty({
    description: 'Ghi chú',
    example: 'Sách được tặng bởi...',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi ký tự' })
  notes?: string;

  @ApiProperty({
    description: 'Ngày kiểm tra cuối cùng',
    example: '2024-01-01',
  })
  @IsNotEmpty({ message: 'Ngày kiểm tra không được để trống' })
  @Type(() => Date)
  @IsDate({ message: 'Ngày kiểm tra không hợp lệ' })
  last_checkup_date: Date;

  @ApiProperty({
    description: 'Đã lưu trữ',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái lưu trữ phải là boolean' })
  is_archived?: boolean;
}
