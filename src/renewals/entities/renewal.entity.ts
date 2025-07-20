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
import { User } from '../../users/entities/user.entity';

@Entity('renewals')
export class Renewal {
  @ApiProperty({
    description: 'ID duy nhất của bản ghi gia hạn (UUID)',
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
    description: 'Ngày gia hạn',
    example: '2024-01-10T10:00:00.000Z',
  })
  @Column({ type: 'timestamp' })
  renewal_date: Date;

  @ApiProperty({
    description: 'Ngày hạn mới sau khi gia hạn',
    example: '2024-01-25T10:00:00.000Z',
  })
  @Column({ type: 'timestamp' })
  new_due_date: Date;

  @ApiProperty({
    description: 'ID của thủ thư xử lý gia hạn',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ type: 'uuid' })
  librarian_id: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'librarian_id' })
  librarian: User;

  @ApiProperty({
    description: 'Lý do gia hạn',
    example: 'Độc giả yêu cầu gia hạn thêm thời gian để hoàn thành nghiên cứu',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  reason?: string;

  @ApiProperty({
    description: 'Ghi chú của thủ thư',
    example: 'Gia hạn theo yêu cầu của độc giả',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  librarian_notes?: string;

  @ApiProperty({
    description: 'Số lần gia hạn trong bản ghi mượn sách này',
    example: 1,
  })
  @Column({ type: 'int' })
  renewal_number: number;

  @ApiProperty({
    description: 'Trạng thái gia hạn',
    example: 'approved',
  })
  @Column({ type: 'varchar', length: 20, default: 'approved' })
  status: string;

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
