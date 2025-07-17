import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
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
import { Exclude, Transform } from 'class-transformer';

import slug from 'slug';

@Entity('products')
export class Product {
  @ApiProperty({
    description: 'Product unique identifier (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Product name',
    example: 'iPhone 15 Pro',
  })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({
    description: 'Product slug (URL-friendly identifier)',
    example: 'iphone-15-pro',
    required: false,
  })
  @Column({ type: 'varchar', length: 300, unique: true, nullable: true })
  slug?: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Latest iPhone with advanced features',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  desc: string;

  @ApiProperty({
    description: 'Product price in USD',
    example: 999.99,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ApiProperty({
    description: 'Product image URL',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  image: string;

  @ApiHideProperty()
  @Exclude()
  @Column({ type: 'uuid', nullable: true })
  categoryId?: string;

  @ApiProperty({
    description: 'Product category',
    example: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Electronics',
    },
    required: false,
  })
  @Transform(({ value }) => (value ? { id: value.id, name: value.name } : null))
  @ManyToOne('Category', 'products', { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: any;

  @ApiProperty({
    description: 'Product creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Product last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    if (this.name) {
      this.slug = slug(this.name, { lower: true });
    }
  }
}
