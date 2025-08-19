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
import { CreateReaderDto } from './dto/create-reader.dto';
import { ReadersQueryDto } from './dto/readers-query.dto';
import { UpdateReaderDto } from './dto/update-reader.dto';
import { Reader } from './entities/reader.entity';
import { ReadersService } from './readers.service';

@ApiTags('Readers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
// // @Roles('admin')
@Controller('readers')
export class ReadersController {
  constructor(private readonly readersService: ReadersService) {}

  // CREATE - Tạo reader mới
  @Post()
  @ApiOperation({ summary: 'Tạo hồ sơ độc giả mới' })
  @ApiBody({ type: CreateReaderDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo hồ sơ độc giả thành công.',
    type: Reader,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  @ApiResponse({
    status: 409,
    description: 'Người dùng đã có hồ sơ độc giả hoặc số thẻ đã tồn tại.',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createReaderDto: CreateReaderDto): Promise<Reader> {
    return this.readersService.create(createReaderDto);
  }

  // READ ALL - Danh sách readers
  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách độc giả có phân trang và lọc theo các tiêu chí',
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
  @ApiQuery({
    name: 'cardNumber',
    required: false,
    type: String,
    description: 'Lọc theo số thẻ thư viện',
  })
  @ApiQuery({
    name: 'cardExpiryDateFrom',
    required: false,
    type: String,
    description: 'Lọc theo ngày hết hạn thẻ (từ ngày) - format: YYYY-MM-DD',
  })
  @ApiQuery({
    name: 'cardExpiryDateTo',
    required: false,
    type: String,
    description: 'Lọc theo ngày hết hạn thẻ (đến ngày) - format: YYYY-MM-DD',
  })
  @ApiQuery({
    name: 'phone',
    required: false,
    type: String,
    description: 'Lọc theo số điện thoại',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách độc giả thành công.',
  })
  async findAll(
    @Query() query: ReadersQueryDto,
  ): Promise<PaginatedResponseDto<Reader>> {
    return this.readersService.findAll(query);
  }

  // SEARCH - Tìm kiếm readers
  @Get('search')
  @ApiOperation({
    summary:
      'Tìm kiếm độc giả theo tên, số thẻ, số điện thoại, tên đăng nhập hoặc email',
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
    description: 'Tìm kiếm độc giả thành công.',
  })
  async search(
    @Query('q') query: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Reader>> {
    return this.readersService.search(query, paginationQuery);
  }

  // UTILITY - Get expired cards
  @Get('expired-cards')
  @ApiOperation({ summary: 'Lấy danh sách độc giả có thẻ đã hết hạn' })
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
    description: 'Lấy danh sách thẻ hết hạn thành công.',
  })
  async getExpiredCards(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Reader>> {
    return this.readersService.getExpiredCards(paginationQuery);
  }

  // UTILITY - Get cards expiring soon
  @Get('expiring-soon')
  @ApiOperation({ summary: 'Lấy danh sách độc giả có thẻ sắp hết hạn' })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Số ngày kiểm tra trước (mặc định: 30)',
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
    description: 'Lấy danh sách thẻ sắp hết hạn thành công.',
  })
  async getCardsExpiringSoon(
    @Query('days') days: number = 30,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Reader>> {
    return this.readersService.getCardsExpiringSoon(days, paginationQuery);
  }

  // UTILITY - Generate card number
  @Get('generate-card-number')
  @ApiOperation({ summary: 'Tạo số thẻ thư viện mới' })
  @ApiResponse({
    status: 200,
    description: 'Tạo số thẻ thành công.',
  })
  async generateCardNumber(): Promise<{ cardNumber: string }> {
    const cardNumber = await this.readersService.generateCardNumber();
    return { cardNumber };
  }

  // FILTER - Get readers by type
  @Get('type/:readerTypeId')
  @ApiOperation({ summary: 'Lấy danh sách độc giả theo loại độc giả' })
  @ApiParam({ name: 'readerTypeId', description: 'UUID của loại độc giả' })
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
    description: 'Lấy danh sách độc giả thành công.',
  })
  async getReadersByType(
    @Param('readerTypeId') readerTypeId: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Reader>> {
    return this.readersService.getReadersByType(readerTypeId, paginationQuery);
  }

  // READ ONE - Tìm reader theo user ID
  @Get('user/:userId')
  @ApiOperation({ summary: 'Lấy thông tin độc giả theo ID người dùng' })
  @ApiParam({ name: 'userId', description: 'UUID của người dùng' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin độc giả thành công.',
    type: Reader,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy độc giả.' })
  async findByUserId(@Param('userId') userId: string): Promise<Reader> {
    return this.readersService.findByUserId(userId);
  }

  // READ ONE - Tìm reader theo card number
  @Get('card/:cardNumber')
  @ApiOperation({ summary: 'Lấy thông tin độc giả theo số thẻ thư viện' })
  @ApiParam({ name: 'cardNumber', description: 'Số thẻ thư viện' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin độc giả thành công.',
    type: Reader,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy độc giả.' })
  async findByCardNumber(
    @Param('cardNumber') cardNumber: string,
  ): Promise<Reader> {
    return this.readersService.findByCardNumber(cardNumber);
  }

  // READ ONE - Tìm reader theo ID
  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin độc giả theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của độc giả' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin độc giả thành công.',
    type: Reader,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy độc giả.' })
  async findOne(@Param('id') id: string): Promise<Reader> {
    return this.readersService.findOne(id);
  }

  // UPDATE - Cập nhật reader
  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin độc giả theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của độc giả' })
  @ApiBody({ type: UpdateReaderDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thông tin độc giả thành công.',
    type: Reader,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy độc giả.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  async update(
    @Param('id') id: string,
    @Body() updateReaderDto: UpdateReaderDto,
  ): Promise<Reader> {
    return this.readersService.update(id, updateReaderDto);
  }

  // UTILITY - Activate reader
  @Patch(':id/activate')
  @ApiOperation({ summary: 'Kích hoạt thẻ độc giả' })
  @ApiParam({ name: 'id', description: 'UUID của độc giả' })
  @ApiResponse({
    status: 200,
    description: 'Kích hoạt thẻ độc giả thành công.',
    type: Reader,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy độc giả.' })
  async activateReader(@Param('id') id: string): Promise<Reader> {
    return this.readersService.activateReader(id);
  }

  // UTILITY - Deactivate reader
  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Vô hiệu hóa thẻ độc giả' })
  @ApiParam({ name: 'id', description: 'UUID của độc giả' })
  @ApiResponse({
    status: 200,
    description: 'Vô hiệu hóa thẻ độc giả thành công.',
    type: Reader,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy độc giả.' })
  async deactivateReader(@Param('id') id: string): Promise<Reader> {
    return this.readersService.deactivateReader(id);
  }

  // UTILITY - Check card expiry
  @Get(':id/check-expiry')
  @ApiOperation({ summary: 'Kiểm tra thẻ độc giả có hết hạn không' })
  @ApiParam({ name: 'id', description: 'UUID của độc giả' })
  @ApiResponse({
    status: 200,
    description: 'Kiểm tra hạn thẻ thành công.',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy độc giả.' })
  async isCardExpired(
    @Param('id') id: string,
  ): Promise<{ isExpired: boolean }> {
    const isExpired = await this.readersService.isCardExpired(id);
    return { isExpired };
  }

  // UTILITY - Renew card
  @Patch(':id/renew-card')
  @ApiOperation({ summary: 'Gia hạn thẻ độc giả' })
  @ApiParam({ name: 'id', description: 'UUID của độc giả' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        newExpiryDate: {
          type: 'string',
          format: 'date',
          description: 'Ngày hết hạn mới của thẻ (YYYY-MM-DD)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Gia hạn thẻ độc giả thành công.',
    type: Reader,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy độc giả.' })
  @ApiResponse({ status: 400, description: 'Ngày hết hạn không hợp lệ.' })
  async renewCard(
    @Param('id') id: string,
    @Body() body: { newExpiryDate: string },
  ): Promise<Reader> {
    return this.readersService.renewCard(id, body.newExpiryDate);
  }

  // DELETE - Xóa reader
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa hồ sơ độc giả' })
  @ApiParam({ name: 'id', description: 'UUID của độc giả' })
  @ApiResponse({
    status: 204,
    description: 'Xóa hồ sơ độc giả thành công.',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy độc giả.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.readersService.remove(id);
  }
}
