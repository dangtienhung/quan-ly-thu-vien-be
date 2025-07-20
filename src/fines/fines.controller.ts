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
import { CreateFineDto } from './dto/create-fine.dto';
import { UpdateFineDto } from './dto/update-fine.dto';
import { Fine, FineStatus, FineType } from './entities/fine.entity';
import { FinesService } from './fines.service';

@ApiTags('Fines - Quản lý Phạt')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('fines')
export class FinesController {
  constructor(private readonly finesService: FinesService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Tạo bản ghi phạt mới (Admin)' })
  @ApiBody({
    type: CreateFineDto,
    description: 'Thông tin phạt cần tạo',
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo bản ghi phạt thành công.',
    type: Fine,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createFineDto: CreateFineDto): Promise<Fine> {
    return this.finesService.create(createFineDto);
  }

  @Post('overdue/:borrowId')
  @Roles('admin')
  @ApiOperation({ summary: 'Tạo phạt tự động cho sách trễ hạn (Admin)' })
  @ApiParam({ name: 'borrowId', description: 'UUID của bản ghi mượn sách' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        overdueDays: {
          type: 'number',
          description: 'Số ngày trễ',
          example: 5,
        },
        dailyRate: {
          type: 'number',
          description: 'Mức phạt mỗi ngày trễ',
          example: 10000,
        },
      },
    },
    description: 'Thông tin phạt trễ hạn',
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo phạt trễ hạn thành công.',
    type: Fine,
  })
  @ApiResponse({
    status: 400,
    description: 'Đã có phạt trễ hạn cho bản ghi này.',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @HttpCode(HttpStatus.CREATED)
  async createOverdueFine(
    @Param('borrowId') borrowId: string,
    @Body() body: { overdueDays: number; dailyRate?: number },
  ): Promise<Fine> {
    return this.finesService.createOverdueFine(
      borrowId,
      body.overdueDays,
      body.dailyRate,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách bản ghi phạt với phân trang' })
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
    description: 'Lấy danh sách bản ghi phạt thành công.',
  })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Fine>> {
    return this.finesService.findAll(paginationQuery);
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm bản ghi phạt' })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Từ khóa tìm kiếm (mô tả, ghi chú, mã giao dịch)',
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
    description: 'Tìm kiếm bản ghi phạt thành công.',
  })
  async search(
    @Query('q') query: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Fine>> {
    return this.finesService.search(query, paginationQuery);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Lấy danh sách bản ghi phạt theo trạng thái' })
  @ApiParam({
    name: 'status',
    description: 'Trạng thái phạt',
    enum: Object.values(FineStatus),
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
    description: 'Lấy danh sách bản ghi phạt theo trạng thái thành công.',
  })
  async findByStatus(
    @Param('status') status: FineStatus,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Fine>> {
    return this.finesService.findByStatus(status, paginationQuery);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Lấy danh sách bản ghi phạt theo loại' })
  @ApiParam({
    name: 'type',
    description: 'Loại phạt',
    enum: Object.values(FineType),
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
    description: 'Lấy danh sách bản ghi phạt theo loại thành công.',
  })
  async findByType(
    @Param('type') type: FineType,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Fine>> {
    return this.finesService.findByType(type, paginationQuery);
  }

  @Get('borrow/:borrowId')
  @ApiOperation({
    summary: 'Lấy danh sách bản ghi phạt theo bản ghi mượn sách',
  })
  @ApiParam({ name: 'borrowId', description: 'UUID của bản ghi mượn sách' })
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
    description:
      'Lấy danh sách bản ghi phạt theo bản ghi mượn sách thành công.',
  })
  async findByBorrowId(
    @Param('borrowId') borrowId: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Fine>> {
    return this.finesService.findByBorrowId(borrowId, paginationQuery);
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Lấy danh sách phạt quá hạn thanh toán' })
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
    description: 'Lấy danh sách phạt quá hạn thanh toán thành công.',
  })
  async findOverdue(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Fine>> {
    return this.finesService.findOverdue(paginationQuery);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Lấy thống kê phạt' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê phạt thành công.',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: 'Tổng số bản ghi phạt' },
        unpaid: { type: 'number', description: 'Số phạt chưa thanh toán' },
        paid: { type: 'number', description: 'Số phạt đã thanh toán' },
        partially_paid: {
          type: 'number',
          description: 'Số phạt thanh toán một phần',
        },
        waived: { type: 'number', description: 'Số phạt được miễn' },
        totalAmount: { type: 'number', description: 'Tổng số tiền phạt' },
        totalPaid: {
          type: 'number',
          description: 'Tổng số tiền đã thanh toán',
        },
        totalUnpaid: {
          type: 'number',
          description: 'Tổng số tiền chưa thanh toán',
        },
        byType: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', description: 'Loại phạt' },
              count: { type: 'number', description: 'Số lượng' },
              amount: { type: 'number', description: 'Tổng tiền' },
            },
          },
          description: 'Thống kê theo loại phạt',
        },
        byMonth: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              month: { type: 'string', description: 'Tháng' },
              count: { type: 'number', description: 'Số lượng' },
              amount: { type: 'number', description: 'Tổng tiền' },
            },
          },
          description: 'Thống kê theo tháng (6 tháng gần nhất)',
        },
      },
    },
  })
  async getStats(): Promise<{
    total: number;
    unpaid: number;
    paid: number;
    partially_paid: number;
    waived: number;
    totalAmount: number;
    totalPaid: number;
    totalUnpaid: number;
    byType: { type: string; count: number; amount: number }[];
    byMonth: { month: string; count: number; amount: number }[];
  }> {
    return this.finesService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin bản ghi phạt theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của bản ghi phạt' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin bản ghi phạt thành công.',
    type: Fine,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bản ghi phạt.' })
  async findOne(@Param('id') id: string): Promise<Fine> {
    return this.finesService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Cập nhật bản ghi phạt theo ID (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của bản ghi phạt' })
  @ApiBody({
    type: UpdateFineDto,
    description: 'Thông tin cập nhật',
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật bản ghi phạt thành công.',
    type: Fine,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bản ghi phạt.' })
  async update(
    @Param('id') id: string,
    @Body() updateFineDto: UpdateFineDto,
  ): Promise<Fine> {
    return this.finesService.update(id, updateFineDto);
  }

  @Patch(':id/pay')
  @Roles('admin')
  @ApiOperation({ summary: 'Thanh toán phạt (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của bản ghi phạt' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: {
          type: 'number',
          description: 'Số tiền thanh toán',
          example: 25000,
        },
        paymentMethod: {
          type: 'string',
          description: 'Phương thức thanh toán',
          example: 'cash',
          enum: ['cash', 'card', 'bank_transfer', 'online'],
        },
        transactionId: {
          type: 'string',
          description: 'Mã giao dịch thanh toán',
          example: 'TXN123456789',
        },
      },
    },
    description: 'Thông tin thanh toán',
  })
  @ApiResponse({
    status: 200,
    description: 'Thanh toán phạt thành công.',
    type: Fine,
  })
  @ApiResponse({ status: 400, description: 'Không thể thanh toán phạt này.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bản ghi phạt.' })
  async payFine(
    @Param('id') id: string,
    @Body()
    body: { amount: number; paymentMethod: string; transactionId?: string },
  ): Promise<Fine> {
    return this.finesService.payFine(
      id,
      body.amount,
      body.paymentMethod,
      body.transactionId,
    );
  }

  @Patch(':id/waive')
  @Roles('admin')
  @ApiOperation({ summary: 'Miễn phạt (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của bản ghi phạt' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        librarianNotes: {
          type: 'string',
          description: 'Ghi chú của thủ thư khi miễn phạt',
          example: 'Miễn phạt do hoàn cảnh đặc biệt',
        },
      },
    },
    description: 'Thông tin miễn phạt',
  })
  @ApiResponse({
    status: 200,
    description: 'Miễn phạt thành công.',
    type: Fine,
  })
  @ApiResponse({ status: 400, description: 'Không thể miễn phạt này.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bản ghi phạt.' })
  async waiveFine(
    @Param('id') id: string,
    @Body() body: { librarianNotes?: string },
  ): Promise<Fine> {
    return this.finesService.waiveFine(id, body.librarianNotes);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Xóa bản ghi phạt theo ID (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của bản ghi phạt' })
  @ApiResponse({ status: 204, description: 'Xóa bản ghi phạt thành công.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bản ghi phạt.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.finesService.remove(id);
  }
}
