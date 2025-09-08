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
import { BooksService } from './books.service';
import { BookStatisticsResponseDto } from './dto/book-statistics.dto';
import { BookWithAuthorsDto } from './dto/book-with-authors.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { FindAllBooksDto } from './dto/find-all-books.dto';
import { UpdateBookViewDto } from './dto/update-book-view.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity';

// Interface cho Book với authors
interface BookWithAuthors extends Omit<Book, 'authors'> {
  authors: Array<{
    id: string;
    author_name: string;
    slug: string;
    bio?: string;
    nationality?: string;
  }>;
}

@ApiTags('Books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  // Book Endpoints

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  @ApiBearerAuth()
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
  @ApiOperation({ summary: 'Lấy danh sách sách có phân trang và tìm kiếm' })
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
  @ApiQuery({
    name: 'q',
    required: false,
    type: String,
    description: 'Từ khóa tìm kiếm theo title và description',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['physical', 'ebook'],
    description: 'Lọc theo loại sách',
  })
  @ApiQuery({
    name: 'main_category_id',
    required: false,
    type: String,
    description: 'Lọc theo ID thể loại chính (BookCategories)',
  })
  @ApiQuery({
    name: 'category_id',
    required: false,
    type: String,
    description: 'Lọc theo ID thể loại (Categories)',
  })
  @ApiQuery({
    name: 'view',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sắp xếp theo số lượng view (asc: tăng dần, desc: giảm dần)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách sách thành công.',
    type: BookWithAuthorsDto,
    isArray: true,
  })
  findAll(
    @Query() findAllBooksDto: FindAllBooksDto,
  ): Promise<PaginatedResponseDto<BookWithAuthors>> {
    return this.booksService.findAll(findAllBooksDto);
  }

  @Get('latest')
  @ApiOperation({ summary: 'Lấy danh sách sách mới thêm vào' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số lượng sách (mặc định: 20, tối đa: 50)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách sách mới thành công.',
    type: BookWithAuthorsDto,
    isArray: true,
  })
  @ApiResponse({ status: 400, description: 'Limit không hợp lệ.' })
  findLatestBooks(@Query('limit') limit?: number): Promise<BookWithAuthors[]> {
    return this.booksService.findLatestBooks(limit);
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
    type: BookWithAuthorsDto,
    isArray: true,
  })
  search(
    @Query('q') query: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BookWithAuthors>> {
    return this.booksService.search(query, paginationQuery);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Lấy thống kê sách theo thể loại chính' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê sách thành công.',
    type: BookStatisticsResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Lỗi khi truy vấn cơ sở dữ liệu.' })
  getBookStatistics(): Promise<BookStatisticsResponseDto> {
    return this.booksService.getBookStatistics();
  }

  @Get('isbn/:isbn')
  @ApiOperation({ summary: 'Lấy thông tin sách theo ISBN' })
  @ApiParam({ name: 'isbn', description: 'ISBN của sách' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin sách thành công.',
    type: BookWithAuthorsDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sách.' })
  findByIsbn(@Param('isbn') isbn: string): Promise<BookWithAuthors> {
    return this.booksService.findByIsbn(isbn);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin sách theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của sách' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin sách thành công.',
    type: BookWithAuthorsDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sách.' })
  findOne(@Param('id') id: string): Promise<BookWithAuthors> {
    return this.booksService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Lấy thông tin sách theo slug' })
  @ApiParam({ name: 'slug', description: 'Slug của sách' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin sách thành công.',
    type: BookWithAuthorsDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sách.' })
  findBySlug(@Param('slug') slug: string): Promise<BookWithAuthors> {
    return this.booksService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật sách theo ID (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của sách' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật sách thành công.',
    type: BookWithAuthorsDto,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sách.' })
  update(
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<BookWithAuthors> {
    return this.booksService.update(id, updateBookDto);
  }

  @Patch('slug/:slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật sách theo slug (Admin)' })
  @ApiParam({ name: 'slug', description: 'Slug của sách' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật sách thành công.',
    type: BookWithAuthorsDto,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sách.' })
  updateBySlug(
    @Param('slug') slug: string,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<BookWithAuthors> {
    return this.booksService.updateBySlug(slug, updateBookDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  @ApiBearerAuth()
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa sách theo slug (Admin)' })
  @ApiParam({ name: 'slug', description: 'Slug của sách' })
  @ApiResponse({ status: 204, description: 'Xóa sách thành công.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sách.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  removeBySlug(@Param('slug') slug: string): Promise<void> {
    return this.booksService.removeBySlug(slug);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo nhiều sách (Admin)' })
  @ApiBody({
    type: [CreateBookDto],
    description: 'Danh sách sách cần tạo',
    examples: {
      example1: {
        summary: 'Ví dụ tạo nhiều sách',
        value: [
          {
            title: 'Tên sách 1',
            isbn: '1234567890',
            publish_year: 2024,
            edition: '1st',
            description: 'Mô tả sách 1',
            cover_image: 'https://example.com/image1.jpg',
            language: 'Tiếng Việt',
            page_count: 300,
            book_type: 'physical',
            physical_type: 'borrowable',
            publisher_id: '550e8400-e29b-41d4-a716-446655440000',
            category_id: '550e8400-e29b-41d4-a716-446655440001',
          },
          {
            title: 'Tên sách 2',
            isbn: '0987654321',
            publish_year: 2024,
            edition: '1st',
            description: 'Mô tả sách 2',
            cover_image: 'https://example.com/image2.jpg',
            language: 'Tiếng Việt',
            page_count: 250,
            book_type: 'physical',
            physical_type: 'borrowable',
            publisher_id: '550e8400-e29b-41d4-a716-446655440002',
            category_id: '550e8400-e29b-41d4-a716-446655440003',
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @HttpCode(HttpStatus.CREATED)
  createMany(@Body() createBookDtos: CreateBookDto[]): Promise<Book[]> {
    return this.booksService.createMany(createBookDtos);
  }

  // Cập nhật số lượt xem sách theo ID
  @Patch(':id/view')
  @ApiOperation({ summary: 'Cập nhật số lượt xem sách theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của sách' })
  @ApiBody({
    type: UpdateBookViewDto,
    description: 'Thông tin cập nhật số lượt xem',
    examples: {
      increment: {
        summary: 'Tăng số lượt xem lên 1',
        value: {
          type: 'increment',
        },
      },
      set: {
        summary: 'Đặt số lượt xem thành giá trị cụ thể',
        value: {
          type: 'set',
          value: 100,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật số lượt xem thành công.',
    type: Book,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sách.' })
  updateView(
    @Param('id') id: string,
    @Body() updateBookViewDto: UpdateBookViewDto,
  ): Promise<Book> {
    return this.booksService.updateView(id, updateBookViewDto);
  }

  // Cập nhật số lượt xem sách theo slug
  @Patch('slug/:slug/view')
  @ApiOperation({ summary: 'Cập nhật số lượt xem sách theo slug' })
  @ApiParam({ name: 'slug', description: 'Slug của sách' })
  @ApiBody({
    type: UpdateBookViewDto,
    description: 'Thông tin cập nhật số lượt xem',
    examples: {
      increment: {
        summary: 'Tăng số lượt xem lên 1',
        value: {
          type: 'increment',
        },
      },
      set: {
        summary: 'Đặt số lượt xem thành giá trị cụ thể',
        value: {
          type: 'set',
          value: 100,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật số lượt xem thành công.',
    type: Book,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sách.' })
  updateViewBySlug(
    @Param('slug') slug: string,
    @Body() updateBookViewDto: UpdateBookViewDto,
  ): Promise<Book> {
    return this.booksService.updateViewBySlug(slug, updateBookViewDto);
  }
}
