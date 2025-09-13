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

@Entity('publishers')
export class Publisher {
  @ApiProperty({
    description: 'ID duy nhất của nhà xuất bản (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Tên nhà xuất bản',
    example: 'Nhà xuất bản Giáo dục Việt Nam',
    required: false,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  publisherName?: string;

  @ApiProperty({
    description: 'Slug cho URL thân thiện (tự động tạo từ tên)',
    example: 'nha-xuat-ban-giao-duc-viet-nam',
    required: false,
  })
  @Column({ type: 'varchar', length: 300, unique: true, nullable: true })
  slug?: string;

  @ApiProperty({
    description: 'Địa chỉ nhà xuất bản',
    example: '123 Đường ABC, Quận 1, TP.HCM',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  address?: string;

  @ApiProperty({
    description: 'Số điện thoại liên hệ',
    example: '0123456789',
    required: false,
  })
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @ApiProperty({
    description: 'Email liên hệ (bắt buộc)',
    example: 'contact@publisher.com',
  })
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @ApiProperty({
    description: 'Website của nhà xuất bản',
    example: 'https://publisher.com',
    required: false,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  website?: string;

  @ApiProperty({
    description: 'Mô tả về nhà xuất bản',
    example: 'Nhà xuất bản chuyên về sách giáo dục',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Trạng thái hoạt động (mặc định: true)',
    example: true,
    required: false,
  })
  @Column({ type: 'boolean', default: true })
  isActive?: boolean;

  @ApiProperty({
    description: 'Ngày thành lập',
    example: '2000-01-01',
    required: false,
  })
  @Column({ type: 'date', nullable: true })
  establishedDate?: Date;

  @ApiProperty({
    description: 'Quốc gia',
    example: 'Việt Nam',
    required: false,
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

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

  // Relationships
  // @OneToMany(() => Book, (book) => book.publisher)
  // books: Book[];

  // Tự động tạo slug từ tên
  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    if (this.publisherName) {
      this.slug = slug(this.publisherName, { lower: true });
    } else {
      this.slug = undefined;
    }
  }
}
