import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Reader } from '../../readers/entities/reader.entity';

export enum NotificationType {
  DUE_DATE_REMINDER = 'due_date_reminder',
  OVERDUE_NOTICE = 'overdue_notice',
  BOOK_RETURNED = 'book_returned',
  BOOK_BORROWED = 'book_borrowed',
  GENERAL = 'general',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  READ = 'read',
  FAILED = 'failed',
}

@Entity('notifications')
export class Notification {
  @ApiProperty({
    description: 'ID duy nhất của thông báo (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID của độc giả nhận thông báo',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ type: 'uuid' })
  reader_id: string;

  @ManyToOne(() => Reader, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reader_id' })
  reader: Reader;

  @ApiProperty({
    description: 'Tiêu đề thông báo',
    example: 'Nhắc nhở trả sách',
  })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({
    description: 'Nội dung thông báo',
    example: 'Sách của bạn sắp đến hạn trả trong 2 ngày tới.',
  })
  @Column({ type: 'text' })
  message: string;

  @ApiProperty({
    description: 'Loại thông báo',
    enum: NotificationType,
    example: NotificationType.DUE_DATE_REMINDER,
  })
  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.GENERAL,
  })
  type: NotificationType;

  @ApiProperty({
    description: 'Trạng thái thông báo',
    enum: NotificationStatus,
    example: NotificationStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @ApiProperty({
    description: 'Dữ liệu bổ sung (JSON)',
    example: { bookTitle: 'Lập trình Python', dueDate: '2024-12-21' },
    required: false,
  })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @ApiProperty({
    description: 'Thời gian đọc thông báo',
    example: '2024-12-19T10:00:00.000Z',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  read_at?: Date;

  @ApiProperty({
    description: 'Thời gian gửi thông báo',
    example: '2024-12-19T10:00:00.000Z',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  sent_at?: Date;

  @ApiProperty({
    description: 'Lỗi khi gửi thông báo',
    example: 'Email không hợp lệ',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  error_message?: string;

  @ApiProperty({
    description: 'Thời gian tạo thông báo',
    example: '2024-12-19T10:00:00.000Z',
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật thông báo',
    example: '2024-12-19T10:00:00.000Z',
  })
  @UpdateDateColumn()
  updated_at: Date;
}
