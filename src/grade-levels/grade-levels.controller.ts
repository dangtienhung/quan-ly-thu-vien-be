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
import { CreateGradeLevelDto } from './dto/create-grade-level.dto';
import { UpdateGradeLevelDto } from './dto/update-grade-level.dto';
import { GradeLevel } from './entities/grade-level.entity';
import { GradeLevelsService } from './grade-levels.service';

@ApiTags('Grade Levels - Quản lý Khối lớp')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('grade-levels')
export class GradeLevelsController {
  constructor(private readonly gradeLevelsService: GradeLevelsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo khối lớp mới' })
  @ApiBody({ type: CreateGradeLevelDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo khối lớp thành công.',
    type: GradeLevel,
  })
  @ApiResponse({ status: 409, description: 'Tên khối lớp đã tồn tại.' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateGradeLevelDto): Promise<GradeLevel> {
    return this.gradeLevelsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách khối lớp với phân trang' })
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
    description: 'Lấy danh sách khối lớp thành công.',
  })
  async findAll(
    @Query() pagination: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<GradeLevel>> {
    return this.gradeLevelsService.findAll(pagination);
  }

  @Get('all')
  @ApiOperation({ summary: 'Lấy tất cả khối lớp (không phân trang)' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách khối lớp thành công.',
  })
  async findAllWithoutPagination(): Promise<GradeLevel[]> {
    return this.gradeLevelsService.findAllWithoutPagination();
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm khối lớp theo tên/mô tả' })
  @ApiQuery({ name: 'q', required: true, description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Tìm kiếm khối lớp thành công.' })
  async search(
    @Query('q') query: string,
    @Query() pagination: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<GradeLevel>> {
    return this.gradeLevelsService.search(query, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin khối lớp theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của khối lớp' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin thành công.',
    type: GradeLevel,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy khối lớp.' })
  async findOne(@Param('id') id: string): Promise<GradeLevel> {
    return this.gradeLevelsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật khối lớp' })
  @ApiParam({ name: 'id', description: 'UUID của khối lớp' })
  @ApiBody({ type: UpdateGradeLevelDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công.',
    type: GradeLevel,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy khối lớp.' })
  @ApiResponse({ status: 409, description: 'Tên khối lớp đã tồn tại.' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateGradeLevelDto,
  ): Promise<GradeLevel> {
    return this.gradeLevelsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa khối lớp' })
  @ApiParam({ name: 'id', description: 'UUID của khối lớp' })
  @ApiResponse({ status: 204, description: 'Xóa thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy khối lớp.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.gradeLevelsService.remove(id);
  }
}
