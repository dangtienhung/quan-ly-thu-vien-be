import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Exclude } from 'class-transformer';

export enum UserRole {
  ADMIN = 'admin',
  READER = 'reader',
}

export enum AccountStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
}

@Entity('users')
export class User {
  @ApiProperty({
    description: 'ID duy nhất của người dùng (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Mã người dùng (mã sinh viên/giảng viên/nhân viên)',
    example: 'GV001 hoặc SV20020001 hoặc NV001',
    maxLength: 20,
    required: false,
  })
  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  userCode?: string;

  @ApiProperty({
    description: 'Tên đăng nhập (duy nhất)',
    example: 'nguyen_van_a',
  })
  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @ApiHideProperty()
  @Exclude()
  @Column({ type: 'varchar', length: 255 })
  password: string;

  @ApiProperty({
    description: 'Địa chỉ email',
    example: 'nguyenvana@example.com',
  })
  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @ApiProperty({
    description: 'Vai trò người dùng',
    example: 'reader',
    enum: UserRole,
  })
  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @ApiProperty({
    description: 'Trạng thái tài khoản',
    example: 'active',
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
  })
  @Column({ type: 'enum', enum: AccountStatus, default: AccountStatus.ACTIVE })
  accountStatus: AccountStatus;

  @ApiProperty({
    description: 'Thời gian đăng nhập cuối cùng',
    example: '2024-01-01T10:30:00.000Z',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  lastLogin?: Date;

  @ApiProperty({
    description: 'Ngày tạo tài khoản',
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
  // @OneToOne('Reader', 'user')
  // reader?: any;
}
