import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { BorrowStatus } from '../../borrow-records/entities/borrow-record.entity';
import { ReservationStatus } from '../../reservations/entities/reservation.entity';

export class PathParamsDto {
  @ApiPropertyOptional({
    description: 'ID từ path parameter',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID phải là UUID hợp lệ' })
  id?: string;

  @ApiPropertyOptional({
    description: 'ID của sách từ path parameter',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID sách phải là UUID hợp lệ' })
  bookId?: string;

  @ApiPropertyOptional({
    description: 'ID của độc giả từ path parameter',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID độc giả phải là UUID hợp lệ' })
  readerId?: string;

  @ApiPropertyOptional({
    description: 'ID của tác giả từ path parameter',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID tác giả phải là UUID hợp lệ' })
  authorId?: string;

  @ApiPropertyOptional({
    description: 'ID của danh mục từ path parameter',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID danh mục phải là UUID hợp lệ' })
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'ID của nhà xuất bản từ path parameter',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID nhà xuất bản phải là UUID hợp lệ' })
  publisherId?: string;

  @ApiPropertyOptional({
    description: 'ID của người dùng từ path parameter',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID người dùng phải là UUID hợp lệ' })
  userId?: string;

  @ApiPropertyOptional({
    description: 'ID của thủ thư từ path parameter',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID thủ thư phải là UUID hợp lệ' })
  librarianId?: string;

  @ApiPropertyOptional({
    description: 'ID của mượn sách từ path parameter',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID mượn sách phải là UUID hợp lệ' })
  borrowId?: string;

  @ApiPropertyOptional({
    description: 'ID của loại độc giả từ path parameter',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID loại độc giả phải là UUID hợp lệ' })
  readerTypeId?: string;

  @ApiPropertyOptional({
    description: 'ID của cấp độ từ path parameter',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID cấp độ phải là UUID hợp lệ' })
  gradeLevelId?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái mượn sách từ path parameter',
    enum: BorrowStatus,
  })
  @IsOptional()
  @IsEnum(BorrowStatus, { message: 'Trạng thái mượn sách không hợp lệ' })
  borrowStatus?: BorrowStatus;

  @ApiPropertyOptional({
    description: 'Trạng thái đặt trước từ path parameter',
    enum: ReservationStatus,
  })
  @IsOptional()
  @IsEnum(ReservationStatus, { message: 'Trạng thái đặt trước không hợp lệ' })
  reservationStatus?: ReservationStatus;

  [key: string]: any;
}
