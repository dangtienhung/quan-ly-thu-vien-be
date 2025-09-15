import { AccountStatus, UserRole } from '../entities/user.entity';

import { ApiProperty } from '@nestjs/swagger';
import { ReaderTypeName } from 'src/reader-types/entities/reader-type.entity';

export class UserStatsDto {
  @ApiProperty({
    description: 'Tổng số người dùng',
    example: 150,
  })
  totalUsers: number;

  @ApiProperty({
    description: 'Số lượng người dùng theo vai trò',
    example: {
      admin: 5,
      reader: 145,
    },
  })
  usersByRole: Record<UserRole, number>;

  @ApiProperty({
    description: 'Số lượng người dùng theo trạng thái tài khoản',
    example: {
      active: 140,
      suspended: 8,
      banned: 2,
    },
  })
  usersByStatus: Record<AccountStatus, number>;

  @ApiProperty({
    description: 'Số lượng độc giả theo loại độc giả',
    example: {
      student: 80,
      teacher: 25,
      staff: 15,
      guest: 5,
    },
  })
  readersByType: Record<ReaderTypeName, number>;

  @ApiProperty({
    description: 'Số lượng người dùng mới trong 30 ngày qua',
    example: 25,
  })
  newUsersLast30Days: number;

  @ApiProperty({
    description: 'Số lượng người dùng đăng nhập trong 7 ngày qua',
    example: 45,
  })
  activeUsersLast7Days: number;

  @ApiProperty({
    description: 'Số lượng người dùng chưa bao giờ đăng nhập',
    example: 12,
  })
  neverLoggedInUsers: number;

  @ApiProperty({
    description: 'Thống kê theo tháng (12 tháng gần nhất)',
    example: [
      { month: '2024-01', count: 10 },
      { month: '2024-02', count: 15 },
    ],
  })
  monthlyStats: Array<{
    month: string;
    count: number;
  }>;

  @ApiProperty({
    description: 'Thời gian tạo báo cáo',
    example: '2024-01-01T00:00:00.000Z',
  })
  generatedAt: Date;
}
