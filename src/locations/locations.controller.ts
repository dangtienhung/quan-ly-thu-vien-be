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
import { SearchQueryDto } from '../common/dto/search-query.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location } from './entities/location.entity';
import { LocationsService } from './locations.service';

@ApiTags('Locations - Quản lý Vị trí Kệ sách')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo vị trí kệ sách mới' })
  @ApiBody({
    type: CreateLocationDto,
    description: 'Thông tin vị trí kệ sách cần tạo',
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo vị trí kệ sách thành công.',
    type: Location,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createLocationDto: CreateLocationDto,
  ): Promise<Location> {
    return this.locationsService.create(createLocationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách vị trí kệ sách với phân trang' })
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
    description: 'Lấy danh sách vị trí kệ sách thành công.',
  })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Location>> {
    return this.locationsService.findAll(paginationQuery);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Tìm kiếm vị trí kệ sách theo tên, mô tả, khu vực hoặc số kệ',
  })
  @ApiQuery({ name: 'q', required: true, description: 'Từ khóa tìm kiếm' })
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
    description: 'Tìm kiếm vị trí kệ sách thành công.',
  })
  async search(
    @Query() searchQuery: SearchQueryDto,
  ): Promise<PaginatedResponseDto<Location>> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { q, page = 1, limit = 10 } = searchQuery as any;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return this.locationsService.search(q, { page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin vị trí kệ sách theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của vị trí kệ sách' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin vị trí kệ sách thành công.',
    type: Location,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy vị trí kệ sách.' })
  async findOne(@Param('id') id: string): Promise<Location> {
    return this.locationsService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Lấy thông tin vị trí kệ sách theo slug' })
  @ApiParam({ name: 'slug', description: 'Slug của vị trí kệ sách' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin vị trí kệ sách thành công.',
    type: Location,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy vị trí kệ sách.' })
  async findBySlug(@Param('slug') slug: string): Promise<Location> {
    return this.locationsService.findBySlug(slug);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật vị trí kệ sách theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của vị trí kệ sách' })
  @ApiBody({ type: UpdateLocationDto, description: 'Thông tin cập nhật' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật vị trí kệ sách thành công.',
    type: Location,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy vị trí kệ sách.' })
  async update(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ): Promise<Location> {
    return this.locationsService.update(id, updateLocationDto);
  }

  @Patch('slug/:slug')
  @ApiOperation({ summary: 'Cập nhật vị trí kệ sách theo slug' })
  @ApiParam({ name: 'slug', description: 'Slug của vị trí kệ sách' })
  @ApiBody({ type: UpdateLocationDto, description: 'Thông tin cập nhật' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật vị trí kệ sách thành công.',
    type: Location,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy vị trí kệ sách.' })
  async updateBySlug(
    @Param('slug') slug: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ): Promise<Location> {
    return this.locationsService.updateBySlug(slug, updateLocationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa vị trí kệ sách theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của vị trí kệ sách' })
  @ApiResponse({ status: 204, description: 'Xóa vị trí kệ sách thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy vị trí kệ sách.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.locationsService.remove(id);
  }

  @Delete('slug/:slug')
  @ApiOperation({ summary: 'Xóa vị trí kệ sách theo slug' })
  @ApiParam({ name: 'slug', description: 'Slug của vị trí kệ sách' })
  @ApiResponse({ status: 204, description: 'Xóa vị trí kệ sách thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy vị trí kệ sách.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeBySlug(@Param('slug') slug: string): Promise<void> {
    return this.locationsService.removeBySlug(slug);
  }
}
