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
import { Roles } from '../common/decorators/roles.decorator';
import {
  PaginatedResponseDto,
  PaginationQueryDto,
} from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity';

@ApiTags('Books')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  // Book Endpoints

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Tạo mới sách (Admin)' })
  @ApiResponse({
    status: 201,
    description: 'Tạo sách thành công.',
    type: Book,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createBookDto: CreateBookDto): Promise<Book> {
    return this.booksService.create(createBookDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách sách có phân trang' })
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
    description: 'Lấy danh sách sách thành công.',
    type: Book,
    isArray: true,
  })
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Book>> {
    return this.booksService.findAll(paginationQuery);
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm sách' })
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
    description: 'Tìm kiếm sách thành công.',
    type: Book,
    isArray: true,
  })
  search(
    @Query('q') query: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Book>> {
    return this.booksService.search(query, paginationQuery);
  }

  @Get('isbn/:isbn')
  @ApiOperation({ summary: 'Lấy thông tin sách theo ISBN' })
  @ApiParam({ name: 'isbn', description: 'ISBN của sách' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin sách thành công.',
    type: Book,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sách.' })
  findByIsbn(@Param('isbn') isbn: string): Promise<Book> {
    return this.booksService.findByIsbn(isbn);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin sách theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của sách' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin sách thành công.',
    type: Book,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sách.' })
  findOne(@Param('id') id: string): Promise<Book> {
    return this.booksService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Lấy thông tin sách theo slug' })
  @ApiParam({ name: 'slug', description: 'Slug của sách' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin sách thành công.',
    type: Book,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sách.' })
  findBySlug(@Param('slug') slug: string): Promise<Book> {
    return this.booksService.findBySlug(slug);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Cập nhật sách theo ID (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của sách' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật sách thành công.',
    type: Book,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sách.' })
  update(
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<Book> {
    return this.booksService.update(id, updateBookDto);
  }

  @Patch('slug/:slug')
  @Roles('admin')
  @ApiOperation({ summary: 'Cập nhật sách theo slug (Admin)' })
  @ApiParam({ name: 'slug', description: 'Slug của sách' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật sách thành công.',
    type: Book,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sách.' })
  updateBySlug(
    @Param('slug') slug: string,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<Book> {
    return this.booksService.updateBySlug(slug, updateBookDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Xóa sách theo ID (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của sách' })
  @ApiResponse({ status: 204, description: 'Xóa sách thành công.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sách.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.booksService.remove(id);
  }

  @Delete('slug/:slug')
  @Roles('admin')
  @ApiOperation({ summary: 'Xóa sách theo slug (Admin)' })
  @ApiParam({ name: 'slug', description: 'Slug của sách' })
  @ApiResponse({ status: 204, description: 'Xóa sách thành công.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sách.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  removeBySlug(@Param('slug') slug: string): Promise<void> {
    return this.booksService.removeBySlug(slug);
  }
}
