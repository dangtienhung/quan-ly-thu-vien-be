import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { CreateAuthorDto } from './create-author.dto';
import { Type } from 'class-transformer';

export class CreateManyAuthorsDto {
  @ApiProperty({
    description: 'Danh sách tác giả cần tạo',
    type: [CreateAuthorDto],
    example: [
      {
        author_name: 'Nguyễn Nhật Ánh',
        bio: 'Nhà văn chuyên viết cho thanh thiếu niên...',
        nationality: 'Việt Nam',
      },
      {
        author_name: 'Tô Hoài',
        bio: 'Tác giả của Dế Mèn Phiêu Lưu Ký...',
        nationality: 'Việt Nam',
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Phải có ít nhất một tác giả' })
  @ValidateNested({ each: true })
  @Type(() => CreateAuthorDto)
  authors: CreateAuthorDto[];
}
