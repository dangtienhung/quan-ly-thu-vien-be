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
import { PhysicalCopy } from '../../physical-copy/entities/physical-copy.entity';
import { Reader } from '../../readers/entities/reader.entity';
import { User } from '../../users/entities/user.entity';

export enum BorrowStatus {
  BORROWED = 'borrowed',
  RETURNED = 'returned',
  OVERDUE = 'overdue',
  RENEWED = 'renewed',
}

@Entity('borrow_records')
export class BorrowRecord {
  @ApiProperty({
    description: 'ID duy nhất của bản ghi mượn sách (UUID)',
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

  @ManyToOne(() => Reader, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'reader_id' })
  reader: Reader;

  @ApiProperty({
    description: 'ID của bản sao sách vật lý',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ type: 'uuid' })
  copy_id: string;

  @ManyToOne(() => PhysicalCopy, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'copy_id' })
  physicalCopy: PhysicalCopy;

  @ApiProperty({
    description: 'Ngày mượn sách',
    example: '2024-01-01T10:00:00.000Z',
  })
  @Column({ type: 'timestamp' })
  borrow_date: Date;

  @ApiProperty({
    description: 'Ngày phải trả sách',
    example: '2024-01-15T10:00:00.000Z',
  })
  @Column({ type: 'timestamp' })
  due_date: Date;

  @ApiProperty({
    description: 'Ngày thực tế trả sách',
    example: '2024-01-14T15:30:00.000Z',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  return_date?: Date;

  @ApiProperty({
    description: 'Trạng thái mượn sách',
    enum: BorrowStatus,
    example: BorrowStatus.BORROWED,
  })
  @Column({
    type: 'enum',
    enum: BorrowStatus,
    default: BorrowStatus.BORROWED,
  })
  status: BorrowStatus;

  @ApiProperty({
    description: 'ID của thủ thư xử lý giao dịch',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ type: 'uuid' })
  librarian_id: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'librarian_id' })
  librarian: User;

  @ApiProperty({
    description: 'Ghi chú khi mượn sách',
    example: 'Độc giả yêu cầu giữ sách cẩn thận',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  borrow_notes?: string;

  @ApiProperty({
    description: 'Ghi chú khi trả sách',
    example: 'Sách trả đúng hạn, tình trạng tốt',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  return_notes?: string;

  @ApiProperty({
    description: 'Số lần gia hạn',
    example: 0,
  })
  @Column({ type: 'int', default: 0 })
  renewal_count: number;

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
