import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BookGradeLevelsService } from './book-grade-levels.service';
import {
  BulkSetBookGradeLevelsDto,
  CreateBookGradeLevelDto,
} from './dto/create-book-grade-level.dto';
import { BookGradeLevel } from './entities/book-grade-level.entity';

@ApiTags('Book Grade Levels - Liên kết Sách - Khối lớp')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
// @Roles('admin')
@Controller('book-grade-levels')
export class BookGradeLevelsController {
  constructor(private readonly service: BookGradeLevelsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo liên kết Sách - Khối lớp' })
  @ApiBody({ type: CreateBookGradeLevelDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo liên kết thành công.',
    type: BookGradeLevel,
  })
  @HttpCode(HttpStatus.CREATED)
  async add(@Body() dto: CreateBookGradeLevelDto): Promise<BookGradeLevel> {
    return this.service.add(dto);
  }

  @Delete(':bookId/:gradeLevelId')
  @ApiOperation({ summary: 'Xóa liên kết Sách - Khối lớp' })
  @ApiParam({ name: 'bookId', description: 'UUID của sách' })
  @ApiParam({ name: 'gradeLevelId', description: 'UUID của khối lớp' })
  @ApiResponse({ status: 204, description: 'Xóa liên kết thành công.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('bookId') bookId: string,
    @Param('gradeLevelId') gradeLevelId: string,
  ): Promise<void> {
    return this.service.remove(bookId, gradeLevelId);
  }

  @Get('book/:bookId')
  @ApiOperation({ summary: 'Lấy danh sách khối lớp của một sách' })
  @ApiParam({ name: 'bookId', description: 'UUID của sách' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công.' })
  async listByBook(@Param('bookId') bookId: string): Promise<BookGradeLevel[]> {
    return this.service.listByBook(bookId);
  }

  @Get('grade-level/:gradeLevelId')
  @ApiOperation({ summary: 'Lấy danh sách sách thuộc một khối lớp' })
  @ApiParam({ name: 'gradeLevelId', description: 'UUID của khối lớp' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công.' })
  async listByGradeLevel(
    @Param('gradeLevelId') gradeLevelId: string,
  ): Promise<BookGradeLevel[]> {
    return this.service.listByGradeLevel(gradeLevelId);
  }

  @Post('set-for-book')
  @ApiOperation({
    summary: 'Thiết lập danh sách khối lớp cho một sách (ghi đè)',
  })
  @ApiBody({ type: BulkSetBookGradeLevelsDto })
  @ApiResponse({ status: 200, description: 'Thiết lập thành công.' })
  async setForBook(
    @Body() payload: BulkSetBookGradeLevelsDto,
  ): Promise<{ book_id: string; grade_level_ids: string[] }> {
    return this.service.setForBook(payload);
  }
}
