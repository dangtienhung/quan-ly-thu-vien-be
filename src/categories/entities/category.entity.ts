import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Transform } from 'class-transformer';
import slug from 'slug';

@Entity('categories')
export class Category {
  @ApiProperty({
    description: 'Category unique identifier (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Electronics',
  })
  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @ApiProperty({
    description: 'Category slug (URL-friendly identifier)',
    example: 'electronics',
    required: false,
  })
  @Column({ type: 'varchar', length: 300, unique: true, nullable: true })
  slug?: string;

  @ApiProperty({
    description: 'Category description',
    example: 'Electronic devices and accessories',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    description: 'Category creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Category last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiHideProperty()
  @Transform(({ value }) =>
    value
      ? value.map((product) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          desc: product.desc,
          price: product.price,
          image: product.image,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        }))
      : [],
  )
  @OneToMany('Product', 'category')
  products: any[];

  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    if (this.name) {
      this.slug = slug(this.name, { lower: true });
    }
  }
}
