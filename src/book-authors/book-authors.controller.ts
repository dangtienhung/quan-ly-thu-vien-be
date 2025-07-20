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
import { BookAuthorsService } from './book-authors.service';
import { CreateBookAuthorDto } from './dto/create-book-author.dto';
import { UpdateBookAuthorDto } from './dto/update-book-author.dto';
import { BookAuthor } from './entities/book-author.entity';

@ApiTags('Book Authors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('book-authors')
export class BookAuthorsController {
  constructor(private readonly bookAuthorsService: BookAuthorsService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Tạo mối quan hệ giữa sách và tác giả (Admin)' })
  @ApiBody({
    examples: {
      example: {
        value: {
          book_id: '123',
          author_id: '456',
        },
      },
    },
    schema: {
      type: 'object',
      properties: {
        book_id: { type: 'string' },
        author_id: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo mối quan hệ thành công.',
    type: BookAuthor,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createBookAuthorDto: CreateBookAuthorDto,
  ): Promise<BookAuthor> {
    return this.bookAuthorsService.create(createBookAuthorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách mối quan hệ sách và tác giả' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách mối quan hệ thành công.',
    type: BookAuthor,
    isArray: true,
  })
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BookAuthor>> {
    return this.bookAuthorsService.findAll(paginationQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin mối quan hệ theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của mối quan hệ' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin mối quan hệ thành công.',
    type: BookAuthor,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy mối quan hệ.' })
  findOne(@Param('id') id: string): Promise<BookAuthor> {
    return this.bookAuthorsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Cập nhật mối quan hệ theo ID (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của mối quan hệ' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật mối quan hệ thành công.',
    type: BookAuthor,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy mối quan hệ.' })
  update(
    @Param('id') id: string,
    @Body() updateBookAuthorDto: UpdateBookAuthorDto,
  ): Promise<BookAuthor> {
    return this.bookAuthorsService.update(id, updateBookAuthorDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Xóa mối quan hệ theo ID (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của mối quan hệ' })
  @ApiResponse({ status: 204, description: 'Xóa mối quan hệ thành công.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy mối quan hệ.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.bookAuthorsService.remove(id);
  }

  @Post('bulk')
  @Roles('admin')
  @ApiOperation({
    summary: 'Tạo nhiều mối quan hệ giữa sách và tác giả (Admin)',
  })
  @ApiBody({
    type: [CreateBookAuthorDto],
    description: 'Danh sách các mối quan hệ sách và tác giả cần tạo',
    examples: {
      example: {
        value: [
          {
            book_id: '123',
            author_id: '456',
          },
          {
            book_id: '789',
            author_id: '012',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo nhiều mối quan hệ thành công.',
    type: [BookAuthor],
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @HttpCode(HttpStatus.CREATED)
  createMany(
    @Body() createBookAuthorDtos: CreateBookAuthorDto[],
  ): Promise<BookAuthor[]> {
    return this.bookAuthorsService.createMany(createBookAuthorDtos);
  }
}
