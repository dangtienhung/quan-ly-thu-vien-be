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
import { BorrowRecordsService } from './borrow-records.service';
import { CreateBorrowRecordDto } from './dto/create-borrow-record.dto';
import { UpdateBorrowRecordDto } from './dto/update-borrow-record.dto';
import { BorrowRecord, BorrowStatus } from './entities/borrow-record.entity';

@ApiTags('Borrow Records - Quản lý Mượn Sách')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('borrow-records')
export class BorrowRecordsController {
  constructor(private readonly borrowRecordsService: BorrowRecordsService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Tạo bản ghi mượn sách mới (Admin)' })
  @ApiBody({
    type: CreateBorrowRecordDto,
    description: 'Thông tin mượn sách cần tạo',
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo bản ghi mượn sách thành công.',
    type: BorrowRecord,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createBorrowRecordDto: CreateBorrowRecordDto,
  ): Promise<BorrowRecord> {
    return this.borrowRecordsService.create(createBorrowRecordDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách bản ghi mượn sách với phân trang' })
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
    description: 'Lấy danh sách bản ghi mượn sách thành công.',
  })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BorrowRecord>> {
    return this.borrowRecordsService.findAll(paginationQuery);
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm bản ghi mượn sách' })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Từ khóa tìm kiếm (tên độc giả, barcode sách, ghi chú)',
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
    description: 'Tìm kiếm bản ghi mượn sách thành công.',
  })
  async search(
    @Query('q') query: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BorrowRecord>> {
    return this.borrowRecordsService.search(query, paginationQuery);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Lấy danh sách bản ghi mượn sách theo trạng thái' })
  @ApiParam({
    name: 'status',
    description: 'Trạng thái mượn sách',
    enum: BorrowStatus,
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
    description: 'Lấy danh sách bản ghi mượn sách theo trạng thái thành công.',
  })
  async findByStatus(
    @Param('status') status: BorrowStatus,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BorrowRecord>> {
    return this.borrowRecordsService.findByStatus(status, paginationQuery);
  }

  @Get('reader/:readerId')
  @ApiOperation({ summary: 'Lấy danh sách bản ghi mượn sách theo độc giả' })
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
    description: 'Lấy danh sách bản ghi mượn sách theo độc giả thành công.',
  })
  async findByReader(
    @Param('readerId') readerId: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BorrowRecord>> {
    return this.borrowRecordsService.findByReader(readerId, paginationQuery);
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Lấy danh sách sách mượn quá hạn' })
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
    description: 'Lấy danh sách sách mượn quá hạn thành công.',
  })
  async findOverdue(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BorrowRecord>> {
    return this.borrowRecordsService.findOverdue(paginationQuery);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Lấy thống kê mượn sách' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê mượn sách thành công.',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: 'Tổng số bản ghi mượn sách' },
        borrowed: { type: 'number', description: 'Số sách đang được mượn' },
        returned: { type: 'number', description: 'Số sách đã trả' },
        overdue: { type: 'number', description: 'Số sách mượn quá hạn' },
        renewed: { type: 'number', description: 'Số sách đã gia hạn' },
        byMonth: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              month: { type: 'string', description: 'Tháng' },
              count: { type: 'number', description: 'Số lượng' },
            },
          },
          description: 'Thống kê theo tháng (6 tháng gần nhất)',
        },
      },
    },
  })
  async getStats(): Promise<{
    total: number;
    borrowed: number;
    returned: number;
    overdue: number;
    renewed: number;
    byMonth: { month: string; count: number }[];
  }> {
    return this.borrowRecordsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin bản ghi mượn sách theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của bản ghi mượn sách' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin bản ghi mượn sách thành công.',
    type: BorrowRecord,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy bản ghi mượn sách.',
  })
  async findOne(@Param('id') id: string): Promise<BorrowRecord> {
    return this.borrowRecordsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Cập nhật bản ghi mượn sách theo ID (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của bản ghi mượn sách' })
  @ApiBody({
    type: UpdateBorrowRecordDto,
    description: 'Thông tin cập nhật',
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật bản ghi mượn sách thành công.',
    type: BorrowRecord,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy bản ghi mượn sách.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateBorrowRecordDto: UpdateBorrowRecordDto,
  ): Promise<BorrowRecord> {
    return this.borrowRecordsService.update(id, updateBorrowRecordDto);
  }

  @Patch(':id/return')
  @Roles('admin')
  @ApiOperation({ summary: 'Trả sách (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của bản ghi mượn sách' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        returnNotes: {
          type: 'string',
          description: 'Ghi chú khi trả sách',
          example: 'Sách trả đúng hạn, tình trạng tốt',
        },
      },
    },
    description: 'Thông tin trả sách',
  })
  @ApiResponse({
    status: 200,
    description: 'Trả sách thành công.',
    type: BorrowRecord,
  })
  @ApiResponse({ status: 400, description: 'Sách đã được trả trước đó.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy bản ghi mượn sách.',
  })
  async returnBook(
    @Param('id') id: string,
    @Body() body: { returnNotes?: string },
  ): Promise<BorrowRecord> {
    return this.borrowRecordsService.returnBook(id, body.returnNotes);
  }

  @Patch(':id/renew')
  @Roles('admin')
  @ApiOperation({ summary: 'Gia hạn sách (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của bản ghi mượn sách' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        newDueDate: {
          type: 'string',
          format: 'date-time',
          description: 'Ngày hạn mới',
          example: '2024-02-15T10:00:00.000Z',
        },
      },
    },
    description: 'Thông tin gia hạn',
  })
  @ApiResponse({
    status: 200,
    description: 'Gia hạn sách thành công.',
    type: BorrowRecord,
  })
  @ApiResponse({ status: 400, description: 'Không thể gia hạn sách này.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy bản ghi mượn sách.',
  })
  async renewBook(
    @Param('id') id: string,
    @Body() body: { newDueDate: string },
  ): Promise<BorrowRecord> {
    return this.borrowRecordsService.renewBook(id, new Date(body.newDueDate));
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Xóa bản ghi mượn sách theo ID (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của bản ghi mượn sách' })
  @ApiResponse({
    status: 204,
    description: 'Xóa bản ghi mượn sách thành công.',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy bản ghi mượn sách.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.borrowRecordsService.remove(id);
  }
}
