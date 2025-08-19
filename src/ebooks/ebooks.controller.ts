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
} from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateEBookDto } from './dto/create-ebook.dto';
import { UpdateEBookDto } from './dto/update-ebook.dto';
import { EbooksService } from './ebooks.service';
import { EBook } from './entities/ebook.entity';

@ApiTags('Ebooks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ebooks')
export class EbooksController {
  constructor(private readonly ebooksService: EbooksService) {}

  // EBook Endpoints

  @Post()
  // @Roles('admin')
  @ApiOperation({ summary: 'Tạo ebook mới (Admin)' })
  @ApiResponse({
    status: 201,
    description: 'Tạo ebook thành công.',
    type: EBook,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @HttpCode(HttpStatus.CREATED)
  createEBook(@Body() createEBookDto: CreateEBookDto): Promise<EBook> {
    return this.ebooksService.createEBook(createEBookDto);
  }

  @Post('book/:bookId/many')
  // @Roles('admin')
  @ApiOperation({ summary: 'Tạo nhiều ebook cùng lúc cho sách (Admin)' })
  @ApiParam({ name: 'bookId', description: 'UUID của sách' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ebooks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              file_path: { type: 'string', description: 'Đường dẫn file' },
              file_size: { type: 'number', description: 'Kích thước file' },
              file_format: { type: 'string', description: 'Định dạng file' },
            },
          },
          description: 'Danh sách ebook cần tạo',
        },
      },
    },
    description: 'Thông tin tạo nhiều ebook',
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo nhiều ebook thành công.',
    type: EBook,
    isArray: true,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @HttpCode(HttpStatus.CREATED)
  createManyEBooks(
    @Param('bookId') bookId: string,
    @Body() body: { ebooks: Partial<CreateEBookDto>[] },
  ): Promise<EBook[]> {
    return this.ebooksService.createMany(bookId, body.ebooks);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả ebook với phân trang' })
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
    description: 'Lấy danh sách ebook thành công.',
  })
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<EBook>> {
    return this.ebooksService.findAll(paginationQuery);
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm ebook' })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Từ khóa tìm kiếm (tên sách, ISBN, định dạng file)',
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
    description: 'Tìm kiếm ebook thành công.',
  })
  search(
    @Query('q') query: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<EBook>> {
    return this.ebooksService.search(query, paginationQuery);
  }

  @Get('format/:format')
  @ApiOperation({ summary: 'Lấy danh sách ebook theo định dạng file' })
  @ApiParam({ name: 'format', description: 'Định dạng file (PDF, EPUB, etc.)' })
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
    description: 'Lấy danh sách ebook theo định dạng thành công.',
  })
  findByFormat(
    @Param('format') format: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<EBook>> {
    return this.ebooksService.findByFormat(format, paginationQuery);
  }

  @Get('size-range')
  @ApiOperation({ summary: 'Lấy danh sách ebook theo kích thước file' })
  @ApiQuery({
    name: 'minSize',
    required: true,
    type: Number,
    description: 'Kích thước tối thiểu (bytes)',
  })
  @ApiQuery({
    name: 'maxSize',
    required: true,
    type: Number,
    description: 'Kích thước tối đa (bytes)',
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
    description: 'Lấy danh sách ebook theo kích thước thành công.',
  })
  findBySizeRange(
    @Query('minSize') minSize: number,
    @Query('maxSize') maxSize: number,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<EBook>> {
    return this.ebooksService.findBySizeRange(
      minSize,
      maxSize,
      paginationQuery,
    );
  }

  @Get('popular')
  @ApiOperation({ summary: 'Lấy danh sách ebook phổ biến' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số lượng ebook (mặc định: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách ebook phổ biến thành công.',
    type: EBook,
    isArray: true,
  })
  findPopular(@Query('limit') limit?: number): Promise<EBook[]> {
    return this.ebooksService.findPopular(limit);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Lấy danh sách ebook mới nhất' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số lượng ebook (mặc định: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách ebook mới nhất thành công.',
    type: EBook,
    isArray: true,
  })
  findRecent(@Query('limit') limit?: number): Promise<EBook[]> {
    return this.ebooksService.findRecent(limit);
  }

  @Get('downloads/:minDownloads')
  @ApiOperation({ summary: 'Lấy danh sách ebook theo số lượt tải' })
  @ApiParam({ name: 'minDownloads', description: 'Số lượt tải tối thiểu' })
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
    description: 'Lấy danh sách ebook theo lượt tải thành công.',
  })
  findByDownloadCount(
    @Param('minDownloads') minDownloads: number,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<EBook>> {
    return this.ebooksService.findByDownloadCount(
      minDownloads,
      paginationQuery,
    );
  }

  @Get('author/:authorId')
  @ApiOperation({ summary: 'Lấy danh sách ebook theo tác giả' })
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
    description: 'Lấy danh sách ebook theo tác giả thành công.',
  })
  findByAuthor(
    @Param('authorId') authorId: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<EBook>> {
    return this.ebooksService.findByAuthor(authorId, paginationQuery);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Lấy danh sách ebook theo thể loại' })
  @ApiParam({ name: 'categoryId', description: 'UUID của thể loại' })
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
    description: 'Lấy danh sách ebook theo thể loại thành công.',
  })
  findByCategory(
    @Param('categoryId') categoryId: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<EBook>> {
    return this.ebooksService.findByCategory(categoryId, paginationQuery);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Lấy thống kê ebook' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê ebook thành công.',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: 'Tổng số ebook' },
        totalDownloads: { type: 'number', description: 'Tổng số lượt tải' },
        totalSize: { type: 'number', description: 'Tổng kích thước (bytes)' },
        byFormat: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              format: { type: 'string', description: 'Định dạng' },
              count: { type: 'number', description: 'Số lượng' },
              totalSize: { type: 'number', description: 'Tổng kích thước' },
            },
          },
          description: 'Thống kê theo định dạng',
        },
        popularEbooks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'ID ebook' },
              title: { type: 'string', description: 'Tên sách' },
              downloads: { type: 'number', description: 'Số lượt tải' },
            },
          },
          description: 'Ebook phổ biến',
        },
        recentUploads: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'ID ebook' },
              title: { type: 'string', description: 'Tên sách' },
              uploadDate: { type: 'string', description: 'Ngày tải lên' },
            },
          },
          description: 'Ebook mới nhất',
        },
      },
    },
  })
  getStats(): Promise<{
    total: number;
    totalDownloads: number;
    totalSize: number;
    byFormat: { format: string; count: number; totalSize: number }[];
    popularEbooks: { id: string; title: string; downloads: number }[];
    recentUploads: { id: string; title: string; uploadDate: string }[];
  }> {
    return this.ebooksService.getStats();
  }

  @Get('book/:bookId')
  @ApiOperation({ summary: 'Lấy danh sách ebook của sách' })
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
    description: 'Lấy danh sách ebook của sách thành công.',
  })
  findEBooks(
    @Param('bookId') bookId: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<EBook>> {
    return this.ebooksService.findEBooks(bookId, paginationQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin ebook theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của ebook' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin ebook thành công.',
    type: EBook,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy ebook.' })
  findOne(@Param('id') id: string): Promise<EBook> {
    return this.ebooksService.findOne(id);
  }

  @Patch(':id')
  // @Roles('admin')
  @ApiOperation({ summary: 'Cập nhật ebook (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của ebook' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật ebook thành công.',
    type: EBook,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy ebook.' })
  updateEBook(
    @Param('id') id: string,
    @Body() updateEBookDto: UpdateEBookDto,
  ): Promise<EBook> {
    return this.ebooksService.updateEBook(id, updateEBookDto);
  }

  @Patch(':id/file-info')
  // @Roles('admin')
  @ApiOperation({ summary: 'Cập nhật thông tin file ebook (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của ebook' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Đường dẫn file mới' },
        file_size: { type: 'number', description: 'Kích thước file mới' },
        file_format: { type: 'string', description: 'Định dạng file mới' },
      },
    },
    description: 'Thông tin file cần cập nhật',
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thông tin file thành công.',
    type: EBook,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy ebook.' })
  updateFileInfo(
    @Param('id') id: string,
    @Body()
    fileInfo: { file_path?: string; file_size?: number; file_format?: string },
  ): Promise<EBook> {
    return this.ebooksService.updateFileInfo(id, fileInfo);
  }

  @Post(':id/increment-downloads')
  @ApiOperation({ summary: 'Tăng số lượt tải xuống của ebook' })
  @ApiParam({ name: 'id', description: 'UUID của ebook' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật số lượt tải thành công.',
    type: EBook,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy ebook.' })
  incrementEBookDownloadCount(@Param('id') id: string): Promise<EBook> {
    return this.ebooksService.incrementEBookDownloadCount(id);
  }

  @Delete(':id')
  // @Roles('admin')
  @ApiOperation({ summary: 'Xóa ebook (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của ebook' })
  @ApiResponse({ status: 204, description: 'Xóa ebook thành công.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy ebook.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  removeEBook(@Param('id') id: string): Promise<void> {
    return this.ebooksService.removeEBook(id);
  }

  @Delete('batch')
  // @Roles('admin')
  @ApiOperation({ summary: 'Xóa nhiều ebook cùng lúc (Admin)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Danh sách ID ebook cần xóa',
        },
      },
    },
    description: 'Danh sách ID ebook cần xóa',
  })
  @ApiResponse({ status: 204, description: 'Xóa nhiều ebook thành công.' })
  @ApiResponse({ status: 400, description: 'Một số ebook không tồn tại.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  removeManyEBooks(@Body() body: { ids: string[] }): Promise<void> {
    return this.ebooksService.removeMany(body.ids);
  }
}
