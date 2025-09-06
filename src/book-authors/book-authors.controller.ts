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
import {
  PaginatedResponseDto,
  PaginationQueryDto,
} from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BookAuthorsService } from './book-authors.service';
import { CreateBookAuthorDto } from './dto/create-book-author.dto';
import { UpdateBookAuthorDto } from './dto/update-book-author.dto';
import { BookAuthor } from './entities/book-author.entity';

@ApiTags('Book Authors - Quản lý mối quan hệ Sách-Tác giả')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('book-authors')
export class BookAuthorsController {
  constructor(private readonly bookAuthorsService: BookAuthorsService) {}

  @Post()
  // @Roles('admin')
  @ApiOperation({ summary: 'Tạo mối quan hệ sách-tác giả mới (Admin)' })
  @ApiBody({
    type: CreateBookAuthorDto,
    description: 'Thông tin mối quan hệ sách-tác giả cần tạo',
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo mối quan hệ sách-tác giả thành công.',
    type: BookAuthor,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createBookAuthorDto: CreateBookAuthorDto,
  ): Promise<BookAuthor> {
    return this.bookAuthorsService.create(createBookAuthorDto);
  }

  @Post('bulk')
  // @Roles('admin')
  @ApiOperation({ summary: 'Tạo nhiều mối quan hệ sách-tác giả (Admin)' })
  @ApiBody({
    type: [CreateBookAuthorDto],
    description: 'Danh sách các mối quan hệ sách-tác giả cần tạo',
    examples: {
      example: {
        value: [
          {
            book_id: '550e8400-e29b-41d4-a716-446655440000',
            author_id: '550e8400-e29b-41d4-a716-446655440001',
          },
          {
            book_id: '550e8400-e29b-41d4-a716-446655440002',
            author_id: '550e8400-e29b-41d4-a716-446655440003',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo nhiều mối quan hệ sách-tác giả thành công.',
    type: [BookAuthor],
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @HttpCode(HttpStatus.CREATED)
  async createMany(
    @Body() createBookAuthorDtos: CreateBookAuthorDto[],
  ): Promise<BookAuthor[]> {
    return this.bookAuthorsService.createMany(createBookAuthorDtos);
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách mối quan hệ sách-tác giả với phân trang',
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
    description: 'Lấy danh sách mối quan hệ sách-tác giả thành công.',
  })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BookAuthor>> {
    return this.bookAuthorsService.findAll(paginationQuery);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Tìm kiếm mối quan hệ sách-tác giả theo tên sách hoặc tên tác giả',
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
    description: 'Tìm kiếm mối quan hệ sách-tác giả thành công.',
  })
  async search(
    @Query('q') query: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BookAuthor>> {
    return this.bookAuthorsService.search(query, paginationQuery);
  }

  @Get('book/:bookId')
  @ApiOperation({ summary: 'Lấy danh sách tác giả của một sách' })
  @ApiParam({ name: 'bookId', description: 'UUID của sách' })
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
    description: 'Lấy danh sách tác giả của sách thành công.',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sách.' })
  async findByBookId(
    @Param('bookId') bookId: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BookAuthor>> {
    return this.bookAuthorsService.findByBookId(bookId, paginationQuery);
  }

  @Get('author/:authorId')
  @ApiOperation({ summary: 'Lấy danh sách sách của một tác giả' })
  @ApiParam({ name: 'authorId', description: 'UUID của tác giả' })
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
    description: 'Lấy danh sách sách của tác giả thành công.',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tác giả.' })
  async findByAuthorId(
    @Param('authorId') authorId: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BookAuthor>> {
    return this.bookAuthorsService.findByAuthorId(authorId, paginationQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin mối quan hệ sách-tác giả theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của mối quan hệ sách-tác giả' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin mối quan hệ sách-tác giả thành công.',
    type: BookAuthor,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy mối quan hệ sách-tác giả.',
  })
  async findOne(@Param('id') id: string): Promise<BookAuthor> {
    return this.bookAuthorsService.findOne(id);
  }

  @Patch(':id')
  // @Roles('admin')
  @ApiOperation({
    summary: 'Cập nhật mối quan hệ sách-tác giả theo ID (Admin)',
  })
  @ApiParam({ name: 'id', description: 'UUID của mối quan hệ sách-tác giả' })
  @ApiBody({ type: UpdateBookAuthorDto, description: 'Thông tin cập nhật' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật mối quan hệ sách-tác giả thành công.',
    type: BookAuthor,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy mối quan hệ sách-tác giả.',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async update(
    @Param('id') id: string,
    @Body() updateBookAuthorDto: UpdateBookAuthorDto,
  ): Promise<BookAuthor> {
    return this.bookAuthorsService.update(id, updateBookAuthorDto);
  }

  @Delete(':id')
  // @Roles('admin')
  @ApiOperation({ summary: 'Xóa mối quan hệ sách-tác giả theo ID (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của mối quan hệ sách-tác giả' })
  @ApiResponse({
    status: 204,
    description: 'Xóa mối quan hệ sách-tác giả thành công.',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy mối quan hệ sách-tác giả.',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.bookAuthorsService.remove(id);
  }

  @Delete('book/:bookId')
  // @Roles('admin')
  @ApiOperation({
    summary: 'Xóa tất cả mối quan hệ sách-tác giả của một sách (Admin)',
  })
  @ApiParam({ name: 'bookId', description: 'UUID của sách' })
  @ApiResponse({
    status: 204,
    description: 'Xóa tất cả mối quan hệ sách-tác giả của sách thành công.',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeByBookId(@Param('bookId') bookId: string): Promise<void> {
    return this.bookAuthorsService.removeByBookId(bookId);
  }

  @Delete('author/:authorId')
  // @Roles('admin')
  @ApiOperation({
    summary: 'Xóa tất cả mối quan hệ sách-tác giả của một tác giả (Admin)',
  })
  @ApiParam({ name: 'authorId', description: 'UUID của tác giả' })
  @ApiResponse({
    status: 204,
    description: 'Xóa tất cả mối quan hệ sách-tác giả của tác giả thành công.',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeByAuthorId(@Param('authorId') authorId: string): Promise<void> {
    return this.bookAuthorsService.removeByAuthorId(authorId);
  }

  @Get('debug/check-data')
  @ApiOperation({ summary: 'Kiểm tra dữ liệu sách và tác giả hiện có (Debug)' })
  @ApiResponse({ status: 200, description: 'Thông tin dữ liệu hiện có.' })
  async checkData() {
    // Lấy danh sách sách
    const books = await this.bookAuthorsService['booksService'].findAll({
      page: 1,
      limit: 10,
    });

    // Lấy danh sách tác giả
    const authors = await this.bookAuthorsService['authorsService'].findAll(
      '', // Empty query for getting all authors
      {
        page: 1,
        limit: 10,
      },
    );

    return {
      books: books.data.map((book) => ({ id: book.id, title: book.title })),
      authors: authors.data.map((author) => ({
        id: author.id,
        author_name: author.author_name,
      })),
      totalBooks: books.meta.totalItems,
      totalAuthors: authors.meta.totalItems,
    };
  }
}
