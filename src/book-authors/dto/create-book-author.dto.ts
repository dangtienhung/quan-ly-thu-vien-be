import { IsNotEmpty, IsUUID } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateBookAuthorDto {
  @ApiProperty({
    description: 'ID của sách',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: 'ID sách không được để trống' })
  @IsUUID('4', { message: 'ID sách phải là UUID hợp lệ' })
  book_id: string;

  @ApiProperty({
    description: 'ID của tác giả',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: 'ID tác giả không được để trống' })
  @IsUUID('4', { message: 'ID tác giả phải là UUID hợp lệ' })
  author_id: string;
}
