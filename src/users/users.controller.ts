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
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AccountStatus, User, UserRole } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // CREATE - Tạo user mới
  @Post()
  @ApiOperation({ summary: 'Tạo mới người dùng' })
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
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  // READ ALL - Danh sách users
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách người dùng có phân trang' })
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
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<User>> {
    return this.usersService.findAll(paginationQuery);
  }

  // SEARCH - Tìm kiếm users
  @Get('search')
  @ApiOperation({
    summary: 'Tìm kiếm người dùng theo tên đăng nhập, email hoặc tên độc giả',
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
  async search(
    @Query('q') query: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<User>> {
    return this.usersService.search(query, paginationQuery);
  }

  // FILTER - Get users by role
  @Get('role/:role')
  @ApiOperation({ summary: 'Lấy danh sách người dùng theo vai trò' })
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
  async findByRole(
    @Param('role') role: UserRole,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<User>> {
    return this.usersService.findByRole(role, paginationQuery);
  }

  // FILTER - Get users by account status
  @Get('status/:status')
  @ApiOperation({
    summary: 'Lấy danh sách người dùng theo trạng thái tài khoản',
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
  async findByAccountStatus(
    @Param('status') status: AccountStatus,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<User>> {
    return this.usersService.findByAccountStatus(status, paginationQuery);
  }

  // READ ONE - Tìm user theo username
  @Get('username/:username')
  @ApiOperation({ summary: 'Lấy thông tin người dùng theo tên đăng nhập' })
  @ApiParam({ name: 'username', description: 'Tên đăng nhập' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin người dùng thành công.',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  async findByUsername(@Param('username') username: string): Promise<User> {
    return this.usersService.findByUsername(username);
  }

  // READ ONE - Tìm user theo email
  @Get('email/:email')
  @ApiOperation({ summary: 'Lấy thông tin người dùng theo email' })
  @ApiParam({ name: 'email', description: 'Địa chỉ email' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin người dùng thành công.',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  async findByEmail(@Param('email') email: string): Promise<User> {
    return this.usersService.findByEmail(email);
  }

  // READ ONE - Tìm user theo ID
  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin người dùng theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của người dùng' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin người dùng thành công.',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  // UPDATE - Cập nhật user
  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin người dùng theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của người dùng' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thông tin người dùng thành công.',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
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
  @ApiOperation({ summary: 'Tạm khóa tài khoản người dùng' })
  @ApiParam({ name: 'id', description: 'UUID của người dùng' })
  @ApiResponse({
    status: 200,
    description: 'Tạm khóa tài khoản thành công.',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  async suspendUser(@Param('id') id: string): Promise<User> {
    return this.usersService.suspendUser(id);
  }

  // UTILITY - Reactivate user
  @Patch(':id/reactivate')
  @ApiOperation({ summary: 'Kích hoạt lại tài khoản người dùng' })
  @ApiParam({ name: 'id', description: 'UUID của người dùng' })
  @ApiResponse({
    status: 200,
    description: 'Kích hoạt lại tài khoản thành công.',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  async reactivateUser(@Param('id') id: string): Promise<User> {
    return this.usersService.reactivateUser(id);
  }

  // UTILITY - Ban user
  @Patch(':id/ban')
  @ApiOperation({ summary: 'Cấm tài khoản người dùng' })
  @ApiParam({ name: 'id', description: 'UUID của người dùng' })
  @ApiResponse({
    status: 200,
    description: 'Cấm tài khoản thành công.',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  async banUser(@Param('id') id: string): Promise<User> {
    return this.usersService.banUser(id);
  }

  // UTILITY - Update last login
  @Patch(':id/last-login')
  @ApiOperation({ summary: 'Cập nhật thời gian đăng nhập cuối cùng' })
  @ApiParam({ name: 'id', description: 'UUID của người dùng' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thời gian đăng nhập thành công.',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  async updateLastLogin(@Param('id') id: string): Promise<User> {
    return this.usersService.updateLastLogin(id);
  }

  // DELETE - Xóa user
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa người dùng theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của người dùng' })
  @ApiResponse({
    status: 204,
    description: 'Xóa người dùng thành công.',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
