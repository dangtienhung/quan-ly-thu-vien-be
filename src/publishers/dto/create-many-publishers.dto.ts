import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  ValidateNested,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { CreatePublisherDto } from './create-publisher.dto';
import { Type } from 'class-transformer';

export class CreateManyPublishersDto {
  @ApiProperty({
    description: 'Danh sách nhà xuất bản cần tạo',
    type: [CreatePublisherDto],
    example: [
      {
        publisherName: 'NXB Kim Đồng',
        address: '55 Quang Trung, Hai Bà Trưng, Hà Nội',
        phone: '024-3821-4789',
        email: 'info@nxbkimdong.com.vn',
        website: 'https://nxbkimdong.com.vn',
        description: 'Nhà xuất bản chuyên về sách thiếu nhi',
        country: 'Việt Nam',
        establishedDate: '1957-06-17',
      },
      {
        publisherName: 'NXB Trẻ',
        address: '161B Lý Chính Thắng, Quận 3, TP.HCM',
        phone: '028-3931-6262',
        email: 'info@nxbtre.com.vn',
        website: 'https://nxbtre.com.vn',
        description: 'Nhà xuất bản sách văn học và giáo dục',
        country: 'Việt Nam',
        establishedDate: '1981-03-24',
      },
    ],
  })
  @IsArray({ message: 'Danh sách nhà xuất bản phải là một mảng' })
  @ArrayMinSize(1, { message: 'Phải có ít nhất 1 nhà xuất bản để tạo' })
  @ArrayMaxSize(50, { message: 'Không thể tạo quá 50 nhà xuất bản cùng lúc' })
  @ValidateNested({ each: true })
  @Type(() => CreatePublisherDto)
  publishers: CreatePublisherDto[];
}
