import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude, Transform } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ReaderType } from '../../reader-types/entities/reader-type.entity';
import { User } from '../../users/entities/user.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity('readers')
export class Reader {
  @ApiProperty({
    description: 'Reader unique identifier (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiHideProperty()
  @Exclude()
  @Column({ type: 'uuid' })
  userId: string;

  @ApiProperty({
    description: 'Associated user account',
    example: { id: 'uuid', username: 'john_doe', email: 'john@example.com' },
  })
  @Transform(({ value }) =>
    value
      ? { id: value.id, username: value.username, email: value.email }
      : null,
  )
  @OneToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiHideProperty()
  @Exclude()
  @Column({ type: 'uuid' })
  readerTypeId: string;

  @ApiProperty({
    description: 'Reader type information',
    example: { id: 'uuid', typeName: 'student', maxBorrowLimit: 5 },
  })
  @Transform(({ value }) =>
    value
      ? {
          id: value.id,
          typeName: value.typeName,
          maxBorrowLimit: value.maxBorrowLimit,
          borrowDurationDays: value.borrowDurationDays,
        }
      : null,
  )
  @ManyToOne(() => ReaderType, { nullable: false })
  @JoinColumn({ name: 'readerTypeId' })
  readerType: ReaderType;

  @ApiProperty({
    description: 'Reader full name',
    example: 'Nguyễn Văn An',
  })
  @Column({ type: 'varchar', length: 100 })
  fullName: string;

  @ApiProperty({
    description: 'Date of birth',
    example: '1995-06-15',
    required: false,
  })
  @Column({ type: 'date', nullable: true })
  dob?: Date;

  @ApiProperty({
    description: 'Gender',
    example: 'male',
    enum: Gender,
    required: false,
  })
  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender?: Gender;

  @ApiProperty({
    description: 'Home address',
    example: '123 Đường ABC, Quận 1, TP.HCM',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  address?: string;

  @ApiProperty({
    description: 'Phone number',
    example: '0123456789',
    required: false,
  })
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @ApiProperty({
    description: 'Library card number',
    example: 'LIB2024001',
    required: false,
  })
  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  cardNumber?: string;

  @ApiProperty({
    description: 'Card issue date',
    example: '2024-01-01',
    required: false,
  })
  @Column({ type: 'date', nullable: true })
  cardIssueDate?: Date;

  @ApiProperty({
    description: 'Card expiry date',
    example: '2025-01-01',
    required: false,
  })
  @Column({ type: 'date', nullable: true })
  cardExpiryDate?: Date;

  @ApiProperty({
    description: 'Whether the reader account is active',
    example: true,
    default: true,
  })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Reader creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Reader last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  // TODO: Uncomment these when BorrowRecord and Reservation entities are created
  // @ApiHideProperty()
  // @OneToMany('BorrowRecord', 'reader')
  // borrowRecords?: any[];

  // @ApiHideProperty()
  // @OneToMany('Reservation', 'reader')
  // reservations?: any[];
}
