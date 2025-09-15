import { ApiProperty } from '@nestjs/swagger';

export class HierarchicalCategoryStatisticsDto {
  @ApiProperty({
    description: 'ID của thể loại',
    example: '548dc173-3aa6-4ef6-8d71-72a253f75668',
  })
  categoryId: string;

  @ApiProperty({
    description: 'Tên thể loại',
    example: 'Tiểu thuyết',
  })
  categoryName: string;

  @ApiProperty({
    description: 'Slug của thể loại',
    example: 'tieu-thuyet',
  })
  slug: string;

  @ApiProperty({
    description: 'Mô tả thể loại',
    example: 'Các tác phẩm văn học dài',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'ID của thể loại cha (nếu có)',
    example: '548dc173-3aa6-4ef6-8d71-72a253f75668',
    required: false,
  })
  parentId?: string;

  @ApiProperty({
    description: 'Tên thể loại cha (nếu có)',
    example: 'Văn học',
    required: false,
  })
  parentName?: string;

  @ApiProperty({
    description: 'Số lượng sách trong thể loại này (bao gồm children)',
    example: 45,
  })
  bookCount: number;

  @ApiProperty({
    description: 'Số lượng sách vật lý (bao gồm children)',
    example: 30,
  })
  physicalBookCount: number;

  @ApiProperty({
    description: 'Số lượng sách điện tử (bao gồm children)',
    example: 15,
  })
  ebookCount: number;

  @ApiProperty({
    description: 'Phần trăm so với tổng số sách',
    example: 28.8,
  })
  percentage: number;

  @ApiProperty({
    description: 'Có thể mở rộng hay không (có thể loại con)',
    example: true,
  })
  expandable: boolean;

  @ApiProperty({
    description: 'Có đang mở rộng hay không',
    example: false,
  })
  expanded: boolean;

  @ApiProperty({
    description: 'Danh sách thể loại con',
    type: [HierarchicalCategoryStatisticsDto],
    required: false,
  })
  children?: HierarchicalCategoryStatisticsDto[];

  @ApiProperty({
    description: 'Cấp độ trong cây (0 = root, 1 = level 1, ...)',
    example: 0,
  })
  level: number;

  @ApiProperty({
    description: 'Có phải là thể loại chính không',
    example: true,
  })
  isMainCategory: boolean;

  @ApiProperty({
    description:
      'Số lượng sách trực tiếp trong thể loại này (không bao gồm children)',
    example: 10,
  })
  directBookCount: number;

  @ApiProperty({
    description: 'Số lượng sách vật lý trực tiếp (không bao gồm children)',
    example: 8,
  })
  directPhysicalBookCount: number;

  @ApiProperty({
    description: 'Số lượng sách điện tử trực tiếp (không bao gồm children)',
    example: 2,
  })
  directEbookCount: number;
}

export class HierarchicalBookStatisticsResponseDto {
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
    description: 'Thống kê theo cấu trúc phân cấp thể loại',
    type: [HierarchicalCategoryStatisticsDto],
  })
  byHierarchicalCategory: HierarchicalCategoryStatisticsDto[];

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

  @ApiProperty({
    description: 'Số lượng thể loại chính',
    example: 5,
  })
  totalMainCategories: number;

  @ApiProperty({
    description: 'Số lượng thể loại con',
    example: 15,
  })
  totalSubCategories: number;
}
