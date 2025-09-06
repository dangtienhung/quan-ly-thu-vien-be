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

@Entity('locations')
export class Location {
  @ApiProperty({
    description: 'ID duy nhất của vị trí kệ sách (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Tên vị trí kệ sách',
    example: 'Kệ A1 - Tầng 1',
  })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({
    description: 'Slug cho URL thân thiện (tự động tạo từ tên)',
    example: 'ke-a1-tang-1',
    required: false,
  })
  @Column({ type: 'varchar', length: 300, unique: true, nullable: true })
  slug?: string;

  @ApiProperty({
    description: 'Mô tả chi tiết về vị trí',
    example: 'Kệ sách khoa học tự nhiên, tầng 1, khu A',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Tầng của thư viện',
    example: 1,
    required: false,
  })
  @Column({ type: 'int', nullable: true })
  floor?: number;

  @ApiProperty({
    description: 'Khu vực trong thư viện',
    example: 'Khu A',
    required: false,
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  section?: string;

  @ApiProperty({
    description: 'Số kệ',
    example: 'A1',
    required: false,
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  shelf?: string;

  @ApiProperty({
    description: 'Trạng thái hoạt động của vị trí',
    example: true,
  })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Ngày tạo',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Ngày cập nhật cuối cùng',
    example: '2024-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  // Tự động tạo slug từ tên
  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    if (this.name) {
      this.slug = slug(this.name, { lower: true });
    }
  }
}
