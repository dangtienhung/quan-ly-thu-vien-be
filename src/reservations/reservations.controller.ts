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
import { CreateMultipleReservationsResponseDto } from './dto/create-multiple-reservations-response.dto';
import { CreateMultipleReservationsDto } from './dto/create-multiple-reservations.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ExpireMultipleReservationsDto } from './dto/expire-multiple-reservations.dto';
import { ExpireReservationDto } from './dto/expire-reservation.dto';
import { FindByBookDto } from './dto/find-by-book.dto';
import { FindByReaderDto } from './dto/find-by-reader.dto';
import { FindByStatusDto } from './dto/find-by-status.dto';
import { FindExpiredDto } from './dto/find-expired.dto';
import { FindExpiringSoonDto } from './dto/find-expiring-soon.dto';
import { SearchDto } from './dto/search.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Reservation, ReservationStatus } from './entities/reservation.entity';
import { ReservationsService } from './reservations.service';

@ApiTags('Reservations - Quản lý Đặt trước')
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo đặt trước mới' })
  @ApiBody({
    type: CreateReservationDto,
    description: 'Thông tin đặt trước cần tạo',
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo đặt trước thành công.',
    type: Reservation,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 409, description: 'Độc giả đã đặt trước sách này.' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createReservationDto: CreateReservationDto,
  ): Promise<Reservation> {
    return this.reservationsService.create(createReservationDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Tạo nhiều đặt trước cùng lúc' })
  @ApiBody({
    type: CreateMultipleReservationsDto,
    description: 'Danh sách các đặt trước cần tạo',
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo nhiều đặt trước thành công.',
    type: CreateMultipleReservationsResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 409, description: 'Một số đặt trước đã tồn tại.' })
  @HttpCode(HttpStatus.CREATED)
  async createMultiple(
    @Body() createMultipleReservationsDto: CreateMultipleReservationsDto,
  ): Promise<CreateMultipleReservationsResponseDto> {
    return this.reservationsService.createMultiple(
      createMultipleReservationsDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách đặt trước với phân trang' })
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
    description: 'Lấy danh sách đặt trước thành công.',
  })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Reservation>> {
    return this.reservationsService.findAll(paginationQuery);
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm đặt trước' })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Từ khóa tìm kiếm (tên độc giả, tên sách, ghi chú)',
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
  @ApiResponse({ status: 200, description: 'Tìm kiếm đặt trước thành công.' })
  async search(
    @Query() searchQuery: SearchDto,
  ): Promise<PaginatedResponseDto<Reservation>> {
    return this.reservationsService.search(searchQuery.q, searchQuery);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Lấy danh sách đặt trước theo trạng thái' })
  @ApiParam({
    name: 'status',
    description: 'Trạng thái đặt trước',
    enum: Object.values(ReservationStatus),
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
    description: 'Lấy danh sách đặt trước theo trạng thái thành công.',
  })
  async findByStatus(
    @Param('status') status: ReservationStatus,
    @Query() paginationQuery: FindByStatusDto,
  ): Promise<PaginatedResponseDto<Reservation>> {
    return this.reservationsService.findByStatus(status, paginationQuery);
  }

  @Get('reader/:readerId')
  @ApiOperation({ summary: 'Lấy danh sách đặt trước theo độc giả' })
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
    name: 'status',
    required: false,
    enum: ReservationStatus,
    description:
      'Trạng thái đặt trước để lọc (pending, fulfilled, cancelled, expired)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách đặt trước theo độc giả thành công.',
  })
  async findByReader(
    @Param('readerId') readerId: string,
    @Query() paginationQuery: FindByReaderDto,
  ): Promise<PaginatedResponseDto<Reservation>> {
    return this.reservationsService.findByReader(readerId, paginationQuery);
  }

  @Get('book/:bookId')
  @ApiOperation({ summary: 'Lấy danh sách đặt trước theo sách' })
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
    description: 'Lấy danh sách đặt trước theo sách thành công.',
  })
  async findByBook(
    @Param('bookId') bookId: string,
    @Query() paginationQuery: FindByBookDto,
  ): Promise<PaginatedResponseDto<Reservation>> {
    return this.reservationsService.findByBook(bookId, paginationQuery);
  }

  @Get('expiring-soon')
  @ApiOperation({ summary: 'Lấy danh sách đặt trước sắp hết hạn' })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Số ngày tới (mặc định: 3)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách đặt trước sắp hết hạn thành công.',
  })
  async findExpiringSoon(
    @Query() query: FindExpiringSoonDto,
  ): Promise<Reservation[]> {
    return this.reservationsService.findExpiringSoon(query.days);
  }

  @Get('expired')
  @ApiOperation({ summary: 'Lấy danh sách đặt trước đã hết hạn' })
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
    description: 'Lấy danh sách đặt trước đã hết hạn thành công.',
  })
  async findExpired(
    @Query() paginationQuery: FindExpiredDto,
  ): Promise<PaginatedResponseDto<Reservation>> {
    return this.reservationsService.findExpired(paginationQuery);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Lấy thống kê đặt trước' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê đặt trước thành công.',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: 'Tổng số đặt trước' },
        pending: { type: 'number', description: 'Số đặt trước đang chờ' },
        fulfilled: { type: 'number', description: 'Số đặt trước đã thực hiện' },
        cancelled: { type: 'number', description: 'Số đặt trước đã hủy' },
        expired: { type: 'number', description: 'Số đặt trước đã hết hạn' },
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
    pending: number;
    fulfilled: number;
    cancelled: number;
    expired: number;
    byStatus: { status: string; count: number }[];
    byMonth: { month: string; count: number }[];
  }> {
    return this.reservationsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin đặt trước theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của đặt trước' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin đặt trước thành công.',
    type: Reservation,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đặt trước.' })
  async findOne(@Param('id') id: string): Promise<Reservation> {
    return this.reservationsService.findOne(id);
  }

  @Patch(':id')
  // @Roles('admin')
  @ApiOperation({ summary: 'Cập nhật đặt trước theo ID (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của đặt trước' })
  @ApiBody({ type: UpdateReservationDto, description: 'Thông tin cập nhật' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật đặt trước thành công.',
    type: Reservation,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đặt trước.' })
  async update(
    @Param('id') id: string,
    @Body() updateReservationDto: UpdateReservationDto,
  ): Promise<Reservation> {
    return this.reservationsService.update(id, updateReservationDto);
  }

  @Patch(':id/fulfill')
  // @Roles('admin')
  @ApiOperation({ summary: 'Thực hiện đặt trước (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của đặt trước' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        librarianId: {
          type: 'string',
          description: 'ID của thủ thư thực hiện',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
        notes: {
          type: 'string',
          description: 'Ghi chú của thủ thư',
          example: 'Sách đã sẵn sàng cho độc giả',
        },
      },
    },
    description: 'Thông tin thực hiện đặt trước',
  })
  @ApiResponse({
    status: 200,
    description: 'Thực hiện đặt trước thành công.',
    type: Reservation,
  })
  @ApiResponse({
    status: 400,
    description: 'Không thể thực hiện đặt trước này.',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đặt trước.' })
  async fulfillReservation(
    @Param('id') id: string,
    @Body() body: { librarianId: string; notes?: string },
  ): Promise<Reservation> {
    return this.reservationsService.fulfillReservation(
      id,
      body.librarianId,
      body.notes,
    );
  }

  @Patch(':id/cancel')
  // @Roles('admin')
  @ApiOperation({ summary: 'Hủy đặt trước (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của đặt trước' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        librarianId: {
          type: 'string',
          description: 'ID của thủ thư hủy',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
        reason: {
          type: 'string',
          description: 'Lý do hủy đặt trước',
          example: 'Sách không còn sẵn',
        },
      },
    },
    description: 'Thông tin hủy đặt trước',
  })
  @ApiResponse({
    status: 200,
    description: 'Hủy đặt trước thành công.',
    type: Reservation,
  })
  @ApiResponse({ status: 400, description: 'Không thể hủy đặt trước này.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đặt trước.' })
  async cancelReservation(
    @Param('id') id: string,
    @Body() body: { librarianId: string; reason?: string },
  ): Promise<Reservation> {
    return this.reservationsService.cancelReservation(
      id,
      body.librarianId,
      body.reason,
    );
  }

  @Patch(':id/expire')
  // @Roles('admin')
  @ApiOperation({ summary: 'Đánh dấu đặt trước hết hạn (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của đặt trước' })
  @ApiBody({
    type: ExpireReservationDto,
    description: 'Thông tin đánh dấu hết hạn đặt trước',
  })
  @ApiResponse({
    status: 200,
    description: 'Đánh dấu hết hạn đặt trước thành công.',
    type: Reservation,
  })
  @ApiResponse({
    status: 400,
    description: 'Không thể đánh dấu hết hạn đặt trước này.',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đặt trước.' })
  async expireReservation(
    @Param('id') id: string,
    @Body() expireReservationDto: ExpireReservationDto,
  ): Promise<Reservation> {
    return this.reservationsService.expireReservation(
      id,
      expireReservationDto.librarianId,
      expireReservationDto.reason,
    );
  }

  @Post('bulk-expire')
  // @Roles('admin')
  @ApiOperation({ summary: 'Đánh dấu nhiều đặt trước hết hạn (Admin)' })
  @ApiBody({
    type: ExpireMultipleReservationsDto,
    description: 'Danh sách các đặt trước cần đánh dấu hết hạn',
  })
  @ApiResponse({
    status: 200,
    description: 'Đánh dấu nhiều đặt trước hết hạn thành công.',
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'array',
          items: { type: 'string' },
          description: 'Danh sách ID đặt trước đã đánh dấu hết hạn thành công',
        },
        failed: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'ID đặt trước' },
              error: { type: 'string', description: 'Lỗi' },
            },
          },
          description: 'Danh sách ID đặt trước đánh dấu hết hạn thất bại',
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async expireMultipleReservations(
    @Body() expireMultipleReservationsDto: ExpireMultipleReservationsDto,
  ): Promise<{ success: string[]; failed: { id: string; error: string }[] }> {
    return await this.reservationsService.expireMultipleReservations(
      expireMultipleReservationsDto.reservationIds,
      expireMultipleReservationsDto.librarianId,
      expireMultipleReservationsDto.reason,
    );
  }

  @Get('stats/by-status')
  // @Roles('admin')
  @ApiOperation({ summary: 'Thống kê số lượng reservations theo status' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê theo status thành công.',
    schema: {
      type: 'object',
      properties: {
        total: {
          type: 'number',
          description: 'Tổng số reservations',
        },
        byStatus: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                description: 'Trạng thái reservation',
                enum: ['pending', 'fulfilled', 'cancelled', 'expired'],
              },
              count: {
                type: 'number',
                description: 'Số lượng reservations theo status',
              },
            },
          },
        },
        pending: {
          type: 'number',
          description: 'Số lượng reservations đang chờ',
        },
        fulfilled: {
          type: 'number',
          description: 'Số lượng reservations đã thực hiện',
        },
        cancelled: {
          type: 'number',
          description: 'Số lượng reservations đã hủy',
        },
        expired: {
          type: 'number',
          description: 'Số lượng reservations hết hạn',
        },
        expiringSoon: {
          type: 'number',
          description: 'Số lượng reservations sắp hết hạn (1 ngày tới)',
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async getStatsByStatus(): Promise<{
    total: number;
    byStatus: { status: string; count: number }[];
    pending: number;
    fulfilled: number;
    cancelled: number;
    expired: number;
    expiringSoon: number;
  }> {
    return this.reservationsService.getStatsByStatus();
  }

  @Post('auto-cancel-expired')
  // @Roles('admin')
  @ApiOperation({ summary: 'Tự động hủy đặt trước hết hạn (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Tự động hủy đặt trước hết hạn thành công.',
    schema: {
      type: 'object',
      properties: {
        cancelledCount: {
          type: 'number',
          description: 'Số lượng đặt trước đã hủy',
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async autoCancelExpiredReservations(): Promise<{ cancelledCount: number }> {
    const cancelledCount =
      await this.reservationsService.autoCancelExpiredReservations();
    return { cancelledCount };
  }

  @Post('auto-expire-expired')
  // @Roles('admin')
  @ApiOperation({ summary: 'Tự động đánh dấu đặt trước hết hạn (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Tự động đánh dấu đặt trước hết hạn thành công.',
    schema: {
      type: 'object',
      properties: {
        expiredCount: {
          type: 'number',
          description: 'Số lượng đặt trước đã đánh dấu hết hạn',
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async autoExpireExpiredReservations(): Promise<{ expiredCount: number }> {
    const expiredCount =
      await this.reservationsService.autoExpireExpiredReservations();
    return { expiredCount };
  }

  @Delete(':id')
  // @Roles('admin')
  @ApiOperation({ summary: 'Xóa đặt trước theo ID (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của đặt trước' })
  @ApiResponse({ status: 204, description: 'Xóa đặt trước thành công.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đặt trước.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.reservationsService.remove(id);
  }
}
