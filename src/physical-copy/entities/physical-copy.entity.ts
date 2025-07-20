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

export enum CopyStatus {
  AVAILABLE = 'available',
  BORROWED = 'borrowed',
  RESERVED = 'reserved',
  DAMAGED = 'damaged',
  LOST = 'lost',
  MAINTENANCE = 'maintenance',
}

export enum CopyCondition {
  NEW = 'new',
  GOOD = 'good',
  WORN = 'worn',
  DAMAGED = 'damaged',
}

@Entity('physical_copies')
export class PhysicalCopy {
  @ApiProperty({
    description: 'ID duy nhất của bản sao (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID của sách',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ type: 'uuid' })
  book_id: string;

  @ManyToOne(() => Book, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'book_id' })
  book: Book;

  @ApiProperty({
    description: 'Mã barcode của bản sao',
    example: 'LIB-2024-001',
  })
  @Column({ type: 'varchar', length: 50, unique: true })
  barcode: string;

  @ApiProperty({
    description: 'Trạng thái của bản sao',
    enum: CopyStatus,
    example: CopyStatus.AVAILABLE,
  })
  @Column({
    type: 'enum',
    enum: CopyStatus,
    default: CopyStatus.AVAILABLE,
  })
  status: CopyStatus;

  @ApiProperty({
    description: 'Tình trạng của bản sao',
    enum: CopyCondition,
    example: CopyCondition.NEW,
  })
  @Column({
    type: 'enum',
    enum: CopyCondition,
    default: CopyCondition.NEW,
  })
  current_condition: CopyCondition;

  @ApiProperty({
    description: 'Chi tiết về tình trạng',
    example: 'Có vài trang bị gấp mép',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  condition_details?: string;

  @ApiProperty({
    description: 'Ngày mua',
    example: '2024-01-01',
  })
  @Column({ type: 'date' })
  purchase_date: Date;

  @ApiProperty({
    description: 'Giá mua',
    example: 75000,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  purchase_price: number;

  @ApiProperty({
    description: 'Vị trí trong thư viện',
    example: 'Kệ A2-T3',
  })
  @Column({ type: 'varchar', length: 100 })
  location: string;

  @ApiProperty({
    description: 'Ghi chú',
    example: 'Sách được tặng bởi...',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({
    description: 'Ngày kiểm tra cuối cùng',
    example: '2024-01-01',
  })
  @Column({ type: 'date' })
  last_checkup_date: Date;

  @ApiProperty({
    description: 'Đã lưu trữ',
    example: false,
  })
  @Column({ type: 'boolean', default: false })
  is_archived: boolean;

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
