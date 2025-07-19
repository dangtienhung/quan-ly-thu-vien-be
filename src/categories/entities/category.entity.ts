import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import slug from 'slug';

@Entity('categories')
export class Category {
  @ApiProperty({
    description: 'ID duy nhất của thể loại (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Tên thể loại',
    example: 'Sách Khoa Học',
  })
  @Column({ type: 'varchar', length: 255 })
  category_name: string;

  @ApiProperty({
    description: 'Slug của thể loại (tự động tạo từ tên)',
    example: 'sach-khoa-hoc',
  })
  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @ApiProperty({
    description: 'Mô tả về thể loại',
    example: 'Các sách về khoa học, công nghệ, và khám phá',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiPropertyOptional({
    description: 'ID của thể loại cha (nếu là thể loại con)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true,
  })
  @Column({ type: 'uuid', nullable: true })
  parent_id?: string;

  @ManyToOne(() => Category, (category) => category.children)
  @JoinColumn({ name: 'parent_id' })
  parent?: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children?: Category[];

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

  // Tự động tạo slug từ tên thể loại
  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    this.slug = slug(this.category_name, { lower: true });
  }
}
