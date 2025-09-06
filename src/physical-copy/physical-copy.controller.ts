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
import { BooksService } from 'src/books/books.service';
import {
  PaginatedResponseDto,
  PaginationQueryDto,
} from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreatePhysicalCopyDto } from './dto/create-physical-copy.dto';
import { UpdatePhysicalCopyDto } from './dto/update-physical-copy.dto';
import {
  CopyCondition,
  CopyStatus,
  PhysicalCopy,
} from './entities/physical-copy.entity';
import { PhysicalCopyService } from './physical-copy.service';

@ApiTags('Physical Copies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('physical-copies')
export class PhysicalCopyController {
  constructor(
    private readonly physicalCopyService: PhysicalCopyService,
    private readonly booksService: BooksService,
  ) {}

  // Physical Copy Endpoints

  @Post()
  // @Roles('admin')
  @ApiOperation({ summary: 'Tạo bản sao vật lý mới (Admin)' })
  @ApiResponse({
    status: 201,
    description: 'Tạo bản sao thành công.',
    type: PhysicalCopy,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @HttpCode(HttpStatus.CREATED)
  createPhysicalCopy(
    @Body() createPhysicalCopyDto: CreatePhysicalCopyDto,
  ): Promise<PhysicalCopy> {
    return this.physicalCopyService.createPhysicalCopy(createPhysicalCopyDto);
  }

  @Post('book/:bookId/many')
  // @Roles('admin')
  @ApiOperation({ summary: 'Tạo nhiều bản sao cùng lúc cho sách (Admin)' })
  @ApiParam({ name: 'bookId', description: 'UUID của sách' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: 'Số lượng bản sao cần tạo',
          example: 5,
        },
        purchase_date: {
          type: 'string',
          description: 'Ngày mua',
          example: '2024-01-01',
        },
        purchase_price: {
          type: 'number',
          description: 'Giá mua',
          example: 75000,
        },
        location_id: {
          type: 'string',
          description: 'ID vị trí kệ sách',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
      },
    },
    description: 'Thông tin tạo nhiều bản sao',
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo nhiều bản sao thành công.',
    type: PhysicalCopy,
    isArray: true,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @HttpCode(HttpStatus.CREATED)
  createManyPhysicalCopies(
    @Param('bookId') bookId: string,
    @Body()
    body: {
      count: number;
      purchase_date?: string;
      purchase_price?: number;
      location_id?: string;
    },
  ): Promise<PhysicalCopy[]> {
    return this.physicalCopyService.createMany(bookId, body.count, {
      purchase_date: body.purchase_date
        ? new Date(body.purchase_date)
        : undefined,
      purchase_price: body.purchase_price,
      location_id: body.location_id,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả bản sao với phân trang' })
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
    description: 'Lấy danh sách bản sao thành công.',
  })
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<PhysicalCopy>> {
    return this.physicalCopyService.findAll(paginationQuery);
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm bản sao' })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Từ khóa tìm kiếm (barcode, vị trí, ghi chú, tên sách)',
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
    description: 'Tìm kiếm bản sao thành công.',
  })
  search(
    @Query('q') query: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<PhysicalCopy>> {
    return this.physicalCopyService.search(query, paginationQuery);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Lấy danh sách bản sao theo trạng thái' })
  @ApiParam({
    name: 'status',
    description: 'Trạng thái bản sao',
    enum: Object.values(CopyStatus),
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
    description: 'Lấy danh sách bản sao theo trạng thái thành công.',
  })
  findByStatus(
    @Param('status') status: CopyStatus,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<PhysicalCopy>> {
    return this.physicalCopyService.findByStatus(status, paginationQuery);
  }

  @Get('condition/:condition')
  @ApiOperation({ summary: 'Lấy danh sách bản sao theo tình trạng' })
  @ApiParam({
    name: 'condition',
    description: 'Tình trạng bản sao',
    enum: Object.values(CopyCondition),
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
    description: 'Lấy danh sách bản sao theo tình trạng thành công.',
  })
  findByCondition(
    @Param('condition') condition: CopyCondition,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<PhysicalCopy>> {
    return this.physicalCopyService.findByCondition(condition, paginationQuery);
  }

  @Get('location/:location')
  @ApiOperation({ summary: 'Lấy danh sách bản sao theo vị trí' })
  @ApiParam({ name: 'location', description: 'Vị trí trong thư viện' })
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
    description: 'Lấy danh sách bản sao theo vị trí thành công.',
  })
  findByLocation(
    @Param('location') location: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<PhysicalCopy>> {
    return this.physicalCopyService.findByLocation(location, paginationQuery);
  }

  @Get('available')
  @ApiOperation({ summary: 'Lấy danh sách bản sao sẵn sàng cho mượn' })
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
    description: 'Lấy danh sách bản sao sẵn sàng thành công.',
  })
  findAvailable(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<PhysicalCopy>> {
    return this.physicalCopyService.findAvailable(paginationQuery);
  }

  @Get('book/:bookId/available')
  @ApiOperation({ summary: 'Lấy danh sách bản sao có sẵn theo bookId' })
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
    description: 'Lấy danh sách bản sao có sẵn theo bookId thành công.',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy sách với bookId đã cung cấp.',
  })
  findAvailableByBookId(
    @Param('bookId') bookId: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<PhysicalCopy>> {
    return this.physicalCopyService.findAvailableByBookId(
      bookId,
      paginationQuery,
    );
  }

  @Get('maintenance')
  @ApiOperation({ summary: 'Lấy danh sách bản sao cần bảo trì' })
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
    description: 'Lấy danh sách bản sao cần bảo trì thành công.',
  })
  findNeedingMaintenance(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<PhysicalCopy>> {
    return this.physicalCopyService.findNeedingMaintenance(paginationQuery);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Lấy thống kê bản sao' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê bản sao thành công.',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: 'Tổng số bản sao' },
        available: { type: 'number', description: 'Số bản sao sẵn sàng' },
        borrowed: { type: 'number', description: 'Số bản sao đang mượn' },
        reserved: { type: 'number', description: 'Số bản sao đã đặt trước' },
        damaged: { type: 'number', description: 'Số bản sao bị hư hỏng' },
        lost: { type: 'number', description: 'Số bản sao bị mất' },
        maintenance: { type: 'number', description: 'Số bản sao đang bảo trì' },
        archived: { type: 'number', description: 'Số bản sao đã lưu trữ' },
        byCondition: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              condition: { type: 'string', description: 'Tình trạng' },
              count: { type: 'number', description: 'Số lượng' },
            },
          },
          description: 'Thống kê theo tình trạng',
        },
        byLocation: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              location: { type: 'string', description: 'Vị trí' },
              count: { type: 'number', description: 'Số lượng' },
            },
          },
          description: 'Thống kê theo vị trí',
        },
        totalValue: { type: 'number', description: 'Tổng giá trị bản sao' },
      },
    },
  })
  getStats(): Promise<{
    total: number;
    available: number;
    borrowed: number;
    reserved: number;
    damaged: number;
    lost: number;
    maintenance: number;
    archived: number;
    byCondition: { condition: string; count: number }[];
    byLocation: { location: string; count: number }[];
    totalValue: number;
  }> {
    return this.physicalCopyService.getStats();
  }

  @Get('book/:bookId')
  @ApiOperation({ summary: 'Lấy danh sách bản sao của sách' })
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
    description: 'Lấy danh sách bản sao của sách thành công.',
  })
  findPhysicalCopies(
    @Param('bookId') bookId: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<PhysicalCopy>> {
    return this.physicalCopyService.findPhysicalCopies(bookId, paginationQuery);
  }

  @Get('barcode/:barcode')
  @ApiOperation({ summary: 'Lấy thông tin bản sao theo barcode' })
  @ApiParam({ name: 'barcode', description: 'Barcode của bản sao' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin bản sao thành công.',
    type: PhysicalCopy,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bản sao.' })
  findPhysicalCopyByBarcode(
    @Param('barcode') barcode: string,
  ): Promise<PhysicalCopy> {
    return this.physicalCopyService.findPhysicalCopyByBarcode(barcode);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin bản sao theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của bản sao' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin bản sao thành công.',
    type: PhysicalCopy,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bản sao.' })
  findOne(@Param('id') id: string): Promise<PhysicalCopy> {
    return this.physicalCopyService.findOne(id);
  }

  @Patch(':id')
  // @Roles('admin')
  @ApiOperation({ summary: 'Cập nhật bản sao (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của bản sao' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật bản sao thành công.',
    type: PhysicalCopy,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bản sao.' })
  updatePhysicalCopy(
    @Param('id') id: string,
    @Body() updatePhysicalCopyDto: UpdatePhysicalCopyDto,
  ): Promise<PhysicalCopy> {
    return this.physicalCopyService.updatePhysicalCopy(
      id,
      updatePhysicalCopyDto,
    );
  }

  @Patch(':id/status')
  // @Roles('admin')
  @ApiOperation({ summary: 'Cập nhật trạng thái bản sao (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của bản sao' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Trạng thái mới',
          enum: Object.values(CopyStatus),
        },
        notes: {
          type: 'string',
          description: 'Ghi chú khi thay đổi trạng thái',
        },
      },
    },
    description: 'Thông tin cập nhật trạng thái',
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật trạng thái thành công.',
    type: PhysicalCopy,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bản sao.' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: CopyStatus; notes?: string },
  ): Promise<PhysicalCopy> {
    return this.physicalCopyService.updateStatus(id, body.status, body.notes);
  }

  @Patch(':id/condition')
  // @Roles('admin')
  @ApiOperation({ summary: 'Cập nhật tình trạng bản sao (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của bản sao' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        condition: {
          type: 'string',
          description: 'Tình trạng mới',
          enum: Object.values(CopyCondition),
        },
        details: {
          type: 'string',
          description: 'Chi tiết về tình trạng',
        },
      },
    },
    description: 'Thông tin cập nhật tình trạng',
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật tình trạng thành công.',
    type: PhysicalCopy,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bản sao.' })
  updateCondition(
    @Param('id') id: string,
    @Body() body: { condition: CopyCondition; details?: string },
  ): Promise<PhysicalCopy> {
    return this.physicalCopyService.updateCondition(
      id,
      body.condition,
      body.details,
    );
  }

  @Patch(':id/archive')
  // @Roles('admin')
  @ApiOperation({ summary: 'Lưu trữ/Bỏ lưu trữ bản sao (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của bản sao' })
  @ApiResponse({
    status: 200,
    description: 'Thay đổi trạng thái lưu trữ thành công.',
    type: PhysicalCopy,
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bản sao.' })
  toggleArchive(@Param('id') id: string): Promise<PhysicalCopy> {
    return this.physicalCopyService.toggleArchive(id);
  }

  @Delete(':id')
  // @Roles('admin')
  @ApiOperation({ summary: 'Xóa bản sao (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của bản sao' })
  @ApiResponse({ status: 204, description: 'Xóa bản sao thành công.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bản sao.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  removePhysicalCopy(@Param('id') id: string): Promise<void> {
    return this.physicalCopyService.removePhysicalCopy(id);
  }
}
