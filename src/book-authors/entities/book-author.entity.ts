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
import { Author } from '../../authors/entities/author.entity';
import { Book } from '../../books/entities/book.entity';

@Entity('book_authors')
export class BookAuthor {
  @ApiProperty({
    description: 'ID duy nhất của mối quan hệ sách-tác giả (UUID)',
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

  @ManyToOne(() => Book, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'book_id' })
  book: Book;

  @ApiProperty({
    description: 'ID của tác giả',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ type: 'uuid' })
  author_id: string;

  @ManyToOne(() => Author, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: Author;

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
