import { ApiProperty } from '@nestjs/swagger';
import slug from 'slug';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('images')
export class Image {
  @ApiProperty({
    description: 'ID duy nhất của bản ghi (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Tên gốc của image được upload',
    example: 'hình ảnh mẫu.jpg',
  })
  @Column({ type: 'varchar', length: 255 })
  originalName: string;

  @ApiProperty({
    description: 'Tên image đã được đổi tên (dựa trên slug)',
    example: 'hinh-anh-mau.jpg',
  })
  @Column({ type: 'varchar', length: 300, unique: true })
  fileName: string;

  @ApiProperty({
    description: 'Slug được tạo từ tên image gốc',
    example: 'hinh-anh-mau',
  })
  @Column({ type: 'varchar', length: 300, unique: true })
  slug: string;

  @ApiProperty({
    description: 'URL của image trên Cloudinary',
    example:
      'https://res.cloudinary.com/dcwdrvxdg/image/upload/v1234567890/quan-ly-thu-vien-cua-duong/hinh-anh-mau.jpg',
  })
  @Column({ type: 'varchar', length: 500 })
  cloudinaryUrl: string;

  @ApiProperty({
    description: 'Public ID của image trên Cloudinary',
    example: 'quan-ly-thu-vien-cua-duong/hinh-anh-mau',
  })
  @Column({ type: 'varchar', length: 300 })
  cloudinaryPublicId: string;

  @ApiProperty({
    description: 'Kích thước image (bytes)',
    example: 1048576,
  })
  @Column({ type: 'bigint' })
  fileSize: number;

  @ApiProperty({
    description: 'MIME type của image',
    example: 'image/jpeg',
  })
  @Column({ type: 'varchar', length: 100 })
  mimeType: string;

  @ApiProperty({
    description: 'Chiều rộng của image (pixels)',
    example: 1920,
  })
  @Column({ type: 'int', nullable: true })
  width?: number;

  @ApiProperty({
    description: 'Chiều cao của image (pixels)',
    example: 1080,
  })
  @Column({ type: 'int', nullable: true })
  height?: number;

  @ApiProperty({
    description: 'Format của image',
    example: 'jpg',
  })
  @Column({ type: 'varchar', length: 10 })
  format: string;

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

  // Tự động tạo slug từ tên image gốc
  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    if (this.originalName) {
      // Loại bỏ phần mở rộng image trước khi tạo slug
      const nameWithoutExtension = this.originalName.replace(/\.[^/.]+$/, '');
      this.slug = slug(nameWithoutExtension, { lower: true });

      // Tạo tên file mới với slug và giữ nguyên phần mở rộng
      const extension = this.originalName.split('.').pop();
      this.fileName = `${this.slug}.${extension}`;
    }
  }
}
