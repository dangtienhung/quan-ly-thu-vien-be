import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateSimplePublisherDto {
  @ApiProperty({
    description: 'Email liên hệ (bắt buộc)',
    example: 'contact@publisher.com',
  })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @MaxLength(255, { message: 'Email không được quá 255 ký tự' })
  email: string;
}
