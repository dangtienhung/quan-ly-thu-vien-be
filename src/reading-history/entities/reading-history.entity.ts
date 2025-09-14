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
import { Reader } from 'src/readers/entities/reader.entity';

@Entity('reading_history')
// @Index(['reader_id', 'book_id'], { unique: true })
export class ReadingHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID độc giả' })
  @Column({ name: 'reader_id' })
  reader_id: string;

  @ApiProperty({ description: 'ID sách' })
  @Column({ name: 'book_id' })
  book_id: string;

  @ApiProperty({
    description: 'Trạng thái đọc: reading, completed, paused, abandoned',
  })
  @Column({
    type: 'enum',
    enum: ['reading', 'completed', 'paused', 'abandoned'],
    default: 'reading',
  })
  status: 'reading' | 'completed' | 'paused' | 'abandoned';

  @ApiProperty({ description: 'Trang hiện tại đang đọc' })
  @Column({ name: 'current_page', type: 'int', default: 1 })
  current_page: number;

  @ApiProperty({ description: 'Thời gian đọc tổng (giây)' })
  @Column({ name: 'total_reading_time_seconds', type: 'int', default: 0 })
  total_reading_time_seconds: number;

  @ApiProperty({ description: 'Lần đọc cuối cùng' })
  @Column({ name: 'last_read_at', type: 'timestamp', nullable: true })
  last_read_at: Date | null;

  @ApiProperty({ description: 'Sách yêu thích' })
  @Column({ name: 'is_favorite', type: 'boolean', default: false })
  is_favorite: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => Reader, { eager: true })
  @JoinColumn({ name: 'reader_id' })
  reader: Reader;

  @ManyToOne(() => Book, { eager: true })
  @JoinColumn({ name: 'book_id' })
  book: Book;

  // Methods
  updateReadingTime(timeSpent: number): void {
    this.total_reading_time_seconds += timeSpent;
    this.last_read_at = new Date();
  }

  updatePage(page: number): void {
    this.current_page = page;
    this.last_read_at = new Date();
  }

  markAsCompleted(): void {
    this.status = 'completed';
    this.last_read_at = new Date();
  }

  toggleFavorite(): void {
    this.is_favorite = !this.is_favorite;
  }
}
