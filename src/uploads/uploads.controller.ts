import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { UpdateUploadDto } from './dto/update-upload.dto';
import { Upload } from './entities/upload.entity';
import { UploadsService } from './uploads.service';

@ApiTags('Uploads - Quản lý Upload File PDF')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload file PDF mới' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload file PDF',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File PDF cần upload (tối đa 20MB)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Upload file thành công.',
    type: Upload,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }), // 20MB
          new FileTypeValidator({ fileType: 'application/pdf' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<Upload> {
    return this.uploadsService.uploadFile(file);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả file đã upload' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách file thành công.' })
  async findAll(): Promise<Upload[]> {
    return this.uploadsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin file theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của file upload' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin file thành công.',
    type: Upload,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy file.' })
  async findOne(@Param('id') id: string): Promise<Upload> {
    return this.uploadsService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Lấy thông tin file theo slug' })
  @ApiParam({ name: 'slug', description: 'Slug của file' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin file thành công.',
    type: Upload,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy file.' })
  async findBySlug(@Param('slug') slug: string): Promise<Upload> {
    return this.uploadsService.findBySlug(slug);
  }

  @Get('file/*')
  @ApiOperation({ summary: 'Truy cập file trực tiếp theo đường dẫn' })
  @ApiParam({
    name: 'path',
    description: 'Đường dẫn file (ví dụ: files/tai-lieu-mau.pdf)',
  })
  @ApiResponse({ status: 200, description: 'Truy cập file thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy file.' })
  async serveFile(@Req() req: Request, @Res() res: Response): Promise<void> {
    // Lấy path từ URL, loại bỏ phần /uploads/file/ từ đầu
    const fullPath = req.url;
    const filePath = fullPath.replace('/file/', '');

    // Kiểm tra filePath có tồn tại không
    if (!filePath || filePath === '') {
      res.status(400).json({
        statusCode: 400,
        message: 'Đường dẫn file không được để trống',
      });
      return;
    }

    const { buffer, fileName, mimeType } =
      await this.uploadsService.getFileByPath(filePath);

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `inline; filename="${fileName}"`,
      'Content-Length': buffer.length,
      'Cache-Control': 'public, max-age=3600', // Cache 1 giờ
    });

    res.send(buffer);
  }

  // Route đơn giản hơn để truy cập file
  @Get('f/:fileName')
  @ApiOperation({ summary: 'Truy cập file đơn giản theo tên file' })
  @ApiParam({
    name: 'fileName',
    description: 'Tên file (ví dụ: tai-lieu-mau.pdf)',
  })
  @ApiResponse({ status: 200, description: 'Truy cập file thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy file.' })
  async serveFileSimple(
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ): Promise<void> {
    const {
      buffer,
      fileName: actualFileName,
      mimeType,
    } = await this.uploadsService.getFileByPath(fileName);

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `inline; filename="${actualFileName}"`,
      'Content-Length': buffer.length,
      'Cache-Control': 'public, max-age=3600', // Cache 1 giờ
    });

    res.send(buffer);
  }

  @Post('import/:fileName')
  @ApiOperation({ summary: 'Import file từ thư mục files vào database' })
  @ApiParam({
    name: 'fileName',
    description: 'Tên file cần import (ví dụ: tai-lieu-mau.pdf)',
  })
  @ApiResponse({
    status: 201,
    description: 'Import file thành công.',
    type: Upload,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy file.' })
  @HttpCode(HttpStatus.CREATED)
  async importFile(@Param('fileName') fileName: string): Promise<Upload> {
    return this.uploadsService.importFileFromDirectory(fileName);
  }

  @Post('import-all')
  @ApiOperation({
    summary: 'Import tất cả file PDF từ thư mục files vào database',
  })
  @ApiResponse({ status: 201, description: 'Import tất cả file thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thư mục files.' })
  @HttpCode(HttpStatus.CREATED)
  async importAllFiles(): Promise<Upload[]> {
    return this.uploadsService.importAllFilesFromDirectory();
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download file theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của file upload' })
  @ApiResponse({ status: 200, description: 'Download file thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy file.' })
  async downloadFile(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, fileName, mimeType } =
      await this.uploadsService.getFileBuffer(id);

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  @Get('slug/:slug/download')
  @ApiOperation({ summary: 'Download file theo slug' })
  @ApiParam({ name: 'slug', description: 'Slug của file' })
  @ApiResponse({ status: 200, description: 'Download file thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy file.' })
  async downloadFileBySlug(
    @Param('slug') slug: string,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, fileName, mimeType } =
      await this.uploadsService.getFileBufferBySlug(slug);

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin file theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của file upload' })
  @ApiBody({ type: UpdateUploadDto, description: 'Thông tin cập nhật' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật file thành công.',
    type: Upload,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy file.' })
  async update(
    @Param('id') id: string,
    @Body() updateUploadDto: UpdateUploadDto,
  ): Promise<Upload> {
    return this.uploadsService.update(id, updateUploadDto);
  }

  @Patch('slug/:slug')
  @ApiOperation({ summary: 'Cập nhật thông tin file theo slug' })
  @ApiParam({ name: 'slug', description: 'Slug của file' })
  @ApiBody({ type: UpdateUploadDto, description: 'Thông tin cập nhật' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật file thành công.',
    type: Upload,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy file.' })
  async updateBySlug(
    @Param('slug') slug: string,
    @Body() updateUploadDto: UpdateUploadDto,
  ): Promise<Upload> {
    return this.uploadsService.updateBySlug(slug, updateUploadDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa file theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của file upload' })
  @ApiResponse({ status: 204, description: 'Xóa file thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy file.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.uploadsService.remove(id);
  }

  @Delete('slug/:slug')
  @ApiOperation({ summary: 'Xóa file theo slug' })
  @ApiParam({ name: 'slug', description: 'Slug của file' })
  @ApiResponse({ status: 204, description: 'Xóa file thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy file.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeBySlug(@Param('slug') slug: string): Promise<void> {
    return this.uploadsService.removeBySlug(slug);
  }
}
