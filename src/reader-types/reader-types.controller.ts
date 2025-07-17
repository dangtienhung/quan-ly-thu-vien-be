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
import { CreateReaderTypeDto } from './dto/create-reader-type.dto';
import { UpdateReaderTypeDto } from './dto/update-reader-type.dto';
import { ReaderType, ReaderTypeName } from './entities/reader-type.entity';
import { ReaderTypesService } from './reader-types.service';

@ApiTags('Reader Types')
@Controller('reader-types')
export class ReaderTypesController {
  constructor(private readonly readerTypesService: ReaderTypesService) {}

  // CREATE - Tạo reader type mới
  @Post()
  @ApiOperation({ summary: 'Create a new reader type' })
  @ApiBody({ type: CreateReaderTypeDto })
  @ApiResponse({
    status: 201,
    description: 'Reader type created successfully.',
    type: ReaderType,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 409, description: 'Reader type already exists.' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createReaderTypeDto: CreateReaderTypeDto,
  ): Promise<ReaderType> {
    return this.readerTypesService.create(createReaderTypeDto);
  }

  // READ ALL - Danh sách reader types
  @Get()
  @ApiOperation({ summary: 'Get all reader types with pagination' })
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
    description: 'Reader types retrieved successfully.',
  })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ReaderType>> {
    return this.readerTypesService.findAll(paginationQuery);
  }

  // READ ALL - Danh sách reader types không có pagination
  @Get('all')
  @ApiOperation({ summary: 'Get all reader types without pagination' })
  @ApiResponse({
    status: 200,
    description: 'Reader types retrieved successfully.',
  })
  async findAllWithoutPagination(): Promise<ReaderType[]> {
    return this.readerTypesService.findAllWithoutPagination();
  }

  // UTILITY - Get reader type statistics
  @Get('statistics')
  @ApiOperation({ summary: 'Get reader type statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully.',
  })
  async getStatistics(): Promise<any> {
    return this.readerTypesService.getReaderTypeStats();
  }

  // UTILITY - Get default settings
  @Get('default-settings')
  @ApiOperation({ summary: 'Get default reader type settings' })
  @ApiResponse({
    status: 200,
    description: 'Default settings retrieved successfully.',
  })
  async getDefaultSettings(): Promise<any> {
    return this.readerTypesService.getDefaultSettings();
  }

  // UTILITY - Initialize default types
  @Post('initialize-defaults')
  @ApiOperation({ summary: 'Initialize default reader types' })
  @ApiResponse({
    status: 200,
    description: 'Default types initialized successfully.',
  })
  async initializeDefaults(): Promise<{ message: string }> {
    await this.readerTypesService.initializeDefaultTypes();
    return { message: 'Default reader types initialized successfully' };
  }

  // READ ONE - Tìm reader type theo type name
  @Get('type/:typeName')
  @ApiOperation({ summary: 'Get a reader type by type name' })
  @ApiParam({
    name: 'typeName',
    description: 'Reader type name',
    enum: ReaderTypeName,
  })
  @ApiResponse({
    status: 200,
    description: 'Reader type retrieved successfully.',
    type: ReaderType,
  })
  @ApiResponse({ status: 404, description: 'Reader type not found.' })
  async findByTypeName(
    @Param('typeName') typeName: ReaderTypeName,
  ): Promise<ReaderType> {
    return this.readerTypesService.findByTypeName(typeName);
  }

  // READ ONE - Tìm reader type theo ID
  @Get(':id')
  @ApiOperation({ summary: 'Get a reader type by ID' })
  @ApiParam({ name: 'id', description: 'Reader type UUID' })
  @ApiResponse({
    status: 200,
    description: 'Reader type retrieved successfully.',
    type: ReaderType,
  })
  @ApiResponse({ status: 404, description: 'Reader type not found.' })
  async findOne(@Param('id') id: string): Promise<ReaderType> {
    return this.readerTypesService.findOne(id);
  }

  // UPDATE - Cập nhật reader type
  @Patch(':id')
  @ApiOperation({ summary: 'Update a reader type by ID' })
  @ApiParam({ name: 'id', description: 'Reader type UUID' })
  @ApiBody({ type: UpdateReaderTypeDto })
  @ApiResponse({
    status: 200,
    description: 'Reader type updated successfully.',
    type: ReaderType,
  })
  @ApiResponse({ status: 404, description: 'Reader type not found.' })
  @ApiResponse({ status: 409, description: 'Reader type already exists.' })
  async update(
    @Param('id') id: string,
    @Body() updateReaderTypeDto: UpdateReaderTypeDto,
  ): Promise<ReaderType> {
    return this.readerTypesService.update(id, updateReaderTypeDto);
  }

  // DELETE - Xóa reader type
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a reader type by ID' })
  @ApiParam({ name: 'id', description: 'Reader type UUID' })
  @ApiResponse({
    status: 204,
    description: 'Reader type deleted successfully.',
  })
  @ApiResponse({ status: 404, description: 'Reader type not found.' })
  @ApiResponse({
    status: 409,
    description: 'Cannot delete reader type with associated readers.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.readerTypesService.remove(id);
  }
}
