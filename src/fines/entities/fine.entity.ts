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
import { BorrowRecord } from '../../borrow-records/entities/borrow-record.entity';

export enum FineStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  WAIVED = 'waived',
}

export enum FineType {
  OVERDUE = 'overdue',
  DAMAGE = 'damage',
  LOST = 'lost',
  ADMINISTRATIVE = 'administrative',
}

@Entity('fines')
export class Fine {
  @ApiProperty({
    description: 'ID duy nhất của bản ghi phạt (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID của bản ghi mượn sách',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ type: 'uuid' })
  borrow_id: string;

  @ManyToOne(() => BorrowRecord, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'borrow_id' })
  borrowRecord: BorrowRecord;

  @ApiProperty({
    description: 'Số tiền phạt',
    example: 50000,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  fine_amount: number;

  @ApiProperty({
    description: 'Số tiền đã thanh toán',
    example: 0,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  paid_amount: number;

  @ApiProperty({
    description: 'Ngày tạo phạt',
    example: '2024-01-15T10:00:00.000Z',
  })
  @Column({ type: 'timestamp' })
  fine_date: Date;

  @ApiProperty({
    description: 'Ngày thanh toán',
    example: '2024-01-20T15:30:00.000Z',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  payment_date?: Date;

  @ApiProperty({
    description: 'Lý do phạt',
    enum: FineType,
    example: FineType.OVERDUE,
  })
  @Column({
    type: 'enum',
    enum: FineType,
    default: FineType.OVERDUE,
  })
  reason: FineType;

  @ApiProperty({
    description: 'Mô tả chi tiết lý do phạt',
    example: 'Sách trả muộn 5 ngày so với hạn',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Trạng thái phạt',
    enum: FineStatus,
    example: FineStatus.UNPAID,
  })
  @Column({
    type: 'enum',
    enum: FineStatus,
    default: FineStatus.UNPAID,
  })
  status: FineStatus;

  @ApiProperty({
    description: 'Số ngày trễ (cho phạt trễ hạn)',
    example: 5,
    required: false,
  })
  @Column({ type: 'int', nullable: true })
  overdue_days?: number;

  @ApiProperty({
    description: 'Mức phạt mỗi ngày trễ',
    example: 10000,
    required: false,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  daily_rate?: number;

  @ApiProperty({
    description: 'Ghi chú của thủ thư',
    example: 'Phạt theo quy định thư viện',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  librarian_notes?: string;

  @ApiProperty({
    description: 'Ghi chú của độc giả',
    example: 'Xin lỗi vì sự cố này',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  reader_notes?: string;

  @ApiProperty({
    description: 'Ngày hạn thanh toán',
    example: '2024-02-15T10:00:00.000Z',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  due_date?: Date;

  @ApiProperty({
    description: 'Phương thức thanh toán',
    example: 'cash',
    required: false,
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  payment_method?: string;

  @ApiProperty({
    description: 'Mã giao dịch thanh toán',
    example: 'TXN123456789',
    required: false,
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  transaction_id?: string;

  @ApiProperty({
    description: 'Ngày tạo bản ghi',
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
