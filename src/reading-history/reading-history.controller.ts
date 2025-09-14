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
} from '@nestjs/common';
import {
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
import { CreateReadingHistoryDto } from './dto/create-reading-history.dto';
import { UpdateReadingHistoryDto } from './dto/update-reading-history.dto';
import { UpdateReadingProgressDto } from './dto/update-reading-progress.dto';
import { ReadingHistory } from './entities/reading-history.entity';
import { ReadingSession } from './entities/reading-session.entity';
import { ReadingHistoryService } from './reading-history.service';

@ApiTags('Reading History - Quản lý Lịch sử Đọc Ebook')
@Controller('reading-history')
export class ReadingHistoryController {
  constructor(private readonly readingHistoryService: ReadingHistoryService) {}

  @Post()
  @ApiOperation({
    summary: 'Tạo lịch sử đọc mới (hoặc cập nhật nếu đã tồn tại)',
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo thành công.',
    type: ReadingHistory,
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công.',
    type: ReadingHistory,
  })
  @HttpCode(HttpStatus.OK)
  async create(
    @Body() createReadingHistoryDto: CreateReadingHistoryDto,
  ): Promise<ReadingHistory> {
    return this.readingHistoryService.create(createReadingHistoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả lịch sử đọc' })
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
    description: 'Danh sách lịch sử đọc.',
    type: PaginatedResponseDto<ReadingHistory>,
  })
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ReadingHistory>> {
    return this.readingHistoryService.findAll(query);
  }

  @Get('reader/:readerId')
  @ApiOperation({ summary: 'Lấy lịch sử đọc của một độc giả' })
  @ApiParam({ name: 'readerId', description: 'UUID của độc giả' })
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
    description: 'Lịch sử đọc của độc giả.',
    type: PaginatedResponseDto<ReadingHistory>,
  })
  async findByReader(
    @Param('readerId') readerId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ReadingHistory>> {
    return this.readingHistoryService.findByReader(readerId, query);
  }

  @Get('book/:bookId')
  @ApiOperation({ summary: 'Lấy lịch sử đọc của một sách' })
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
    description: 'Lịch sử đọc của sách.',
    type: PaginatedResponseDto<ReadingHistory>,
  })
  async findByBook(
    @Param('bookId') bookId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ReadingHistory>> {
    return this.readingHistoryService.findByBook(bookId, query);
  }

  @Get('reader/:readerId/book/:bookId')
  @ApiOperation({ summary: 'Lấy lịch sử đọc cụ thể' })
  @ApiParam({ name: 'readerId', description: 'UUID của độc giả' })
  @ApiParam({ name: 'bookId', description: 'UUID của sách' })
  @ApiResponse({
    status: 200,
    description: 'Lịch sử đọc cụ thể.',
    type: ReadingHistory,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy lịch sử đọc.' })
  async findByReaderAndBook(
    @Param('readerId') readerId: string,
    @Param('bookId') bookId: string,
  ): Promise<ReadingHistory> {
    return this.readingHistoryService.findByReaderAndBook(readerId, bookId);
  }

  @Get('reader/:readerId/currently-reading')
  @ApiOperation({ summary: 'Lấy sách đang đọc của độc giả' })
  @ApiParam({ name: 'readerId', description: 'UUID của độc giả' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách sách đang đọc.',
    type: [ReadingHistory],
  })
  async getCurrentlyReading(
    @Param('readerId') readerId: string,
  ): Promise<ReadingHistory[]> {
    return this.readingHistoryService.getCurrentlyReading(readerId);
  }

  @Get('reader/:readerId/favorites')
  @ApiOperation({ summary: 'Lấy sách yêu thích của độc giả' })
  @ApiParam({ name: 'readerId', description: 'UUID của độc giả' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách sách yêu thích.',
    type: [ReadingHistory],
  })
  async getFavoriteBooks(
    @Param('readerId') readerId: string,
  ): Promise<ReadingHistory[]> {
    return this.readingHistoryService.getFavoriteBooks(readerId);
  }

  @Get('reader/:readerId/sessions')
  @ApiOperation({ summary: 'Lấy sessions đọc của độc giả' })
  @ApiParam({ name: 'readerId', description: 'UUID của độc giả' })
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
    description: 'Danh sách sessions đọc.',
    type: PaginatedResponseDto<ReadingSession>,
  })
  async getReadingSessions(
    @Param('readerId') readerId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ReadingSession>> {
    return this.readingHistoryService.getReadingSessions(readerId, query);
  }

  @Patch('reader/:readerId/book/:bookId/progress')
  @ApiOperation({ summary: 'Cập nhật tiến độ đọc' })
  @ApiParam({ name: 'readerId', description: 'UUID của độc giả' })
  @ApiParam({ name: 'bookId', description: 'UUID của sách' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật tiến độ thành công.',
    type: ReadingHistory,
  })
  async updateReadingProgress(
    @Param('readerId') readerId: string,
    @Param('bookId') bookId: string,
    @Body() updateProgressDto: UpdateReadingProgressDto,
  ): Promise<ReadingHistory> {
    return this.readingHistoryService.updateReadingProgress(
      readerId,
      bookId,
      updateProgressDto,
    );
  }

  @Patch('reader/:readerId/book/:bookId/complete')
  @ApiOperation({ summary: 'Đánh dấu hoàn thành đọc sách' })
  @ApiParam({ name: 'readerId', description: 'UUID của độc giả' })
  @ApiParam({ name: 'bookId', description: 'UUID của sách' })
  @ApiResponse({
    status: 200,
    description: 'Đánh dấu hoàn thành thành công.',
    type: ReadingHistory,
  })
  async markAsCompleted(
    @Param('readerId') readerId: string,
    @Param('bookId') bookId: string,
  ): Promise<ReadingHistory> {
    return this.readingHistoryService.markAsCompleted(readerId, bookId);
  }

  @Patch('reader/:readerId/book/:bookId/favorite')
  @ApiOperation({ summary: 'Toggle sách yêu thích' })
  @ApiParam({ name: 'readerId', description: 'UUID của độc giả' })
  @ApiParam({ name: 'bookId', description: 'UUID của sách' })
  @ApiResponse({
    status: 200,
    description: 'Toggle yêu thích thành công.',
    type: ReadingHistory,
  })
  async toggleFavorite(
    @Param('readerId') readerId: string,
    @Param('bookId') bookId: string,
  ): Promise<ReadingHistory> {
    return this.readingHistoryService.toggleFavorite(readerId, bookId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy một lịch sử đọc' })
  @ApiParam({ name: 'id', description: 'UUID của lịch sử đọc' })
  @ApiResponse({
    status: 200,
    description: 'Lịch sử đọc.',
    type: ReadingHistory,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy lịch sử đọc.' })
  async findOne(@Param('id') id: string): Promise<ReadingHistory> {
    return this.readingHistoryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật lịch sử đọc' })
  @ApiParam({ name: 'id', description: 'UUID của lịch sử đọc' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công.',
    type: ReadingHistory,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy lịch sử đọc.' })
  async update(
    @Param('id') id: string,
    @Body() updateReadingHistoryDto: UpdateReadingHistoryDto,
  ): Promise<ReadingHistory> {
    return this.readingHistoryService.update(id, updateReadingHistoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa lịch sử đọc' })
  @ApiParam({ name: 'id', description: 'UUID của lịch sử đọc' })
  @ApiResponse({ status: 204, description: 'Xóa thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy lịch sử đọc.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.readingHistoryService.remove(id);
  }
}
