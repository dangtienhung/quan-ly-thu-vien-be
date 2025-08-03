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

@Entity('uploads')
export class Upload {
  @ApiProperty({
    description: 'ID duy nhất của bản ghi (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Tên gốc của file được upload',
    example: 'tài liệu mẫu.pdf',
  })
  @Column({ type: 'varchar', length: 255 })
  originalName: string;

  @ApiProperty({
    description: 'Tên file đã được đổi tên (dựa trên slug)',
    example: 'tai-lieu-mau.pdf',
  })
  @Column({ type: 'varchar', length: 300, unique: true })
  fileName: string;

  @ApiProperty({
    description: 'Slug được tạo từ tên file gốc',
    example: 'tai-lieu-mau',
  })
  @Column({ type: 'varchar', length: 300, unique: true })
  slug: string;

  @ApiProperty({
    description: 'Đường dẫn file trong hệ thống',
    example: 'files/tai-lieu-mau.pdf',
  })
  @Column({ type: 'varchar', length: 500 })
  filePath: string;

  @ApiProperty({
    description: 'Kích thước file (bytes)',
    example: 1048576,
  })
  @Column({ type: 'bigint' })
  fileSize: number;

  @ApiProperty({
    description: 'MIME type của file',
    example: 'application/pdf',
  })
  @Column({ type: 'varchar', length: 100 })
  mimeType: string;

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

  // Tự động tạo slug từ tên file gốc
  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    if (this.originalName) {
      // Loại bỏ phần mở rộng file (.pdf) trước khi tạo slug
      const nameWithoutExtension = this.originalName.replace(/\.[^/.]+$/, '');
      this.slug = slug(nameWithoutExtension, { lower: true });

      // Tạo tên file mới với slug và giữ nguyên phần mở rộng
      const extension = this.originalName.split('.').pop();
      this.fileName = `${this.slug}.${extension}`;

      // Tạo đường dẫn file
      this.filePath = `files/${this.fileName}`;
    }
  }
}
