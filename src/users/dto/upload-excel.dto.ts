import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class UploadExcelDto {
  @ApiProperty({
    description: 'File Excel chứa danh sách người dùng',
    type: 'string',
    format: 'binary',
  })
  @IsNotEmpty({ message: 'File Excel không được để trống' })
  @IsString({ message: 'File Excel phải là file hợp lệ' })
  file: Express.Multer.File;
}

export class UploadExcelResponseDto {
  @ApiProperty({
    description: 'Thông báo kết quả upload',
    example: 'File Excel đã được upload thành công',
  })
  message: string;

  @ApiProperty({
    description: 'Tên file đã upload',
    example: 'users.xlsx',
  })
  filename: string;

  @ApiProperty({
    description: 'Kích thước file (bytes)',
    example: 1024,
  })
  size: number;

  @ApiProperty({
    description: 'Số dòng dữ liệu đã đọc được',
    example: 100,
  })
  totalRows: number;

  @ApiProperty({
    description: 'Số dòng dữ liệu hợp lệ',
    example: 95,
  })
  validRows: number;

  @ApiProperty({
    description: 'Số dòng dữ liệu không hợp lệ',
    example: 5,
  })
  invalidRows: number;

  @ApiProperty({
    description: 'Danh sách lỗi validation (nếu có)',
    example: ['Dòng 3: Thiếu email', 'Dòng 7: Email không hợp lệ'],
  })
  errors?: string[];

  @ApiProperty({
    description: 'Dữ liệu đã đọc được từ file Excel',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        userCode: { type: 'string' },
        username: { type: 'string' },
        email: { type: 'string' },
        vaiTro: { type: 'string' },
        trangThaiHoatDong: { type: 'string' },
        ngaySinh: { type: 'string' },
        gioiTinh: { type: 'string' },
        diaChi: { type: 'string' },
        soDienThoai: { type: 'string' },
        loaiDocGia: { type: 'string' },
        ngayBatDau: { type: 'string' },
        ngayKetThuc: { type: 'string' },
      },
    },
  })
  data: any[];
}
