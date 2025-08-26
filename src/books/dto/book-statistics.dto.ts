import { ApiProperty } from '@nestjs/swagger';

export class MainCategoryStatisticsDto {
  @ApiProperty({
    description: 'ID của thể loại chính',
    example: '548dc173-3aa6-4ef6-8d71-72a253f75668',
  })
  mainCategoryId: string;

  @ApiProperty({
    description: 'Tên thể loại chính',
    example: 'Tiểu thuyết',
  })
  mainCategoryName: string;

  @ApiProperty({
    description: 'Số lượng sách trong thể loại chính',
    example: 45,
  })
  bookCount: number;

  @ApiProperty({
    description: 'Số lượng sách vật lý',
    example: 30,
  })
  physicalBookCount: number;

  @ApiProperty({
    description: 'Số lượng sách điện tử',
    example: 15,
  })
  ebookCount: number;

  @ApiProperty({
    description: 'Phần trăm so với tổng số sách',
    example: 28.8,
  })
  percentage: number;
}

export class BookStatisticsResponseDto {
  @ApiProperty({
    description: 'Tổng số sách',
    example: 156,
  })
  totalBooks: number;

  @ApiProperty({
    description: 'Tổng số sách vật lý',
    example: 120,
  })
  totalPhysicalBooks: number;

  @ApiProperty({
    description: 'Tổng số sách điện tử',
    example: 36,
  })
  totalEbooks: number;

  @ApiProperty({
    description: 'Thống kê theo thể loại chính',
    type: [MainCategoryStatisticsDto],
  })
  byMainCategory: MainCategoryStatisticsDto[];

  @ApiProperty({
    description: 'Thống kê theo loại sách',
    example: {
      physical: 120,
      ebook: 36,
    },
  })
  byType: {
    physical: number;
    ebook: number;
  };
}
