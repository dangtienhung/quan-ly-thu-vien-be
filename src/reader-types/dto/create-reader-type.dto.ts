import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { ReaderTypeName } from '../entities/reader-type.entity';

export class CreateReaderTypeDto {
  @ApiProperty({
    description: 'Tên loại độc giả',
    example: 'student',
    enum: ReaderTypeName,
  })
  @IsNotEmpty({ message: 'Tên loại độc giả không được để trống' })
  @IsEnum(ReaderTypeName, { message: 'Loại độc giả không hợp lệ' })
  typeName: ReaderTypeName;

  @ApiProperty({
    description: 'Số sách tối đa được mượn',
    example: 5,
    minimum: 1,
    maximum: 20,
  })
  @IsNotEmpty({ message: 'Số sách tối đa không được để trống' })
  @IsNumber({}, { message: 'Số sách tối đa phải là số' })
  @Min(1, { message: 'Số sách tối đa phải từ 1 cuốn trở lên' })
  @Max(20, { message: 'Số sách tối đa không được vượt quá 20 cuốn' })
  maxBorrowLimit: number;

  @ApiProperty({
    description: 'Thời gian được mượn (ngày)',
    example: 14,
    minimum: 1,
    maximum: 60,
  })
  @IsNotEmpty({ message: 'Thời gian mượn không được để trống' })
  @IsNumber({}, { message: 'Thời gian mượn phải là số' })
  @Min(1, { message: 'Thời gian mượn phải từ 1 ngày trở lên' })
  @Max(60, { message: 'Thời gian mượn không được vượt quá 60 ngày' })
  borrowDurationDays: number;

  @ApiProperty({
    description: 'Tiền phạt trả muộn mỗi ngày (VND)',
    example: 5000,
    minimum: 1000,
    maximum: 50000,
  })
  @IsNotEmpty({ message: 'Tiền phạt không được để trống' })
  @IsNumber({}, { message: 'Tiền phạt phải là số' })
  @Min(1000, { message: 'Tiền phạt phải từ 1.000 VND trở lên' })
  @Max(50000, { message: 'Tiền phạt không được vượt quá 50.000 VND' })
  lateReturnFinePerDay: number;

  @ApiProperty({
    description: 'Mô tả về loại độc giả',
    example: 'Học Sinh đại học có thể mượn tối đa 5 cuốn trong 14 ngày',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  description?: string;
}
