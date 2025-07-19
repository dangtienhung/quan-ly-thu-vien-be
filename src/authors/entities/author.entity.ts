import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';
import slug from 'slug';

@Entity('authors')
export class Author {
  @ApiProperty({
    description: 'ID duy nhất của tác giả (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Tên tác giả',
    example: 'Nguyễn Nhật Ánh',
  })
  @Column({ type: 'varchar', length: 255 })
  author_name: string;

  @ApiProperty({
    description: 'Slug của tác giả (tự động tạo từ tên)',
    example: 'nguyen-nhat-anh',
  })
  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @ApiProperty({
    description: 'Tiểu sử tác giả',
    example: 'Nhà văn chuyên viết cho thanh thiếu niên...',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  bio?: string;

  @ApiProperty({
    description: 'Quốc tịch của tác giả',
    example: 'Việt Nam',
  })
  @Column({ type: 'varchar', length: 100 })
  nationality: string;

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

  // Tự động tạo slug từ tên tác giả
  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    this.slug = slug(this.author_name, { lower: true });
  }
}
