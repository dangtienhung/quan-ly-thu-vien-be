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
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  PaginatedResponseDto,
  PaginationQueryDto,
} from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  // @Roles('admin')
  @ApiOperation({ summary: 'Tạo mới thể loại (Admin)' })
  @ApiResponse({
    status: 201,
    description: 'Tạo thể loại thành công.',
    type: Category,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách thể loại có phân trang' })
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
    description: 'Lấy danh sách thể loại thành công.',
    type: Category,
    isArray: true,
  })
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Category>> {
    return this.categoriesService.findAll(paginationQuery);
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm thể loại' })
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
    description: 'Tìm kiếm thể loại thành công.',
    type: Category,
    isArray: true,
  })
  search(
    @Query('q') query: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Category>> {
    return this.categoriesService.search(query, paginationQuery);
  }

  @Get('main')
  @ApiOperation({ summary: 'Lấy danh sách thể loại chính (không có parent)' })
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
    description: 'Lấy danh sách thể loại chính thành công.',
    type: Category,
    isArray: true,
  })
  findMainCategories(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Category>> {
    return this.categoriesService.findMainCategories(paginationQuery);
  }

  @Get(':id/subcategories')
  @ApiOperation({ summary: 'Lấy danh sách thể loại con của một thể loại' })
  @ApiParam({ name: 'id', description: 'UUID của thể loại cha' })
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
    description: 'Lấy danh sách thể loại con thành công.',
    type: Category,
    isArray: true,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thể loại cha.' })
  findSubCategories(
    @Param('id') id: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Category>> {
    return this.categoriesService.findSubCategories(id, paginationQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin thể loại theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của thể loại' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin thể loại thành công.',
    type: Category,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thể loại.' })
  findOne(@Param('id') id: string): Promise<Category> {
    return this.categoriesService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Lấy thông tin thể loại theo slug' })
  @ApiParam({ name: 'slug', description: 'Slug của thể loại' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin thể loại thành công.',
    type: Category,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thể loại.' })
  findBySlug(@Param('slug') slug: string): Promise<Category> {
    return this.categoriesService.findBySlug(slug);
  }

  @Patch(':id')
  // @Roles('admin')
  @ApiOperation({ summary: 'Cập nhật thể loại theo ID (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của thể loại' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thể loại thành công.',
    type: Category,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thể loại.' })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Patch('slug/:slug')
  // @Roles('admin')
  @ApiOperation({ summary: 'Cập nhật thể loại theo slug (Admin)' })
  @ApiParam({ name: 'slug', description: 'Slug của thể loại' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thể loại thành công.',
    type: Category,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thể loại.' })
  updateBySlug(
    @Param('slug') slug: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.updateBySlug(slug, updateCategoryDto);
  }

  @Delete(':id')
  // @Roles('admin')
  @ApiOperation({ summary: 'Xóa thể loại theo ID (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của thể loại' })
  @ApiResponse({ status: 204, description: 'Xóa thể loại thành công.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thể loại.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.categoriesService.remove(id);
  }

  @Delete('slug/:slug')
  // @Roles('admin')
  @ApiOperation({ summary: 'Xóa thể loại theo slug (Admin)' })
  @ApiParam({ name: 'slug', description: 'Slug của thể loại' })
  @ApiResponse({ status: 204, description: 'Xóa thể loại thành công.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thể loại.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  removeBySlug(@Param('slug') slug: string): Promise<void> {
    return this.categoriesService.removeBySlug(slug);
  }
}
