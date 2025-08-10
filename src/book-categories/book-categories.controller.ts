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
import { BookCategoriesService } from './book-categories.service';
import { CreateBookCategoryDto } from './dto/create-book-category.dto';
import { UpdateBookCategoryDto } from './dto/update-book-category.dto';
import { BookCategory } from './entities/book-category.entity';

@ApiTags('Book Categories - Quản lý Thể loại chi tiết')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('book-categories')
export class BookCategoriesController {
  constructor(private readonly bookCategoriesService: BookCategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo thể loại chi tiết mới' })
  @ApiBody({ type: CreateBookCategoryDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo thể loại chi tiết thành công.',
    type: BookCategory,
  })
  @ApiResponse({ status: 409, description: 'Tên thể loại đã tồn tại.' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateBookCategoryDto): Promise<BookCategory> {
    return this.bookCategoriesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách thể loại chi tiết với phân trang' })
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
    description: 'Lấy danh sách thể loại chi tiết thành công.',
  })
  async findAll(
    @Query() pagination: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BookCategory>> {
    return this.bookCategoriesService.findAll(pagination);
  }

  @Get('all')
  @ApiOperation({ summary: 'Lấy tất cả thể loại chi tiết (không phân trang)' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thể loại chi tiết thành công.',
  })
  async findAllWithoutPagination(): Promise<BookCategory[]> {
    return this.bookCategoriesService.findAllWithoutPagination();
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm thể loại chi tiết theo tên' })
  @ApiQuery({ name: 'q', required: true, description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Tìm kiếm thể loại chi tiết thành công.',
  })
  async search(
    @Query('q') query: string,
    @Query() pagination: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BookCategory>> {
    return this.bookCategoriesService.search(query, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin thể loại chi tiết theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của thể loại chi tiết' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin thành công.',
    type: BookCategory,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy thể loại chi tiết.',
  })
  async findOne(@Param('id') id: string): Promise<BookCategory> {
    return this.bookCategoriesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thể loại chi tiết' })
  @ApiParam({ name: 'id', description: 'UUID của thể loại chi tiết' })
  @ApiBody({ type: UpdateBookCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công.',
    type: BookCategory,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy thể loại chi tiết.',
  })
  @ApiResponse({ status: 409, description: 'Tên thể loại đã tồn tại.' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBookCategoryDto,
  ): Promise<BookCategory> {
    return this.bookCategoriesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa thể loại chi tiết' })
  @ApiParam({ name: 'id', description: 'UUID của thể loại chi tiết' })
  @ApiResponse({ status: 204, description: 'Xóa thành công.' })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy thể loại chi tiết.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.bookCategoriesService.remove(id);
  }
}
