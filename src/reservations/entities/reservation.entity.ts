import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';
import { Book } from '../../books/entities/book.entity';
import { PhysicalCopy } from '../../physical-copy/entities/physical-copy.entity';
import { Reader } from '../../readers/entities/reader.entity';

export enum ReservationStatus {
  PENDING = 'pending',
  FULFILLED = 'fulfilled',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

@Entity('reservations')
export class Reservation {
  @ApiProperty({
    description: 'ID duy nhất của đặt trước (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID của độc giả',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ type: 'uuid' })
  reader_id: string;

  @ManyToOne(() => Reader, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reader_id' })
  reader: Reader;

  @ApiProperty({
    description: 'ID của sách',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ type: 'uuid' })
  book_id: string;

  @ManyToOne(() => Book, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'book_id' })
  book: Book;

  @ApiProperty({
    description: 'ID của bản sao vật lý (optional)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @Column({ type: 'uuid', nullable: true })
  physical_copy_id?: string;

  @ManyToOne(() => PhysicalCopy, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'physical_copy_id' })
  physicalCopy?: PhysicalCopy;

  @ApiProperty({
    description: 'Ngày đặt trước',
    example: '2024-01-01T10:00:00.000Z',
  })
  @Column({ type: 'timestamp' })
  reservation_date: Date;

  @ApiProperty({
    description: 'Ngày hết hạn đặt trước',
    example: '2024-01-08T10:00:00.000Z',
  })
  @Column({ type: 'timestamp' })
  expiry_date: Date;

  @ApiProperty({
    description: 'Trạng thái đặt trước',
    enum: ReservationStatus,
    example: ReservationStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  @ApiProperty({
    description: 'Ghi chú của độc giả',
    example: 'Cần sách này cho nghiên cứu',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  reader_notes?: string;

  @ApiProperty({
    description: 'Ghi chú của thủ thư',
    example: 'Sách sẽ có sau 3 ngày',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  librarian_notes?: string;

  @ApiProperty({
    description: 'Ngày thực hiện đặt trước (khi status = fulfilled)',
    example: '2024-01-05T10:00:00.000Z',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  fulfillment_date?: Date;

  @ApiProperty({
    description: 'ID của thủ thư thực hiện đặt trước',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @Column({ type: 'uuid', nullable: true })
  fulfilled_by?: string;

  @ApiProperty({
    description: 'Ngày hủy đặt trước',
    example: '2024-01-03T10:00:00.000Z',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  cancelled_date?: Date;

  @ApiProperty({
    description: 'Lý do hủy đặt trước',
    example: 'Không còn cần thiết',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  cancellation_reason?: string;

  @ApiProperty({
    description: 'ID của thủ thư hủy đặt trước',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @Column({ type: 'uuid', nullable: true })
  cancelled_by?: string;

  @ApiProperty({
    description: 'Thứ tự ưu tiên trong danh sách đặt trước',
    example: 1,
  })
  @Column({ type: 'int', default: 1 })
  priority: number;

  @ApiProperty({
    description: 'Ngày tạo',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    description: 'Ngày cập nhật cuối cùng',
    example: '2024-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn()
  updated_at: Date;
}
