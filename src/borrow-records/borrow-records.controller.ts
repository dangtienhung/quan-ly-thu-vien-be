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
import { BorrowRecordsService } from './borrow-records.service';
import { CreateBorrowRecordDto } from './dto/create-borrow-record.dto';
import { FindByReaderWithSearchDto } from './dto/find-by-reader-with-search.dto';
import { FindByStatusWithSearchDto } from './dto/find-by-status-with-search.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { UpdateBorrowRecordDto } from './dto/update-borrow-record.dto';
import { BorrowRecord, BorrowStatus } from './entities/borrow-record.entity';

@ApiTags('Borrow Records - Quản lý Mượn Sách')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('borrow-records')
export class BorrowRecordsController {
  constructor(private readonly borrowRecordsService: BorrowRecordsService) {}

  @Post()
  // @Roles('admin')
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
  @ApiQuery({
    name: 'q',
    required: false,
    type: String,
    description: 'Tìm kiếm theo tên sách hoặc tên người dùng đã mượn',
  })
  @ApiQuery({
    name: 'readerId',
    required: false,
    type: String,
    description:
      'Filter theo readerId. Hỗ trợ nhiều ID, phân tách bằng dấu phẩy (id1,id2,...)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách bản ghi mượn sách theo trạng thái thành công.',
  })
  async findByStatus(
    @Param('status') status: BorrowStatus,
    @Query() paginationQuery: FindByStatusWithSearchDto,
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
  @ApiQuery({
    name: 'q',
    required: false,
    type: String,
    description: 'Tìm kiếm theo tên sách hoặc tên người dùng đã mượn',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách bản ghi mượn sách theo độc giả thành công.',
  })
  async findByReader(
    @Param('readerId') readerId: string,
    @Query() paginationQuery: FindByReaderWithSearchDto,
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

  @Get('pending-approval')
  @ApiOperation({ summary: 'Lấy danh sách yêu cầu mượn sách chờ phê duyệt' })
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
    description: 'Lấy danh sách yêu cầu chờ phê duyệt thành công.',
  })
  async findPendingApproval(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BorrowRecord>> {
    return this.borrowRecordsService.findPendingApproval(paginationQuery);
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
        byStatus: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              status: { type: 'string', description: 'Trạng thái' },
              count: { type: 'number', description: 'Số lượng' },
            },
          },
          description: 'Thống kê theo trạng thái',
        },

        borrowed: { type: 'number', description: 'Số sách đang được mượn' },
        returned: { type: 'number', description: 'Số sách đã trả' },
        overdue: {
          type: 'number',
          description: 'Số sách có trạng thái quá hạn',
        },
        renewed: { type: 'number', description: 'Số sách đã gia hạn' },
        activeLoans: {
          type: 'number',
          description:
            'Số sách đang được mượn (bao gồm cả borrowed và renewed)',
        },
        overdueLoans: {
          type: 'number',
          description:
            'Số sách quá hạn thực tế (bao gồm cả overdue và các sách có due_date < now)',
        },
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
        byReaderType: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              readerType: { type: 'string', description: 'Loại độc giả' },
              count: { type: 'number', description: 'Số lượng' },
            },
          },
          description: 'Thống kê theo loại độc giả',
        },
        byBookCategory: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string', description: 'Danh mục sách' },
              count: { type: 'number', description: 'Số lượng' },
            },
          },
          description: 'Thống kê theo danh mục sách',
        },
      },
    },
  })
  async getStats(): Promise<{
    total: number;
    byStatus: { status: string; count: number }[];
    borrowed: number;
    returned: number;
    overdue: number;
    renewed: number;
    activeLoans: number;
    overdueLoans: number;
    byMonth: { month: string; count: number }[];
    byReaderType: { readerType: string; count: number }[];
    byBookCategory: { category: string; count: number }[];
  }> {
    return this.borrowRecordsService.getStats();
  }

  @Get('stats/overdue')
  @ApiOperation({ summary: 'Lấy thống kê chi tiết sách quá hạn' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê quá hạn thành công.',
    schema: {
      type: 'object',
      properties: {
        totalOverdue: {
          type: 'number',
          description: 'Tổng số sách quá hạn',
        },
        byStatus: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              status: { type: 'string', description: 'Trạng thái' },
              count: { type: 'number', description: 'Số lượng' },
            },
          },
          description: 'Thống kê theo trạng thái',
        },
        byDaysOverdue: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              daysOverdue: { type: 'number', description: 'Số ngày quá hạn' },
              count: { type: 'number', description: 'Số lượng' },
            },
          },
          description: 'Thống kê theo số ngày quá hạn',
        },
        byReaderType: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              readerType: { type: 'string', description: 'Loại độc giả' },
              count: { type: 'number', description: 'Số lượng' },
            },
          },
          description: 'Thống kê theo loại độc giả',
        },
      },
    },
  })
  async getOverdueStats(): Promise<{
    totalOverdue: number;
    byStatus: { status: string; count: number }[];
    byDaysOverdue: { daysOverdue: number; count: number }[];
    byReaderType: { readerType: string; count: number }[];
  }> {
    return this.borrowRecordsService.getOverdueStats();
  }

  @Post('update-overdue-status')
  // @Roles('admin')
  @ApiOperation({ summary: 'Cập nhật trạng thái quá hạn tự động (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật trạng thái quá hạn thành công.',
    schema: {
      type: 'object',
      properties: {
        updatedCount: {
          type: 'number',
          description: 'Số lượng bản ghi đã được cập nhật',
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async updateOverdueStatus(): Promise<{ updatedCount: number }> {
    return this.borrowRecordsService.updateOverdueStatus();
  }

  @Get('near-due')
  @ApiOperation({
    summary: 'Lấy danh sách sách mượn gần đến hạn trả (trong vòng N ngày)',
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
  @ApiQuery({
    name: 'daysBeforeDue',
    required: false,
    type: Number,
    description: 'Số ngày trước khi đến hạn (mặc định: 2)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách sách gần đến hạn trả thành công.',
  })
  async findNearDue(
    @Query() paginationQuery: PaginationQueryDto,
    @Query('daysBeforeDue') daysBeforeDue: number = 2,
  ): Promise<PaginatedResponseDto<BorrowRecord>> {
    return this.borrowRecordsService.findNearDue(
      paginationQuery,
      daysBeforeDue,
    );
  }

  @Post('send-reminders')
  @ApiOperation({
    summary: 'Gửi thông báo nhắc nhở cho người dùng sắp đến hạn trả sách',
  })
  @ApiBody({
    type: SendNotificationDto,
    description: 'Thông tin gửi thông báo nhắc nhở',
  })
  @ApiResponse({
    status: 200,
    description: 'Gửi thông báo nhắc nhở thành công.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', description: 'Trạng thái thành công' },
        message: { type: 'string', description: 'Thông báo kết quả' },
        totalReaders: { type: 'number', description: 'Tổng số độc giả' },
        notificationsSent: {
          type: 'number',
          description: 'Số thông báo đã gửi',
        },
        details: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              readerId: { type: 'string', description: 'ID độc giả' },
              readerName: { type: 'string', description: 'Tên độc giả' },
              bookTitle: { type: 'string', description: 'Tên sách' },
              dueDate: {
                type: 'string',
                format: 'date-time',
                description: 'Ngày đến hạn',
              },
              daysUntilDue: { type: 'number', description: 'Số ngày còn lại' },
            },
          },
          description: 'Chi tiết thông báo',
        },
      },
    },
  })
  async sendDueDateReminders(
    @Body() notificationDto: SendNotificationDto,
  ): Promise<{
    success: boolean;
    message: string;
    totalReaders: number;
    notificationsSent: number;
    details: Array<{
      readerId: string;
      readerName: string;
      bookTitle: string;
      dueDate: Date;
      daysUntilDue: number;
    }>;
  }> {
    return this.borrowRecordsService.sendDueDateReminders(notificationDto);
  }

  @Get('stats/near-due')
  @ApiOperation({
    summary: 'Lấy thống kê sách gần đến hạn trả',
  })
  @ApiQuery({
    name: 'daysBeforeDue',
    required: false,
    type: Number,
    description: 'Số ngày trước khi đến hạn (mặc định: 2)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê sách gần đến hạn thành công.',
    schema: {
      type: 'object',
      properties: {
        totalNearDue: {
          type: 'number',
          description: 'Tổng số sách gần đến hạn',
        },
        byDaysUntilDue: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              daysUntilDue: { type: 'number', description: 'Số ngày còn lại' },
              count: { type: 'number', description: 'Số lượng' },
            },
          },
          description: 'Thống kê theo số ngày còn lại',
        },
        byReader: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              readerName: { type: 'string', description: 'Tên độc giả' },
              count: { type: 'number', description: 'Số lượng' },
            },
          },
          description: 'Thống kê theo độc giả',
        },
        byBookCategory: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string', description: 'Danh mục sách' },
              count: { type: 'number', description: 'Số lượng' },
            },
          },
          description: 'Thống kê theo danh mục sách',
        },
      },
    },
  })
  async getNearDueStats(
    @Query('daysBeforeDue') daysBeforeDue: number = 2,
  ): Promise<{
    totalNearDue: number;
    byDaysUntilDue: { daysUntilDue: number; count: number }[];
    byReader: { readerName: string; count: number }[];
    byBookCategory: { category: string; count: number }[];
  }> {
    return this.borrowRecordsService.getNearDueStats(daysBeforeDue);
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
  // @Roles('admin')
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

  @Patch(':id/approve')
  // @Roles('admin')
  @ApiOperation({ summary: 'Phê duyệt yêu cầu mượn sách (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của bản ghi mượn sách' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        librarianId: {
          type: 'string',
          description: 'ID của thủ thư phê duyệt',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
        notes: {
          type: 'string',
          description: 'Ghi chú khi phê duyệt',
          example: 'Yêu cầu được chấp thuận',
        },
      },
    },
    description: 'Thông tin phê duyệt',
  })
  @ApiResponse({
    status: 200,
    description: 'Phê duyệt yêu cầu thành công.',
    type: BorrowRecord,
  })
  @ApiResponse({
    status: 400,
    description: 'Yêu cầu không ở trạng thái chờ phê duyệt.',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy bản ghi mượn sách.',
  })
  async approveBorrowRequest(
    @Param('id') id: string,
    @Body() body: { librarianId: string; notes?: string },
  ): Promise<BorrowRecord> {
    return this.borrowRecordsService.approveBorrowRequest(
      id,
      body.librarianId,
      body.notes,
    );
  }

  @Patch(':id/reject')
  // @Roles('admin')
  @ApiOperation({ summary: 'Từ chối yêu cầu mượn sách (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của bản ghi mượn sách' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        librarianId: {
          type: 'string',
          description: 'ID của thủ thư từ chối',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
        reason: {
          type: 'string',
          description: 'Lý do từ chối',
          example: 'Sách không có sẵn hoặc độc giả vi phạm quy định',
        },
      },
    },
    description: 'Thông tin từ chối',
  })
  @ApiResponse({
    status: 200,
    description: 'Từ chối yêu cầu thành công.',
    type: BorrowRecord,
  })
  @ApiResponse({
    status: 400,
    description: 'Yêu cầu không ở trạng thái chờ phê duyệt.',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy bản ghi mượn sách.',
  })
  async rejectBorrowRequest(
    @Param('id') id: string,
    @Body() body: { librarianId: string; reason: string },
  ): Promise<BorrowRecord> {
    return this.borrowRecordsService.rejectBorrowRequest(
      id,
      body.librarianId,
      body.reason,
    );
  }

  @Patch(':id/return')
  // @Roles('admin')
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
  // @Roles('admin')
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
  // @Roles('admin')
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
