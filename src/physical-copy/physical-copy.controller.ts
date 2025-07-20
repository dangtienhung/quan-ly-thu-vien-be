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
import { BooksService } from 'src/books/books.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  PaginatedResponseDto,
  PaginationQueryDto,
} from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreatePhysicalCopyDto } from './dto/create-physical-copy.dto';
import { UpdatePhysicalCopyDto } from './dto/update-physical-copy.dto';
import { PhysicalCopy } from './entities/physical-copy.entity';
import { PhysicalCopyService } from './physical-copy.service';

@ApiTags('Physical Copies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('physical-copy')
export class PhysicalCopyController {
  constructor(
    private readonly physicalCopyService: PhysicalCopyService,
    private readonly booksService: BooksService,
  ) {}

  // Physical Copy Endpoints

  @Post(':id/physical-copies')
  @Roles('admin')
  @ApiOperation({ summary: 'Tạo bản sao vật lý cho sách (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của sách' })
  @ApiResponse({
    status: 201,
    description: 'Tạo bản sao thành công.',
    type: PhysicalCopy,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @HttpCode(HttpStatus.CREATED)
  createPhysicalCopy(
    @Body() createPhysicalCopyDto: CreatePhysicalCopyDto,
  ): Promise<PhysicalCopy> {
    return this.booksService.createPhysicalCopy(createPhysicalCopyDto);
  }

  @Get(':id/physical-copies')
  @ApiOperation({ summary: 'Lấy danh sách bản sao vật lý của sách' })
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
    description: 'Lấy danh sách bản sao thành công.',
    type: PhysicalCopy,
    isArray: true,
  })
  findPhysicalCopies(
    @Param('id') id: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<PhysicalCopy>> {
    return this.booksService.findPhysicalCopies(id, paginationQuery);
  }

  @Get('physical-copies/barcode/:barcode')
  @ApiOperation({ summary: 'Lấy thông tin bản sao vật lý theo barcode' })
  @ApiParam({ name: 'barcode', description: 'Barcode của bản sao' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin bản sao thành công.',
    type: PhysicalCopy,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bản sao.' })
  findPhysicalCopyByBarcode(
    @Param('barcode') barcode: string,
  ): Promise<PhysicalCopy> {
    return this.booksService.findPhysicalCopyByBarcode(barcode);
  }

  @Patch('physical-copies/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Cập nhật bản sao vật lý (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của bản sao' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật bản sao thành công.',
    type: PhysicalCopy,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bản sao.' })
  updatePhysicalCopy(
    @Param('id') id: string,
    @Body() updatePhysicalCopyDto: UpdatePhysicalCopyDto,
  ): Promise<PhysicalCopy> {
    return this.booksService.updatePhysicalCopy(id, updatePhysicalCopyDto);
  }

  @Delete('physical-copies/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Xóa bản sao vật lý (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của bản sao' })
  @ApiResponse({ status: 204, description: 'Xóa bản sao thành công.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bản sao.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  removePhysicalCopy(@Param('id') id: string): Promise<void> {
    return this.booksService.removePhysicalCopy(id);
  }
}
