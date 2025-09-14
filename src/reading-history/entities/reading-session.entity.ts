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

@Entity('reading_sessions')
export class ReadingSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID độc giả' })
  @Column({ name: 'reader_id' })
  reader_id: string;

  @ApiProperty({ description: 'ID sách' })
  @Column({ name: 'book_id' })
  book_id: string;

  @ApiProperty({ description: 'Thời gian bắt đầu đọc' })
  @Column({ name: 'started_at', type: 'timestamp' })
  started_at: Date;

  @ApiProperty({ description: 'Thời gian kết thúc đọc' })
  @Column({ name: 'ended_at', type: 'timestamp', nullable: true })
  ended_at: Date | null;

  @ApiProperty({ description: 'Thời lượng đọc (giây)' })
  @Column({ name: 'duration_seconds', type: 'int', default: 0 })
  duration_seconds: number;

  @ApiProperty({ description: 'Trang bắt đầu đọc' })
  @Column({ name: 'start_page', type: 'int', default: 1 })
  start_page: number;

  @ApiProperty({ description: 'Trang kết thúc đọc' })
  @Column({ name: 'end_page', type: 'int', default: 1 })
  end_page: number;

  @ApiProperty({
    description: 'Trạng thái session: active, completed, abandoned',
  })
  @Column({
    type: 'enum',
    enum: ['active', 'completed', 'abandoned'],
    default: 'active',
  })
  status: 'active' | 'completed' | 'abandoned';

  @ApiProperty({ description: 'Thiết bị đọc' })
  @Column({ name: 'device', type: 'varchar', length: 100, nullable: true })
  device: string;

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
  endSession(endPage: number): void {
    this.ended_at = new Date();
    this.end_page = endPage;
    this.duration_seconds = Math.floor(
      (this.ended_at.getTime() - this.started_at.getTime()) / 1000,
    );
    this.status = 'completed';
  }

  abandonSession(): void {
    this.ended_at = new Date();
    this.duration_seconds = Math.floor(
      (this.ended_at.getTime() - this.started_at.getTime()) / 1000,
    );
    this.status = 'abandoned';
  }
}
