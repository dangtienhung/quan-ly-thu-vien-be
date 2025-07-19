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
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { CreateManyAuthorsDto } from './dto/create-many-authors.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { Author } from './entities/author.entity';

@ApiTags('Authors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Tạo mới tác giả (Admin)' })
  @ApiResponse({
    status: 201,
    description: 'Tạo tác giả thành công.',
    type: Author,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAuthorDto: CreateAuthorDto): Promise<Author> {
    return this.authorsService.create(createAuthorDto);
  }

  @Post('bulk')
  @Roles('admin')
  @ApiOperation({ summary: 'Tạo nhiều tác giả cùng lúc (Admin)' })
  @ApiResponse({
    status: 201,
    description: 'Tạo các tác giả thành công.',
    type: [Author],
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @HttpCode(HttpStatus.CREATED)
  createMany(
    @Body() createManyAuthorsDto: CreateManyAuthorsDto,
  ): Promise<Author[]> {
    return this.authorsService.createMany(createManyAuthorsDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tác giả có phân trang' })
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
    description: 'Lấy danh sách tác giả thành công.',
    type: Author,
    isArray: true,
  })
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Author>> {
    return this.authorsService.findAll(paginationQuery);
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm tác giả' })
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
    description: 'Tìm kiếm tác giả thành công.',
    type: Author,
    isArray: true,
  })
  search(
    @Query('q') query: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Author>> {
    return this.authorsService.search(query, paginationQuery);
  }

  @Get('nationality/:nationality')
  @ApiOperation({ summary: 'Lấy danh sách tác giả theo quốc tịch' })
  @ApiParam({ name: 'nationality', description: 'Quốc tịch của tác giả' })
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
    description: 'Lấy danh sách tác giả theo quốc tịch thành công.',
    type: Author,
    isArray: true,
  })
  findByNationality(
    @Param('nationality') nationality: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Author>> {
    return this.authorsService.findByNationality(nationality, paginationQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin tác giả theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của tác giả' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin tác giả thành công.',
    type: Author,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tác giả.' })
  findOne(@Param('id') id: string): Promise<Author> {
    return this.authorsService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Lấy thông tin tác giả theo slug' })
  @ApiParam({ name: 'slug', description: 'Slug của tác giả' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin tác giả thành công.',
    type: Author,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tác giả.' })
  findBySlug(@Param('slug') slug: string): Promise<Author> {
    return this.authorsService.findBySlug(slug);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Cập nhật tác giả theo ID (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của tác giả' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật tác giả thành công.',
    type: Author,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tác giả.' })
  update(
    @Param('id') id: string,
    @Body() updateAuthorDto: UpdateAuthorDto,
  ): Promise<Author> {
    return this.authorsService.update(id, updateAuthorDto);
  }

  @Patch('slug/:slug')
  @Roles('admin')
  @ApiOperation({ summary: 'Cập nhật tác giả theo slug (Admin)' })
  @ApiParam({ name: 'slug', description: 'Slug của tác giả' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật tác giả thành công.',
    type: Author,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tác giả.' })
  updateBySlug(
    @Param('slug') slug: string,
    @Body() updateAuthorDto: UpdateAuthorDto,
  ): Promise<Author> {
    return this.authorsService.updateBySlug(slug, updateAuthorDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Xóa tác giả theo ID (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của tác giả' })
  @ApiResponse({ status: 204, description: 'Xóa tác giả thành công.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tác giả.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.authorsService.remove(id);
  }

  @Delete('slug/:slug')
  @Roles('admin')
  @ApiOperation({ summary: 'Xóa tác giả theo slug (Admin)' })
  @ApiParam({ name: 'slug', description: 'Slug của tác giả' })
  @ApiResponse({ status: 204, description: 'Xóa tác giả thành công.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tác giả.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  removeBySlug(@Param('slug') slug: string): Promise<void> {
    return this.authorsService.removeBySlug(slug);
  }
}
