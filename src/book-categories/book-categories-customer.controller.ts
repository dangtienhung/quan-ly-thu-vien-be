import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';

import { BookCategoriesService } from './book-categories.service';
import { HierarchicalCategoriesResponseDto } from './dto/hierarchical-category.dto';

@ApiTags('Book Categories - Customer')
@Controller('customer/book-categories')
export class BookCategoriesCustomerController {
  constructor(private readonly bookCategoriesService: BookCategoriesService) {}

  @Get('hierarchical')
  @ApiOperation({
    summary: 'Lấy danh sách thể loại theo cấu trúc phân cấp (public)',
    description: `
      Trả về danh sách thể loại được tổ chức theo cấu trúc phân cấp:
      - Các thể loại gốc (parent) sẽ chứa danh sách các thể loại con (children)
      - Các thể loại con sẽ nằm trong thuộc tính 'children' của thể loại cha
      - Được sắp xếp theo tên alphabetically
      - Endpoint này không yêu cầu authentication
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thể loại theo cấu trúc phân cấp thành công.',
    type: HierarchicalCategoriesResponseDto,
    schema: {
      example: {
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Sách Giáo Khoa',
            parent_id: null,
            parent_name: null,
            children: [
              {
                id: '550e8400-e29b-41d4-a716-446655440001',
                name: 'Sách Toán',
                parent_id: '550e8400-e29b-41d4-a716-446655440000',
                parent_name: 'Sách Giáo Khoa',
                children: [],
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
              },
              {
                id: '550e8400-e29b-41d4-a716-446655440002',
                name: 'Sách Văn',
                parent_id: '550e8400-e29b-41d4-a716-446655440000',
                parent_name: 'Sách Giáo Khoa',
                children: [],
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
              },
            ],
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
        meta: {
          total: 3,
          message: 'Danh sách thể loại theo cấu trúc phân cấp',
        },
      },
    },
  })
  async getHierarchicalCategories(): Promise<any> {
    return this.bookCategoriesService.getHierarchicalCategories();
  }
}
