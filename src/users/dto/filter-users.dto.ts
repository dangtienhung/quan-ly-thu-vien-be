import { IsEnum, IsOptional, IsString } from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { UserRole } from '../entities/user.entity';

export class FilterUsersDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Lọc theo loại người dùng',
    enum: UserRole,
    example: 'reader',
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Type phải là reader hoặc admin' })
  type?: UserRole;

  @ApiPropertyOptional({
    description: 'Tìm kiếm theo email, username hoặc userCode',
    example: 'nguyen_van_a',
  })
  @IsOptional()
  @IsString({ message: 'Search phải là chuỗi ký tự' })
  search?: string;
}
