import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthorDto {
  @ApiProperty({
    description: 'Tên tác giả',
    example: 'Nguyễn Nhật Ánh',
  })
  @IsNotEmpty({ message: 'Tên tác giả không được để trống' })
  @IsString({ message: 'Tên tác giả phải là chuỗi ký tự' })
  @MaxLength(255, { message: 'Tên tác giả không được quá 255 ký tự' })
  author_name: string;

  @ApiProperty({
    description: 'Tiểu sử tác giả',
    example: 'Nhà văn chuyên viết cho thanh thiếu niên...',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Tiểu sử phải là chuỗi ký tự' })
  bio?: string;

  @ApiProperty({
    description: 'Quốc tịch của tác giả',
    example: 'Việt Nam',
  })
  @IsNotEmpty({ message: 'Quốc tịch không được để trống' })
  @IsString({ message: 'Quốc tịch phải là chuỗi ký tự' })
  @MaxLength(100, { message: 'Quốc tịch không được quá 100 ký tự' })
  nationality: string;
}
