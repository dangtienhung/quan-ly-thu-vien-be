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
import { CreateReaderDto } from './dto/create-reader.dto';
import { UpdateReaderDto } from './dto/update-reader.dto';
import { Reader } from './entities/reader.entity';
import { ReadersService } from './readers.service';

@ApiTags('Readers')
@Controller('readers')
export class ReadersController {
  constructor(private readonly readersService: ReadersService) {}

  // CREATE - Tạo reader mới
  @Post()
  @ApiOperation({ summary: 'Create a new reader profile' })
  @ApiBody({ type: CreateReaderDto })
  @ApiResponse({
    status: 201,
    description: 'Reader created successfully.',
    type: Reader,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({
    status: 409,
    description: 'User already has a reader profile or card number exists.',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createReaderDto: CreateReaderDto): Promise<Reader> {
    return this.readersService.create(createReaderDto);
  }

  // READ ALL - Danh sách readers
  @Get()
  @ApiOperation({ summary: 'Get all readers with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiResponse({ status: 200, description: 'Readers retrieved successfully.' })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Reader>> {
    return this.readersService.findAll(paginationQuery);
  }

  // SEARCH - Tìm kiếm readers
  @Get('search')
  @ApiOperation({
    summary: 'Search readers by name, card number, phone, username, or email',
  })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully.',
  })
  async search(
    @Query('q') query: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Reader>> {
    return this.readersService.search(query, paginationQuery);
  }

  // UTILITY - Get expired cards
  @Get('expired-cards')
  @ApiOperation({ summary: 'Get readers with expired cards' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Expired cards retrieved successfully.',
  })
  async getExpiredCards(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Reader>> {
    return this.readersService.getExpiredCards(paginationQuery);
  }

  // UTILITY - Get cards expiring soon
  @Get('expiring-soon')
  @ApiOperation({ summary: 'Get readers with cards expiring soon' })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Number of days to check (default: 30)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Cards expiring soon retrieved successfully.',
  })
  async getCardsExpiringSoon(
    @Query('days') days: number = 30,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Reader>> {
    return this.readersService.getCardsExpiringSoon(days, paginationQuery);
  }

  // UTILITY - Generate card number
  @Get('generate-card-number')
  @ApiOperation({ summary: 'Generate a new card number' })
  @ApiResponse({
    status: 200,
    description: 'Card number generated successfully.',
  })
  async generateCardNumber(): Promise<{ cardNumber: string }> {
    const cardNumber = await this.readersService.generateCardNumber();
    return { cardNumber };
  }

  // FILTER - Get readers by type
  @Get('type/:readerTypeId')
  @ApiOperation({ summary: 'Get readers by reader type' })
  @ApiParam({ name: 'readerTypeId', description: 'Reader type UUID' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiResponse({ status: 200, description: 'Readers retrieved successfully.' })
  async getReadersByType(
    @Param('readerTypeId') readerTypeId: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Reader>> {
    return this.readersService.getReadersByType(readerTypeId, paginationQuery);
  }

  // READ ONE - Tìm reader theo user ID
  @Get('user/:userId')
  @ApiOperation({ summary: 'Get a reader by user ID' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiResponse({
    status: 200,
    description: 'Reader retrieved successfully.',
    type: Reader,
  })
  @ApiResponse({ status: 404, description: 'Reader not found.' })
  async findByUserId(@Param('userId') userId: string): Promise<Reader> {
    return this.readersService.findByUserId(userId);
  }

  // READ ONE - Tìm reader theo card number
  @Get('card/:cardNumber')
  @ApiOperation({ summary: 'Get a reader by card number' })
  @ApiParam({ name: 'cardNumber', description: 'Library card number' })
  @ApiResponse({
    status: 200,
    description: 'Reader retrieved successfully.',
    type: Reader,
  })
  @ApiResponse({ status: 404, description: 'Reader not found.' })
  async findByCardNumber(
    @Param('cardNumber') cardNumber: string,
  ): Promise<Reader> {
    return this.readersService.findByCardNumber(cardNumber);
  }

  // READ ONE - Tìm reader theo ID
  @Get(':id')
  @ApiOperation({ summary: 'Get a reader by ID' })
  @ApiParam({ name: 'id', description: 'Reader UUID' })
  @ApiResponse({
    status: 200,
    description: 'Reader retrieved successfully.',
    type: Reader,
  })
  @ApiResponse({ status: 404, description: 'Reader not found.' })
  async findOne(@Param('id') id: string): Promise<Reader> {
    return this.readersService.findOne(id);
  }

  // UPDATE - Cập nhật reader
  @Patch(':id')
  @ApiOperation({ summary: 'Update a reader by ID' })
  @ApiParam({ name: 'id', description: 'Reader UUID' })
  @ApiBody({ type: UpdateReaderDto })
  @ApiResponse({
    status: 200,
    description: 'Reader updated successfully.',
    type: Reader,
  })
  @ApiResponse({ status: 404, description: 'Reader not found.' })
  @ApiResponse({ status: 409, description: 'Card number already exists.' })
  async update(
    @Param('id') id: string,
    @Body() updateReaderDto: UpdateReaderDto,
  ): Promise<Reader> {
    return this.readersService.update(id, updateReaderDto);
  }

  // UTILITY - Activate reader
  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate a reader account' })
  @ApiParam({ name: 'id', description: 'Reader UUID' })
  @ApiResponse({
    status: 200,
    description: 'Reader activated successfully.',
    type: Reader,
  })
  @ApiResponse({ status: 404, description: 'Reader not found.' })
  async activateReader(@Param('id') id: string): Promise<Reader> {
    return this.readersService.activateReader(id);
  }

  // UTILITY - Deactivate reader
  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate a reader account' })
  @ApiParam({ name: 'id', description: 'Reader UUID' })
  @ApiResponse({
    status: 200,
    description: 'Reader deactivated successfully.',
    type: Reader,
  })
  @ApiResponse({ status: 404, description: 'Reader not found.' })
  async deactivateReader(@Param('id') id: string): Promise<Reader> {
    return this.readersService.deactivateReader(id);
  }

  // UTILITY - Check if card is expired
  @Get(':id/card-expired')
  @ApiOperation({ summary: 'Check if reader card is expired' })
  @ApiParam({ name: 'id', description: 'Reader UUID' })
  @ApiResponse({
    status: 200,
    description: 'Card expiry status retrieved successfully.',
  })
  @ApiResponse({ status: 404, description: 'Reader not found.' })
  async isCardExpired(
    @Param('id') id: string,
  ): Promise<{ isExpired: boolean }> {
    const isExpired = await this.readersService.isCardExpired(id);
    return { isExpired };
  }

  // UTILITY - Renew card
  @Patch(':id/renew-card')
  @ApiOperation({ summary: 'Renew reader card expiry date' })
  @ApiParam({ name: 'id', description: 'Reader UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        newExpiryDate: {
          type: 'string',
          format: 'date',
          example: '2025-01-01',
        },
      },
      required: ['newExpiryDate'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Card renewed successfully.',
    type: Reader,
  })
  @ApiResponse({ status: 404, description: 'Reader not found.' })
  @ApiResponse({ status: 400, description: 'Invalid expiry date.' })
  async renewCard(
    @Param('id') id: string,
    @Body() body: { newExpiryDate: string },
  ): Promise<Reader> {
    return this.readersService.renewCard(id, body.newExpiryDate);
  }

  // DELETE - Xóa reader
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a reader by ID' })
  @ApiParam({ name: 'id', description: 'Reader UUID' })
  @ApiResponse({ status: 204, description: 'Reader deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Reader not found.' })
  @ApiResponse({
    status: 409,
    description: 'Cannot delete reader with active borrowed books.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.readersService.remove(id);
  }
}
