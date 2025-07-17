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
import { CreateReaderTypeDto } from './dto/create-reader-type.dto';
import { UpdateReaderTypeDto } from './dto/update-reader-type.dto';
import { ReaderType, ReaderTypeName } from './entities/reader-type.entity';
import { ReaderTypesService } from './reader-types.service';

@ApiTags('Reader Types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('reader-types')
export class ReaderTypesController {
  constructor(private readonly readerTypesService: ReaderTypesService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo loại độc giả mới' })
  @ApiBody({ type: CreateReaderTypeDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo loại độc giả thành công.',
    type: ReaderType,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 409, description: 'Loại độc giả đã tồn tại.' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createReaderTypeDto: CreateReaderTypeDto,
  ): Promise<ReaderType> {
    return this.readerTypesService.create(createReaderTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách loại độc giả với phân trang' })
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
    description: 'Lấy danh sách loại độc giả thành công.',
  })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ReaderType>> {
    return this.readerTypesService.findAll(paginationQuery);
  }

  @Get('all')
  @ApiOperation({ summary: 'Lấy tất cả loại độc giả không phân trang' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách loại độc giả thành công.',
  })
  async findAllWithoutPagination(): Promise<ReaderType[]> {
    return this.readerTypesService.findAllWithoutPagination();
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Lấy thống kê theo loại độc giả' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê thành công.',
  })
  async getStatistics(): Promise<any> {
    return this.readerTypesService.getReaderTypeStats();
  }

  @Get('default-settings')
  @ApiOperation({ summary: 'Lấy cài đặt mặc định cho các loại độc giả' })
  @ApiResponse({
    status: 200,
    description: 'Lấy cài đặt mặc định thành công.',
  })
  async getDefaultSettings(): Promise<any> {
    return this.readerTypesService.getDefaultSettings();
  }

  @Post('initialize-defaults')
  @ApiOperation({ summary: 'Khởi tạo các loại độc giả mặc định' })
  @ApiResponse({
    status: 200,
    description: 'Khởi tạo loại độc giả mặc định thành công.',
  })
  async initializeDefaults(): Promise<{ message: string }> {
    await this.readerTypesService.initializeDefaultTypes();
    return { message: 'Khởi tạo loại độc giả mặc định thành công' };
  }

  @Get('type/:typeName')
  @ApiOperation({ summary: 'Lấy thông tin loại độc giả theo tên' })
  @ApiParam({
    name: 'typeName',
    description: 'Tên loại độc giả',
    enum: ReaderTypeName,
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin loại độc giả thành công.',
    type: ReaderType,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy loại độc giả.' })
  async findByTypeName(
    @Param('typeName') typeName: ReaderTypeName,
  ): Promise<ReaderType> {
    return this.readerTypesService.findByTypeName(typeName);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin loại độc giả theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của loại độc giả' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin loại độc giả thành công.',
    type: ReaderType,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy loại độc giả.' })
  async findOne(@Param('id') id: string): Promise<ReaderType> {
    return this.readerTypesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin loại độc giả' })
  @ApiParam({ name: 'id', description: 'UUID của loại độc giả' })
  @ApiBody({ type: UpdateReaderTypeDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật loại độc giả thành công.',
    type: ReaderType,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy loại độc giả.' })
  @ApiResponse({ status: 409, description: 'Loại độc giả đã tồn tại.' })
  async update(
    @Param('id') id: string,
    @Body() updateReaderTypeDto: UpdateReaderTypeDto,
  ): Promise<ReaderType> {
    return this.readerTypesService.update(id, updateReaderTypeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa loại độc giả' })
  @ApiParam({ name: 'id', description: 'UUID của loại độc giả' })
  @ApiResponse({
    status: 204,
    description: 'Xóa loại độc giả thành công.',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy loại độc giả.' })
  @ApiResponse({
    status: 409,
    description: 'Không thể xóa loại độc giả đang có độc giả sử dụng.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.readerTypesService.remove(id);
  }
}
