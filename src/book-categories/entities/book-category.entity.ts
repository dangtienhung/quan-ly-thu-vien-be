import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('book_categories')
@Unique(['name'])
export class BookCategory {
  @ApiProperty({ description: 'ID duy nhất của thể loại chi tiết (UUID)' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Tên thể loại chi tiết (unique)',
    example: 'Sách Toán',
  })
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @ApiProperty({
    description: 'ID danh mục cha',
    required: false,
    nullable: true,
  })
  @Column({ type: 'uuid', nullable: true })
  parent_id?: string | null;

  @ApiHideProperty()
  @ManyToOne(() => BookCategory, (category) => category.children, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_id' })
  parent?: BookCategory | null;

  @ApiHideProperty()
  @OneToMany(() => BookCategory, (category) => category.parent)
  children?: BookCategory[];

  @ApiProperty({ description: 'Ngày tạo' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Ngày cập nhật cuối' })
  @UpdateDateColumn()
  updatedAt: Date;
}
