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
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  PaginatedResponseDto,
  PaginationQueryDto,
} from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateEBookDto } from './dto/create-ebook.dto';
import { UpdateEBookDto } from './dto/update-ebook.dto';
import { EbooksService } from './ebooks.service';
import { EBook } from './entities/ebook.entity';

@ApiTags('Ebooks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ebooks')
export class EbooksController {
  constructor(private readonly ebooksService: EbooksService) {}

  // EBook Endpoints
  @Post(':id/ebooks')
  @Roles('admin')
  @ApiOperation({ summary: 'Tạo file ebook cho sách (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của sách' })
  @ApiResponse({
    status: 201,
    description: 'Tạo file ebook thành công.',
    type: EBook,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @HttpCode(HttpStatus.CREATED)
  createEBook(@Body() createEBookDto: CreateEBookDto): Promise<EBook> {
    return this.ebooksService.createEBook(createEBookDto);
  }

  @Get(':id/ebooks')
  @ApiOperation({ summary: 'Lấy danh sách file ebook của sách' })
  @ApiParam({ name: 'id', description: 'UUID của sách' })
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
    description: 'Lấy danh sách file ebook thành công.',
    type: EBook,
    isArray: true,
  })
  findEBooks(
    @Param('id') id: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<EBook>> {
    return this.ebooksService.findEBooks(id, paginationQuery);
  }

  @Patch('ebooks/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Cập nhật file ebook (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của file ebook' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật file ebook thành công.',
    type: EBook,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy file ebook.' })
  updateEBook(
    @Param('id') id: string,
    @Body() updateEBookDto: UpdateEBookDto,
  ): Promise<EBook> {
    return this.ebooksService.updateEBook(id, updateEBookDto);
  }

  @Delete('ebooks/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Xóa file ebook (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của file ebook' })
  @ApiResponse({ status: 204, description: 'Xóa file ebook thành công.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy file ebook.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  removeEBook(@Param('id') id: string): Promise<void> {
    return this.ebooksService.removeEBook(id);
  }

  @Post('ebooks/:id/increment-downloads')
  @ApiOperation({ summary: 'Tăng số lượt tải xuống của file ebook' })
  @ApiParam({ name: 'id', description: 'UUID của file ebook' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật số lượt tải thành công.',
    type: EBook,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy file ebook.' })
  incrementEBookDownloadCount(@Param('id') id: string): Promise<EBook> {
    return this.ebooksService.incrementEBookDownloadCount(id);
  }
}
