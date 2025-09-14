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
import { Book } from 'src/books/entities/book.entity';

@Entity('ebooks')
export class EBook {
  @ApiProperty({
    description: 'ID duy nhất của ebook (UUID)',
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
    description: 'Đường dẫn đến file',
    example: '/storage/ebooks/sample.pdf',
  })
  @Column({ type: 'varchar', length: 255 })
  file_path: string;

  @ApiProperty({
    description: 'Kích thước file (bytes)',
    example: 1024000,
  })
  @Column({ type: 'bigint' })
  file_size: number;

  @ApiProperty({
    description: 'Định dạng file',
    example: 'PDF',
  })
  @Column({ type: 'varchar', length: 20 })
  file_format: string;

  @ApiProperty({
    description: 'Số lượt tải xuống',
    example: 100,
  })
  @Column({ type: 'int', default: 0 })
  download_count: number;

  @ApiProperty({
    description: 'Số lượt đọc (view)',
    example: 250,
  })
  @Column({ type: 'int', default: 0 })
  view_count: number;

  @ApiProperty({
    description: 'Số lượt đọc hoàn thành',
    example: 50,
  })
  @Column({ type: 'int', default: 0 })
  completed_read_count: number;

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
