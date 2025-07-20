import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import {
  PaginatedResponseDto,
  PaginationQueryDto,
} from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateManyPublishersDto } from './dto/create-many-publishers.dto';
import { CreatePublisherDto } from './dto/create-publisher.dto';
import { UpdatePublisherDto } from './dto/update-publisher.dto';
import { Publisher } from './entities/publisher.entity';
import { PublishersService } from './publishers.service';

@ApiTags('Publishers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('publishers')
export class PublishersController {
  constructor(private readonly publishersService: PublishersService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo nhà xuất bản mới' })
  @ApiBody({
    type: CreatePublisherDto,
    description: 'Thông tin nhà xuất bản cần tạo',
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo nhà xuất bản thành công.',
    type: Publisher,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createPublisherDto: CreatePublisherDto,
  ): Promise<Publisher> {
    return this.publishersService.create(createPublisherDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Tạo nhiều nhà xuất bản cùng lúc' })
  @ApiBody({
    type: CreateManyPublishersDto,
    description: 'Danh sách nhà xuất bản cần tạo',
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo nhà xuất bản thành công.',
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'array',
          items: { $ref: '#/components/schemas/Publisher' },
          description: 'Danh sách nhà xuất bản đã tạo thành công',
        },
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              index: {
                type: 'number',
                description: 'Vị trí trong danh sách đầu vào',
              },
              publisherName: {
                type: 'string',
                description: 'Tên nhà xuất bản lỗi',
              },
              error: { type: 'string', description: 'Mô tả lỗi' },
            },
          },
          description: 'Danh sách lỗi nếu có',
        },
        summary: {
          type: 'object',
          properties: {
            total: {
              type: 'number',
              description: 'Tổng số nhà xuất bản cần tạo',
            },
            success: {
              type: 'number',
              description: 'Số nhà xuất bản tạo thành công',
            },
            failed: {
              type: 'number',
              description: 'Số nhà xuất bản tạo thất bại',
            },
          },
          description: 'Tóm tắt kết quả',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu đầu vào không hợp lệ hoặc có tên trùng lặp.',
  })
  @HttpCode(HttpStatus.CREATED)
  async createMany(
    @Body() createManyPublishersDto: CreateManyPublishersDto,
  ): Promise<{
    success: Publisher[];
    errors: Array<{
      index: number;
      publisherName: string;
      error: string;
    }>;
    summary: {
      total: number;
      success: number;
      failed: number;
    };
  }> {
    return this.publishersService.createMany(createManyPublishersDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách nhà xuất bản với phân trang' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Số trang (mặc định: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số lượng mỗi trang (mặc định: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách nhà xuất bản thành công.',
  })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Publisher>> {
    return this.publishersService.findAll(paginationQuery);
  }

  @Get('search')
  @ApiOperation({
    summary:
      'Tìm kiếm nhà xuất bản theo tên, địa chỉ, email, điện thoại hoặc quốc gia',
  })
  @ApiQuery({ name: 'q', required: true, description: 'Từ khóa tìm kiếm' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Số trang (mặc định: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số lượng mỗi trang (mặc định: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Tìm kiếm nhà xuất bản thành công.',
  })
  async search(
    @Query('q') query: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Publisher>> {
    return this.publishersService.search(query, paginationQuery);
  }

  @Get('status/:isActive')
  @ApiOperation({
    summary: 'Lấy danh sách nhà xuất bản theo trạng thái hoạt động',
  })
  @ApiParam({
    name: 'isActive',
    description: 'Trạng thái hoạt động (true/false)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Số trang (mặc định: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số lượng mỗi trang (mặc định: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách nhà xuất bản theo trạng thái thành công.',
  })
  async findByStatus(
    @Param('isActive') isActive: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Publisher>> {
    const status = isActive === 'true';
    return this.publishersService.findByStatus(status, paginationQuery);
  }

  @Get('country/:country')
  @ApiOperation({ summary: 'Lấy danh sách nhà xuất bản theo quốc gia' })
  @ApiParam({ name: 'country', description: 'Tên quốc gia' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Số trang (mặc định: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số lượng mỗi trang (mặc định: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách nhà xuất bản theo quốc gia thành công.',
  })
  async findByCountry(
    @Param('country') country: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Publisher>> {
    return this.publishersService.findByCountry(country, paginationQuery);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Lấy thống kê nhà xuất bản' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê nhà xuất bản thành công.',
  })
  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byCountry: { country: string; count: number }[];
  }> {
    return this.publishersService.getStats();
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Lấy thông tin nhà xuất bản theo slug' })
  @ApiParam({ name: 'slug', description: 'Slug của nhà xuất bản' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin nhà xuất bản thành công.',
    type: Publisher,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhà xuất bản.' })
  async findBySlug(@Param('slug') slug: string): Promise<Publisher> {
    return this.publishersService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin nhà xuất bản theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của nhà xuất bản' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin nhà xuất bản thành công.',
    type: Publisher,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhà xuất bản.' })
  async findOne(@Param('id') id: string): Promise<Publisher> {
    return this.publishersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật nhà xuất bản theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của nhà xuất bản' })
  @ApiBody({ type: UpdatePublisherDto, description: 'Thông tin cập nhật' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật nhà xuất bản thành công.',
    type: Publisher,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhà xuất bản.' })
  async update(
    @Param('id') id: string,
    @Body() updatePublisherDto: UpdatePublisherDto,
  ): Promise<Publisher> {
    return this.publishersService.update(id, updatePublisherDto);
  }

  @Patch('slug/:slug')
  @ApiOperation({ summary: 'Cập nhật nhà xuất bản theo slug' })
  @ApiParam({ name: 'slug', description: 'Slug của nhà xuất bản' })
  @ApiBody({ type: UpdatePublisherDto, description: 'Thông tin cập nhật' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật nhà xuất bản thành công.',
    type: Publisher,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhà xuất bản.' })
  async updateBySlug(
    @Param('slug') slug: string,
    @Body() updatePublisherDto: UpdatePublisherDto,
  ): Promise<Publisher> {
    return this.publishersService.updateBySlug(slug, updatePublisherDto);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Chuyển đổi trạng thái hoạt động của nhà xuất bản' })
  @ApiParam({ name: 'id', description: 'UUID của nhà xuất bản' })
  @ApiResponse({
    status: 200,
    description: 'Chuyển đổi trạng thái thành công.',
    type: Publisher,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhà xuất bản.' })
  async toggleStatus(@Param('id') id: string): Promise<Publisher> {
    return this.publishersService.toggleStatus(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa nhà xuất bản theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của nhà xuất bản' })
  @ApiResponse({ status: 204, description: 'Xóa nhà xuất bản thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhà xuất bản.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.publishersService.remove(id);
  }

  @Delete('slug/:slug')
  @ApiOperation({ summary: 'Xóa nhà xuất bản theo slug' })
  @ApiParam({ name: 'slug', description: 'Slug của nhà xuất bản' })
  @ApiResponse({ status: 204, description: 'Xóa nhà xuất bản thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nhà xuất bản.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeBySlug(@Param('slug') slug: string): Promise<void> {
    return this.publishersService.removeBySlug(slug);
  }
}
