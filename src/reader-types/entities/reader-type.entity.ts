import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

export enum ReaderTypeName {
  STUDENT = 'student',
  TEACHER = 'teacher',
  STAFF = 'staff',
}

@Entity('reader_types')
export class ReaderType {
  @ApiProperty({
    description: 'ID duy nhất của loại độc giả (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Tên loại độc giả',
    example: 'student',
    enum: ReaderTypeName,
  })
  @Column({ type: 'enum', enum: ReaderTypeName, unique: true })
  typeName: ReaderTypeName;

  @ApiProperty({
    description: 'Số sách tối đa được mượn',
    example: 5,
    minimum: 1,
    maximum: 20,
  })
  @Column({ type: 'integer' })
  maxBorrowLimit: number;

  @ApiProperty({
    description: 'Thời gian được mượn (ngày)',
    example: 14,
    minimum: 1,
    maximum: 60,
  })
  @Column({ type: 'integer' })
  borrowDurationDays: number;

  @ApiProperty({
    description: 'Tiền phạt trả muộn mỗi ngày (VND)',
    example: 5000,
    minimum: 1000,
    maximum: 50000,
  })
  @Column({ type: 'integer', default: 5000 })
  lateReturnFinePerDay: number;

  @ApiProperty({
    description: 'Mô tả về loại độc giả',
    example: 'Học Sinh đại học có thể mượn tối đa 5 cuốn trong 14 ngày',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

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

  // TODO: Uncomment when Reader entity relationships are stable
  // @ApiHideProperty()
  // @OneToMany('Reader', 'readerType')
  // readers?: any[];
}
