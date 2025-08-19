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
  Request,
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
import { CreateUserDto } from './dto/create-user.dto';
import { FilterUsersDto } from './dto/filter-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AccountStatus, User, UserRole } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // CREATE - Tạo user mới
  @Post()
  // @Roles('admin')
  @ApiOperation({ summary: 'Tạo mới người dùng (Admin)' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo người dùng thành công.',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({
    status: 409,
    description: 'Tên đăng nhập hoặc email đã tồn tại.',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  // READ ME - Lấy thông tin người dùng hiện tại
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy thông tin người dùng đang đăng nhập' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin người dùng thành công.',
    type: User,
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập hoặc token hết hạn.',
  })
  async getCurrentUser(@Request() req): Promise<User> {
    return this.usersService.findOne(req.user.sub);
  }

  // READ ALL - Danh sách users
  @Get()
  // @Roles('admin')
  @ApiOperation({ summary: 'Lấy danh sách người dùng có phân trang (Admin)' })
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
    name: 'type',
    required: false,
    enum: UserRole,
    description: 'Lọc theo loại người dùng (reader hoặc admin)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách người dùng thành công.',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async findAll(
    @Query() filterQuery: FilterUsersDto,
  ): Promise<PaginatedResponseDto<User>> {
    return this.usersService.findAll(filterQuery);
  }

  // SEARCH - Tìm kiếm users
  @Get('search')
  // @Roles('admin')
  @ApiOperation({
    summary:
      'Tìm kiếm người dùng theo tên đăng nhập, email hoặc tên độc giả (Admin)',
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
    description: 'Tìm kiếm người dùng thành công.',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async search(
    @Query('q') query: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<User>> {
    return this.usersService.search(query, paginationQuery);
  }

  // FILTER - Get users by role
  @Get('role/:role')
  // @Roles('admin')
  @ApiOperation({ summary: 'Lấy danh sách người dùng theo vai trò (Admin)' })
  @ApiParam({ name: 'role', description: 'Vai trò người dùng', enum: UserRole })
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
    description: 'Lấy danh sách người dùng thành công.',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async findByRole(
    @Param('role') role: UserRole,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<User>> {
    return this.usersService.findByRole(role, paginationQuery);
  }

  // FILTER - Get users by account status
  @Get('status/:status')
  // @Roles('admin')
  @ApiOperation({
    summary: 'Lấy danh sách người dùng theo trạng thái tài khoản (Admin)',
  })
  @ApiParam({
    name: 'status',
    description: 'Trạng thái tài khoản',
    enum: AccountStatus,
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
    description: 'Lấy danh sách người dùng thành công.',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async findByAccountStatus(
    @Param('status') status: AccountStatus,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<User>> {
    return this.usersService.findByAccountStatus(status, paginationQuery);
  }

  // READ ONE - Tìm user theo username
  @Get('username/:username')
  // @Roles('admin')
  @ApiOperation({
    summary: 'Lấy thông tin người dùng theo tên đăng nhập (Admin)',
  })
  @ApiParam({ name: 'username', description: 'Tên đăng nhập' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin người dùng thành công.',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async findByUsername(@Param('username') username: string): Promise<User> {
    return this.usersService.findByUsername(username);
  }

  // READ ONE - Tìm user theo email
  @Get('email/:email')
  // @Roles('admin')
  @ApiOperation({ summary: 'Lấy thông tin người dùng theo email (Admin)' })
  @ApiParam({ name: 'email', description: 'Địa chỉ email' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin người dùng thành công.',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async findByEmail(@Param('email') email: string): Promise<User> {
    return this.usersService.findByEmail(email);
  }

  // READ ONE - Tìm user theo ID
  @Get(':id')
  // @Roles('admin')
  @ApiOperation({ summary: 'Lấy thông tin người dùng theo ID (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của người dùng' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin người dùng thành công.',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  // UPDATE - Cập nhật user
  @Patch(':id')
  // @Roles('admin')
  @ApiOperation({ summary: 'Cập nhật thông tin người dùng theo ID (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của người dùng' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thông tin người dùng thành công.',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({
    status: 409,
    description: 'Tên đăng nhập hoặc email đã tồn tại.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  // UTILITY - Suspend user
  @Patch(':id/suspend')
  // @Roles('admin')
  @ApiOperation({ summary: 'Tạm khóa tài khoản người dùng (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của người dùng' })
  @ApiResponse({
    status: 200,
    description: 'Tạm khóa tài khoản thành công.',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async suspendUser(@Param('id') id: string): Promise<User> {
    return this.usersService.suspendUser(id);
  }

  // UTILITY - Reactivate user
  @Patch(':id/reactivate')
  // @Roles('admin')
  @ApiOperation({ summary: 'Kích hoạt lại tài khoản người dùng (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của người dùng' })
  @ApiResponse({
    status: 200,
    description: 'Kích hoạt lại tài khoản thành công.',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async reactivateUser(@Param('id') id: string): Promise<User> {
    return this.usersService.reactivateUser(id);
  }

  // UTILITY - Ban user
  @Patch(':id/ban')
  // @Roles('admin')
  @ApiOperation({ summary: 'Cấm tài khoản người dùng (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của người dùng' })
  @ApiResponse({
    status: 200,
    description: 'Cấm tài khoản thành công.',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async banUser(@Param('id') id: string): Promise<User> {
    return this.usersService.banUser(id);
  }

  // UTILITY - Update last login
  @Patch(':id/last-login')
  // @Roles('admin')
  @ApiOperation({ summary: 'Cập nhật thời gian đăng nhập cuối cùng (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của người dùng' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thời gian đăng nhập thành công.',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async updateLastLogin(@Param('id') id: string): Promise<User> {
    return this.usersService.updateLastLogin(id);
  }

  // DELETE - Xóa user
  @Delete(':id')
  // @Roles('admin')
  @ApiOperation({ summary: 'Xóa người dùng theo ID (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của người dùng' })
  @ApiResponse({
    status: 204,
    description: 'Xóa người dùng thành công.',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
