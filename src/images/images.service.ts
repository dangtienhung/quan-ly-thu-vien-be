import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { v2 as cloudinary } from 'cloudinary';
import slug from 'slug';
import { Repository } from 'typeorm';
import { UpdateImageDto } from './dto/update-image.dto';
import { Image } from './entities/image.entity';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    private readonly configService: ConfigService,
  ) {
    // Cấu hình Cloudinary
    const cloudName = this.configService.get('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get('CLOUDINARY_API_SECRET');

    console.log('Cloudinary config:', {
      cloudName,
      apiKey: apiKey ? '***' : 'undefined',
      apiSecret: apiSecret ? '***' : 'undefined',
    });

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  // Upload image lên Cloudinary
  async uploadImage(file: Express.Multer.File): Promise<Image> {
    // Kiểm tra file có tồn tại không
    if (!file) {
      throw new BadRequestException('Không có image được upload');
    }

    // Kiểm tra MIME type - chỉ cho phép image
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Chỉ cho phép upload file image (JPEG, PNG, GIF, WebP)',
      );
    }

    // Kiểm tra kích thước file (10MB = 10 * 1024 * 1024 bytes)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('Image không được quá 10MB');
    }

    // Sử dụng tên file gốc từ file upload
    const originalName = file.originalname;

    // Tạo slug từ tên file gốc (loại bỏ phần mở rộng)
    const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, '');
    const imageSlug = slug(nameWithoutExtension, { lower: true });
    const fileName = `${imageSlug}.${file.mimetype.split('/')[1]}`;

    // Kiểm tra xem image đã tồn tại chưa
    const existingImage = await this.imageRepository.findOne({
      where: { fileName },
    });

    if (existingImage) {
      throw new BadRequestException('Image với tên này đã tồn tại');
    }

    try {
      // Upload lên Cloudinary - sử dụng buffer đơn giản
      const uploadResult = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        {
          folder: this.configService.get('CLOUDINARY_FOLDER'),
          public_id: imageSlug,
        },
      );

      // Tạo record trong database
      const image = this.imageRepository.create({
        originalName,
        fileName,
        slug: imageSlug,
        cloudinaryUrl: uploadResult.secure_url,
        cloudinaryPublicId: uploadResult.public_id,
        fileSize: file.size,
        mimeType: file.mimetype,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
      });

      return await this.imageRepository.save(image);
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new BadRequestException(
        `Lỗi khi upload lên Cloudinary: ${error.message || 'Unknown error'}`,
      );
    }
  }

  // Lấy tất cả images
  async findAll(): Promise<Image[]> {
    return await this.imageRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  // Tìm theo ID
  async findOne(id: string): Promise<Image> {
    const image = await this.imageRepository.findOne({ where: { id } });
    if (!image) {
      throw new NotFoundException(`Không tìm thấy image với ID ${id}`);
    }
    return image;
  }

  // Tìm theo slug
  async findBySlug(slug: string): Promise<Image> {
    const image = await this.imageRepository.findOne({ where: { slug } });
    if (!image) {
      throw new NotFoundException(`Không tìm thấy image với slug '${slug}'`);
    }
    return image;
  }

  // Cập nhật image
  async update(id: string, updateImageDto: UpdateImageDto): Promise<Image> {
    const image = await this.findOne(id);
    Object.assign(image, updateImageDto);
    return await this.imageRepository.save(image);
  }

  // Cập nhật image theo slug
  async updateBySlug(
    slug: string,
    updateImageDto: UpdateImageDto,
  ): Promise<Image> {
    const image = await this.findBySlug(slug);
    Object.assign(image, updateImageDto);
    return await this.imageRepository.save(image);
  }

  // Xóa image
  async remove(id: string): Promise<void> {
    const image = await this.findOne(id);

    try {
      // Xóa image từ Cloudinary
      await cloudinary.uploader.destroy(image.cloudinaryPublicId);
    } catch (error) {
      console.error('Lỗi khi xóa image từ Cloudinary:', error.message);
    }

    // Xóa record trong database
    await this.imageRepository.remove(image);
  }

  // Xóa theo slug
  async removeBySlug(slug: string): Promise<void> {
    const image = await this.findBySlug(slug);

    try {
      // Xóa image từ Cloudinary
      await cloudinary.uploader.destroy(image.cloudinaryPublicId);
    } catch (error) {
      console.error('Lỗi khi xóa image từ Cloudinary:', error.message);
    }

    // Xóa record trong database
    await this.imageRepository.remove(image);
  }

  // Lấy URL của image
  async getImageUrl(id: string): Promise<{ url: string; publicId: string }> {
    const image = await this.findOne(id);
    return {
      url: image.cloudinaryUrl,
      publicId: image.cloudinaryPublicId,
    };
  }

  // Lấy URL của image theo slug
  async getImageUrlBySlug(
    slug: string,
  ): Promise<{ url: string; publicId: string }> {
    const image = await this.findBySlug(slug);
    return {
      url: image.cloudinaryUrl,
      publicId: image.cloudinaryPublicId,
    };
  }

  // Tạo URL với transformation
  async getTransformedUrl(id: string, transformation: any): Promise<string> {
    const image = await this.findOne(id);
    return cloudinary.url(image.cloudinaryPublicId, {
      transformation: transformation,
    });
  }

  // Tạo URL với transformation theo slug
  async getTransformedUrlBySlug(
    slug: string,
    transformation: any,
  ): Promise<string> {
    const image = await this.findBySlug(slug);
    return cloudinary.url(image.cloudinaryPublicId, {
      transformation: transformation,
    });
  }
}
