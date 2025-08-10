import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('grade_levels')
@Unique(['name'])
export class GradeLevel {
  @ApiProperty({ description: 'ID duy nhất của khối lớp (UUID)' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Tên khối lớp (unique)', example: 'Lớp 1' })
  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @ApiProperty({ description: 'Mô tả', required: false })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Thứ tự sắp xếp hiển thị', example: 1 })
  @Column({ type: 'integer', default: 0 })
  order: number;

  @ApiProperty({ description: 'Ngày tạo' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Ngày cập nhật cuối' })
  @UpdateDateColumn()
  updatedAt: Date;
}
