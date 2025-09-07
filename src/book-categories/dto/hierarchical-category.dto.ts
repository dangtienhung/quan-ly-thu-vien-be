import { ApiProperty } from '@nestjs/swagger';

export class HierarchicalCategoryDto {
  @ApiProperty({ description: 'ID duy nhất của thể loại chi tiết (UUID)' })
  id: string;

  @ApiProperty({
    description: 'Tên thể loại chi tiết',
    example: 'Sách Toán',
  })
  name: string;

  @ApiProperty({
    description: 'ID danh mục cha',
    required: false,
    nullable: true,
  })
  parent_id?: string | null;

  @ApiProperty({
    description: 'Tên danh mục cha',
    required: false,
    nullable: true,
    example: 'Sách Giáo Khoa',
  })
  parent_name?: string | null;

  @ApiProperty({
    description: 'Danh sách các thể loại con',
    type: [HierarchicalCategoryDto],
    required: false,
  })
  children?: HierarchicalCategoryDto[];

  @ApiProperty({ description: 'Ngày tạo' })
  createdAt: Date;

  @ApiProperty({ description: 'Ngày cập nhật cuối' })
  updatedAt: Date;
}

export class HierarchicalCategoriesResponseDto {
  @ApiProperty({
    description: 'Danh sách các thể loại theo cấu trúc phân cấp',
    type: [HierarchicalCategoryDto],
  })
  data: HierarchicalCategoryDto[];

  @ApiProperty({
    description: 'Thông tin meta',
    example: {
      total: 5,
      message: 'Danh sách thể loại theo cấu trúc phân cấp',
    },
  })
  meta: {
    total: number;
    message: string;
  };
}
