import { ApiProperty } from '@nestjs/swagger';

export class CreateUserResultDto {
  @ApiProperty({
    description: 'Kết quả tạo user',
    example: 'success',
    enum: ['success', 'error'],
  })
  status: 'success' | 'error';

  @ApiProperty({
    description: 'Thông tin user được tạo',
    example: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      userCode: 'SV20020001',
      username: 'nguyen_van_a',
      email: 'nguyenvana@example.com',
    },
    required: false,
  })
  user?: {
    id: string;
    userCode: string;
    username: string;
    email: string;
  };

  @ApiProperty({
    description: 'Thông tin reader được tạo',
    example: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      fullName: 'Nguyễn Văn An',
      cardNumber: 'LIB2024001',
    },
    required: false,
  })
  reader?: {
    id: string;
    fullName: string;
    cardNumber: string;
  };

  @ApiProperty({
    description: 'Lỗi nếu có',
    example: 'Email đã tồn tại',
    required: false,
  })
  error?: string;

  @ApiProperty({
    description: 'Index của user trong danh sách gửi lên',
    example: 0,
  })
  index: number;
}

export class CreateMultipleUsersResponseDto {
  @ApiProperty({
    description: 'Tổng số user được gửi lên',
    example: 5,
  })
  totalUsers: number;

  @ApiProperty({
    description: 'Số user được tạo thành công',
    example: 4,
  })
  successCount: number;

  @ApiProperty({
    description: 'Số user tạo thất bại',
    example: 1,
  })
  errorCount: number;

  @ApiProperty({
    description: 'Danh sách kết quả tạo từng user',
    type: [CreateUserResultDto],
  })
  results: CreateUserResultDto[];

  @ApiProperty({
    description: 'Thông báo tổng quan',
    example: 'Đã tạo thành công 4/5 user',
  })
  message: string;
}
