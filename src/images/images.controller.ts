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
import { UpdateImageDto } from './dto/update-image.dto';
import { Image } from './entities/image.entity';
import { ImagesService } from './images.service';

@ApiTags('Images - Quản lý Upload Image lên Cloudinary')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload image lên Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload image',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description:
            'Image file cần upload (JPEG, PNG, GIF, WebP - tối đa 10MB)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Upload image thành công.',
    type: Image,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<Image> {
    return this.imagesService.uploadImage(file);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả images đã upload' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách images thành công.' })
  async findAll(): Promise<Image[]> {
    return this.imagesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin image theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của image' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin image thành công.',
    type: Image,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy image.' })
  async findOne(@Param('id') id: string): Promise<Image> {
    return this.imagesService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Lấy thông tin image theo slug' })
  @ApiParam({ name: 'slug', description: 'Slug của image' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin image thành công.',
    type: Image,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy image.' })
  async findBySlug(@Param('slug') slug: string): Promise<Image> {
    return this.imagesService.findBySlug(slug);
  }

  @Get(':id/url')
  @ApiOperation({ summary: 'Lấy URL của image theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của image' })
  @ApiResponse({ status: 200, description: 'Lấy URL image thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy image.' })
  async getImageUrl(
    @Param('id') id: string,
  ): Promise<{ url: string; publicId: string }> {
    return this.imagesService.getImageUrl(id);
  }

  @Get('slug/:slug/url')
  @ApiOperation({ summary: 'Lấy URL của image theo slug' })
  @ApiParam({ name: 'slug', description: 'Slug của image' })
  @ApiResponse({ status: 200, description: 'Lấy URL image thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy image.' })
  async getImageUrlBySlug(
    @Param('slug') slug: string,
  ): Promise<{ url: string; publicId: string }> {
    return this.imagesService.getImageUrlBySlug(slug);
  }

  @Get(':id/transform')
  @ApiOperation({ summary: 'Lấy URL image với transformation theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của image' })
  @ApiResponse({
    status: 200,
    description: 'Lấy URL image với transformation thành công.',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy image.' })
  async getTransformedUrl(@Param('id') id: string): Promise<{ url: string }> {
    const url = await this.imagesService.getTransformedUrl(id, [
      { width: 300, height: 300, crop: 'fill' },
      { quality: 'auto' },
    ]);
    return { url };
  }

  @Get('slug/:slug/transform')
  @ApiOperation({ summary: 'Lấy URL image với transformation theo slug' })
  @ApiParam({ name: 'slug', description: 'Slug của image' })
  @ApiResponse({
    status: 200,
    description: 'Lấy URL image với transformation thành công.',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy image.' })
  async getTransformedUrlBySlug(
    @Param('slug') slug: string,
  ): Promise<{ url: string }> {
    const url = await this.imagesService.getTransformedUrlBySlug(slug, [
      { width: 300, height: 300, crop: 'fill' },
      { quality: 'auto' },
    ]);
    return { url };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin image theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của image' })
  @ApiBody({ type: UpdateImageDto, description: 'Thông tin cập nhật' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật image thành công.',
    type: Image,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy image.' })
  async update(
    @Param('id') id: string,
    @Body() updateImageDto: UpdateImageDto,
  ): Promise<Image> {
    return this.imagesService.update(id, updateImageDto);
  }

  @Patch('slug/:slug')
  @ApiOperation({ summary: 'Cập nhật thông tin image theo slug' })
  @ApiParam({ name: 'slug', description: 'Slug của image' })
  @ApiBody({ type: UpdateImageDto, description: 'Thông tin cập nhật' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật image thành công.',
    type: Image,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy image.' })
  async updateBySlug(
    @Param('slug') slug: string,
    @Body() updateImageDto: UpdateImageDto,
  ): Promise<Image> {
    return this.imagesService.updateBySlug(slug, updateImageDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa image theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của image' })
  @ApiResponse({ status: 204, description: 'Xóa image thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy image.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.imagesService.remove(id);
  }

  @Delete('slug/:slug')
  @ApiOperation({ summary: 'Xóa image theo slug' })
  @ApiParam({ name: 'slug', description: 'Slug của image' })
  @ApiResponse({ status: 204, description: 'Xóa image thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy image.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeBySlug(@Param('slug') slug: string): Promise<void> {
    return this.imagesService.removeBySlug(slug);
  }
}
