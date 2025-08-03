import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateUploadDto {
  @ApiProperty({
    description: 'Tên file (sẽ được sử dụng để tạo slug)',
    example: 'tài liệu mẫu',
  })
  @IsNotEmpty({ message: 'Tên file không được để trống' })
  @IsString({ message: 'Tên file phải là chuỗi ký tự' })
  @MaxLength(255, { message: 'Tên file không được quá 255 ký tự' })
  fileName: string;
}
