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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
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
import { CreateMultipleUsersResponseDto } from './dto/create-multiple-users-response.dto';
import { CreateMultipleUsersDto } from './dto/create-multiple-users.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { FilterUsersDto } from './dto/filter-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UploadExcelResponseDto } from './dto/upload-excel.dto';
import { UserStatsDto } from './dto/user-stats.dto';
import { AccountStatus, User, UserRole } from './entities/user.entity';
import { ExcelService } from './excel.service';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly excelService: ExcelService,
  ) {}

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
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Tìm kiếm theo email, username hoặc userCode',
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

  // CREATE MULTIPLE - Tạo nhiều user cùng lúc
  @Post('bulk')
  // @Roles('admin')
  @ApiOperation({ summary: 'Tạo nhiều người dùng cùng lúc (Admin)' })
  @ApiBody({ type: CreateMultipleUsersDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo nhiều người dùng thành công.',
    type: CreateMultipleUsersResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @HttpCode(HttpStatus.CREATED)
  async createMultiple(
    @Body() createMultipleUsersDto: CreateMultipleUsersDto,
  ): Promise<CreateMultipleUsersResponseDto> {
    return this.usersService.createMultiple(createMultipleUsersDto);
  }

  // UPLOAD EXCEL - Upload Excel file
  @Post('upload-excel')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload file Excel (Admin)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Upload file Excel thành công.',
    type: UploadExcelResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @HttpCode(HttpStatus.CREATED)
  async uploadExcel(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadExcelResponseDto> {
    return this.excelService.parseExcelFile(file);
  }

  // CREATE USERS FROM EXCEL - Tạo users từ dữ liệu Excel đã upload
  @Post('create-from-excel')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Tạo users từ dữ liệu Excel đã upload (Admin)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        excelData: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              useCode: { type: 'string' },
              username: { type: 'string' },
              password: { type: 'string' },
              email: { type: 'string' },
              role: { type: 'string' },
              accountStatus: { type: 'string' },
              dob: { type: 'string' },
              gender: { type: 'string' },
              address: { type: 'string' },
              phone: { type: 'string' },
              readerType: { type: 'string' },
              cardIssueDate: { type: 'string' },
              cardExpriryDate: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo users từ Excel thành công.',
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @HttpCode(HttpStatus.CREATED)
  async createUsersFromExcel(@Body() body: { excelData: any[] }): Promise<any> {
    return this.excelService.createUsersFromExcel(body.excelData);
  }

  // TEST ENDPOINT - Test endpoint để debug
  @Get('test-sync')
  @ApiOperation({ summary: 'Test endpoint để debug sync' })
  @ApiResponse({
    status: 200,
    description: 'Test thành công.',
  })
  async testSync(): Promise<any> {
    console.log('✅ Test sync endpoint called');
    return {
      message: 'Test thành công - API hoạt động',
      timestamp: new Date().toISOString(),
    };
  }

  // SIMPLE TEST ENDPOINT - Test endpoint đơn giản nhất
  @Get('test-simple')
  @ApiOperation({ summary: 'Test endpoint đơn giản nhất' })
  @ApiResponse({
    status: 200,
    description: 'Test đơn giản thành công.',
  })
  async testSimple(): Promise<any> {
    console.log('✅ Simple test endpoint called');
    return 'Simple test OK';
  }

  // DATABASE TEST ENDPOINT - Test database connection
  @Get('test-db')
  @ApiOperation({ summary: 'Test database connection' })
  @ApiResponse({
    status: 200,
    description: 'Test database thành công.',
  })
  async testDatabase(): Promise<any> {
    try {
      console.log('✅ Testing database connection...');
      const userCount = await this.usersService.getUserCount();
      console.log('✅ Database connection successful');
      return {
        message: 'Database connection OK',
        userCount: userCount,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  // GET READER TYPES - Lấy danh sách loại độc giả
  @Get('reader-types')
  @ApiOperation({ summary: 'Lấy danh sách loại độc giả' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách loại độc giả thành công.',
  })
  async getReaderTypes(): Promise<any> {
    return this.usersService.getReaderTypes();
  }

  // CREATE READER FOR USER - Tạo reader cho user
  @Post(':id/reader')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Tạo reader cho user (Admin)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fullName: { type: 'string' },
        dob: { type: 'string', format: 'date' },
        gender: { type: 'string', enum: ['male', 'female', 'other'] },
        address: { type: 'string' },
        phone: { type: 'string' },
        cardNumber: { type: 'string' },
        cardIssueDate: { type: 'string', format: 'date' },
        cardExpiryDate: { type: 'string', format: 'date' },
        readerTypeName: {
          type: 'string',
          enum: ['student', 'teacher', 'staff'],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo reader thành công.',
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'User không tồn tại.' })
  @HttpCode(HttpStatus.CREATED)
  async createReaderForUser(
    @Param('id') userId: string,
    @Body() readerData: any,
  ): Promise<any> {
    return this.usersService.createReaderForUser(userId, readerData);
  }

  // SYNC USERCODE TO CARDNUMBER - Sync userCode sang cardNumber
  @Post('sync-usercode-to-cardnumber')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Sync userCode sang cardNumber cho tất cả users (Admin)',
  })
  @ApiResponse({
    status: 200,
    description: 'Sync userCode sang cardNumber thành công.',
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @HttpCode(HttpStatus.OK)
  async syncUserCodeToCardNumber(): Promise<any> {
    try {
      return await this.excelService.syncUserCodeToCardNumber();
    } catch (error) {
      console.error('Sync error:', error);
      throw error;
    }
  }

  // STATS BY DATE RANGE - Thống kê người dùng theo khoảng thời gian
  @Get('stats-date-range')
  @ApiOperation({ summary: 'Lấy thống kê người dùng theo khoảng thời gian' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    description: 'Ngày bắt đầu (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    description: 'Ngày kết thúc (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê theo khoảng thời gian thành công.',
  })
  @ApiResponse({ status: 400, description: 'Ngày không hợp lệ.' })
  async getStatsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<any> {
    try {
      console.log(`✅ Getting statistics from ${startDate} to ${endDate}`);
      const stats = await this.usersService.getStatsByDateRange(
        startDate,
        endDate,
      );
      console.log('✅ Date range statistics retrieved successfully');
      return stats;
    } catch (error) {
      console.error('❌ Error getting date range statistics:', error);
      throw error;
    }
  }

  // STATS BY ROLE - Thống kê người dùng theo vai trò
  @Get('stats-role/:role')
  @ApiOperation({ summary: 'Lấy thống kê người dùng theo vai trò' })
  @ApiParam({ name: 'role', description: 'Vai trò người dùng', enum: UserRole })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê theo vai trò thành công.',
  })
  @ApiResponse({ status: 400, description: 'Vai trò không hợp lệ.' })
  async getStatsByRole(@Param('role') role: UserRole): Promise<any> {
    try {
      console.log(`✅ Getting statistics for role: ${role}`);
      const stats = await this.usersService.getStatsByRole(role);
      console.log('✅ Role statistics retrieved successfully');
      return stats;
    } catch (error) {
      console.error('❌ Error getting role statistics:', error);
      throw error;
    }
  }

  // STATS BY STATUS - Thống kê người dùng theo trạng thái
  @Get('stats-status/:status')
  @ApiOperation({
    summary: 'Lấy thống kê người dùng theo trạng thái tài khoản',
  })
  @ApiParam({
    name: 'status',
    description: 'Trạng thái tài khoản',
    enum: AccountStatus,
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê theo trạng thái thành công.',
  })
  @ApiResponse({ status: 400, description: 'Trạng thái không hợp lệ.' })
  async getStatsByStatus(@Param('status') status: AccountStatus): Promise<any> {
    try {
      console.log(`✅ Getting statistics for status: ${status}`);
      const stats = await this.usersService.getStatsByStatus(status);
      console.log('✅ Status statistics retrieved successfully');
      return stats;
    } catch (error) {
      console.error('❌ Error getting status statistics:', error);
      throw error;
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Lấy thống kê chi tiết người dùng' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê người dùng thành công.',
    schema: {
      type: 'object',
      properties: {
        totalUsers: { type: 'number', example: 150 },
        usersByRole: {
          type: 'object',
          properties: {
            admin: { type: 'number', example: 5 },
            reader: { type: 'number', example: 145 },
          },
        },
        usersByStatus: {
          type: 'object',
          properties: {
            active: { type: 'number', example: 140 },
            suspended: { type: 'number', example: 8 },
            banned: { type: 'number', example: 2 },
          },
        },
        newUsersLast30Days: { type: 'number', example: 25 },
        activeUsersLast7Days: { type: 'number', example: 45 },
        neverLoggedInUsers: { type: 'number', example: 12 },
        monthlyStats: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              month: { type: 'string', example: '2024-01' },
              count: { type: 'number', example: 10 },
            },
          },
        },
        generatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Lỗi server khi lấy thống kê.' })
  async getUserStats(): Promise<UserStatsDto> {
    try {
      const stats = await this.usersService.getUserStats();
      return stats;
    } catch (error) {
      console.error('❌ Error getting user statistics:', error);
      throw error;
    }
  }

  // READ ONE - Tìm user theo ID (phải đặt cuối cùng để tránh conflict với các route khác)
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

  // UPDATE - Cập nhật user (phải đặt cuối cùng để tránh conflict với các route khác)
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

  // DELETE - Xóa user (phải đặt cuối cùng để tránh conflict với các route khác)
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
