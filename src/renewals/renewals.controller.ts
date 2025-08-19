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
import { CreateRenewalDto } from './dto/create-renewal.dto';
import { UpdateRenewalDto } from './dto/update-renewal.dto';
import { Renewal } from './entities/renewal.entity';
import { RenewalsService } from './renewals.service';

@ApiTags('Renewals - Quản lý Gia Hạn Sách')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('renewals')
export class RenewalsController {
  constructor(private readonly renewalsService: RenewalsService) {}

  @Post()
  // @Roles('admin')
  @ApiOperation({ summary: 'Tạo bản ghi gia hạn sách mới (Admin)' })
  @ApiBody({
    type: CreateRenewalDto,
    description: 'Thông tin gia hạn sách cần tạo',
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo bản ghi gia hạn sách thành công.',
    type: Renewal,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRenewalDto: CreateRenewalDto): Promise<Renewal> {
    return this.renewalsService.create(createRenewalDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách bản ghi gia hạn sách với phân trang',
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
    description: 'Lấy danh sách bản ghi gia hạn sách thành công.',
  })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Renewal>> {
    return this.renewalsService.findAll(paginationQuery);
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm bản ghi gia hạn sách' })
  @ApiQuery({
    name: 'q',
    required: true,
    description:
      'Từ khóa tìm kiếm (lý do gia hạn, ghi chú thủ thư, ID bản ghi mượn)',
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
    description: 'Tìm kiếm bản ghi gia hạn sách thành công.',
  })
  async search(
    @Query('q') query: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Renewal>> {
    return this.renewalsService.search(query, paginationQuery);
  }

  @Get('status/:status')
  @ApiOperation({
    summary: 'Lấy danh sách bản ghi gia hạn sách theo trạng thái',
  })
  @ApiParam({
    name: 'status',
    description: 'Trạng thái gia hạn (approved, pending, rejected)',
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
    description:
      'Lấy danh sách bản ghi gia hạn sách theo trạng thái thành công.',
  })
  async findByStatus(
    @Param('status') status: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Renewal>> {
    return this.renewalsService.findByStatus(status, paginationQuery);
  }

  @Get('borrow/:borrowId')
  @ApiOperation({
    summary: 'Lấy danh sách bản ghi gia hạn sách theo bản ghi mượn sách',
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
      'Lấy danh sách bản ghi gia hạn sách theo bản ghi mượn sách thành công.',
  })
  async findByBorrowId(
    @Param('borrowId') borrowId: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Renewal>> {
    return this.renewalsService.findByBorrowId(borrowId, paginationQuery);
  }

  @Get('librarian/:librarianId')
  @ApiOperation({ summary: 'Lấy danh sách bản ghi gia hạn sách theo thủ thư' })
  @ApiParam({ name: 'librarianId', description: 'UUID của thủ thư' })
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
    description: 'Lấy danh sách bản ghi gia hạn sách theo thủ thư thành công.',
  })
  async findByLibrarian(
    @Param('librarianId') librarianId: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Renewal>> {
    return this.renewalsService.findByLibrarian(librarianId, paginationQuery);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Lấy thống kê gia hạn sách' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê gia hạn sách thành công.',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: 'Tổng số bản ghi gia hạn' },
        approved: { type: 'number', description: 'Số gia hạn đã phê duyệt' },
        pending: { type: 'number', description: 'Số gia hạn đang chờ' },
        rejected: { type: 'number', description: 'Số gia hạn bị từ chối' },
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
    approved: number;
    pending: number;
    rejected: number;
    byMonth: { month: string; count: number }[];
  }> {
    return this.renewalsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin bản ghi gia hạn sách theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của bản ghi gia hạn sách' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin bản ghi gia hạn sách thành công.',
    type: Renewal,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy bản ghi gia hạn sách.',
  })
  async findOne(@Param('id') id: string): Promise<Renewal> {
    return this.renewalsService.findOne(id);
  }

  @Patch(':id')
  // @Roles('admin')
  @ApiOperation({ summary: 'Cập nhật bản ghi gia hạn sách theo ID (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của bản ghi gia hạn sách' })
  @ApiBody({
    type: UpdateRenewalDto,
    description: 'Thông tin cập nhật',
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật bản ghi gia hạn sách thành công.',
    type: Renewal,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy bản ghi gia hạn sách.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateRenewalDto: UpdateRenewalDto,
  ): Promise<Renewal> {
    return this.renewalsService.update(id, updateRenewalDto);
  }

  @Patch(':id/approve')
  // @Roles('admin')
  @ApiOperation({ summary: 'Phê duyệt gia hạn sách (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của bản ghi gia hạn sách' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        librarianNotes: {
          type: 'string',
          description: 'Ghi chú của thủ thư khi phê duyệt',
          example: 'Phê duyệt theo yêu cầu của độc giả',
        },
      },
    },
    description: 'Thông tin phê duyệt',
  })
  @ApiResponse({
    status: 200,
    description: 'Phê duyệt gia hạn sách thành công.',
    type: Renewal,
  })
  @ApiResponse({ status: 400, description: 'Không thể phê duyệt gia hạn này.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy bản ghi gia hạn sách.',
  })
  async approveRenewal(
    @Param('id') id: string,
    @Body() body: { librarianNotes?: string },
  ): Promise<Renewal> {
    return this.renewalsService.approveRenewal(id, body.librarianNotes);
  }

  @Patch(':id/reject')
  // @Roles('admin')
  @ApiOperation({ summary: 'Từ chối gia hạn sách (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của bản ghi gia hạn sách' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        librarianNotes: {
          type: 'string',
          description: 'Ghi chú của thủ thư khi từ chối',
          example: 'Từ chối do sách đã được đặt trước',
        },
      },
    },
    description: 'Thông tin từ chối',
  })
  @ApiResponse({
    status: 200,
    description: 'Từ chối gia hạn sách thành công.',
    type: Renewal,
  })
  @ApiResponse({ status: 400, description: 'Không thể từ chối gia hạn này.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy bản ghi gia hạn sách.',
  })
  async rejectRenewal(
    @Param('id') id: string,
    @Body() body: { librarianNotes?: string },
  ): Promise<Renewal> {
    return this.renewalsService.rejectRenewal(id, body.librarianNotes);
  }

  @Delete(':id')
  // @Roles('admin')
  @ApiOperation({ summary: 'Xóa bản ghi gia hạn sách theo ID (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của bản ghi gia hạn sách' })
  @ApiResponse({
    status: 204,
    description: 'Xóa bản ghi gia hạn sách thành công.',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy bản ghi gia hạn sách.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.renewalsService.remove(id);
  }
}
