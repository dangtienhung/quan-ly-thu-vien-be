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
    description: 'Reader type unique identifier (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Reader type name',
    example: 'student',
    enum: ReaderTypeName,
  })
  @Column({ type: 'enum', enum: ReaderTypeName })
  typeName: ReaderTypeName;

  @ApiProperty({
    description: 'Maximum number of books that can be borrowed',
    example: 5,
  })
  @Column({ type: 'integer' })
  maxBorrowLimit: number;

  @ApiProperty({
    description: 'Number of days books can be borrowed',
    example: 14,
  })
  @Column({ type: 'integer' })
  borrowDurationDays: number;

  @ApiProperty({
    description: 'Description of the reader type',
    example: 'Students can borrow up to 5 books for 14 days',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  // TODO: Uncomment when Reader entity relationships are stable
  // @ApiHideProperty()
  // @OneToMany('Reader', 'readerType')
  // readers?: any[];
}
