import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';
import slug from 'slug';
import { BookCategory } from '../../book-categories/entities/book-category.entity';
import { Category } from '../../categories/entities/category.entity';
import { Publisher } from '../../publishers/entities/publisher.entity';

export enum BookType {
  PHYSICAL = 'physical',
  EBOOK = 'ebook',
}

export enum PhysicalType {
  LIBRARY_USE = 'library_use',
  BORROWABLE = 'borrowable',
}

@Entity('books')
export class Book {
  @ApiProperty({
    description: 'ID duy nhất của sách (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Tên sách',
    example: 'Dế Mèn Phiêu Lưu Ký',
  })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({
    description: 'Slug của sách (tự động tạo từ tên)',
    example: 'de-men-phieu-luu-ky',
  })
  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @ApiProperty({
    description: 'Mã ISBN của sách',
    example: '978-604-1-08525-9',
  })
  @Column({ type: 'varchar', length: 20, unique: true })
  isbn: string;

  @ApiProperty({
    description: 'Năm xuất bản',
    example: 2020,
  })
  @Column({ type: 'int' })
  publish_year: number;

  @ApiProperty({
    description: 'Phiên bản/Lần tái bản',
    example: '2nd Edition',
    required: false,
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  edition?: string;

  @ApiProperty({
    description: 'Mô tả về sách',
    example: 'Câu chuyện về cuộc phiêu lưu của chú Dế Mèn...',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Đường dẫn đến ảnh bìa sách',
    example: 'https://example.com/book-cover.jpg',
    required: false,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  cover_image?: string;

  @ApiProperty({
    description: 'Ngôn ngữ của sách',
    example: 'Tiếng Việt',
  })
  @Column({ type: 'varchar', length: 50 })
  language: string;

  @ApiProperty({
    description: 'Số trang',
    example: 200,
  })
  @Column({ type: 'int' })
  page_count: number;

  @ApiProperty({
    description: 'Loại sách (physical/ebook)',
    enum: BookType,
    example: BookType.PHYSICAL,
  })
  @Column({
    type: 'enum',
    enum: BookType,
    default: BookType.PHYSICAL,
  })
  book_type: BookType;

  @ApiProperty({
    description: 'Loại sách vật lý (chỉ áp dụng cho sách physical)',
    enum: PhysicalType,
    example: PhysicalType.BORROWABLE,
    required: false,
  })
  @Column({
    type: 'enum',
    enum: PhysicalType,
    nullable: true,
  })
  physical_type?: PhysicalType;

  @ApiProperty({
    description: 'ID của nhà xuất bản',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ type: 'uuid' })
  publisher_id: string;

  @ManyToOne(() => Publisher, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'publisher_id' })
  publisher: Publisher;

  @ApiProperty({
    description: 'ID của thể loại',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ type: 'uuid' })
  category_id: string;

  @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ApiProperty({
    description: 'ID thể loại chính (BookCategories)',
    required: false,
  })
  @Column({ type: 'uuid', nullable: true })
  main_category_id?: string | null;

  @ManyToOne(() => BookCategory, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'main_category_id' })
  mainCategory?: BookCategory | null;

  @ApiProperty({
    description: 'Danh sách các tác giả (được quản lý qua BookAuthors)',
    type: 'array',
    items: { type: 'string' },
    example: ['550e8400-e29b-41d4-a716-446655440000'],
  })
  authors?: string[];

  @ApiProperty({
    description: 'Ngày tạo',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    description: 'Số lượt xem sách',
    example: 0,
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  view: number;

  @ApiProperty({
    description: 'Ngày cập nhật cuối cùng',
    example: '2024-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn()
  updated_at: Date;

  // Tự động tạo slug từ title
  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    this.slug = slug(this.title, { lower: true });
  }
}
