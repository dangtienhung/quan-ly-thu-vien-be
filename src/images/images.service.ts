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

  // Helper method để tạo slug duy nhất
  private async generateUniqueSlug(
    baseSlug: string,
    extension: string,
  ): Promise<{ slug: string; fileName: string }> {
    let finalSlug = baseSlug;
    let finalFileName = `${finalSlug}.${extension}`;
    let counter = 1;

    // Kiểm tra xem slug hoặc fileName đã tồn tại chưa và tạo tên mới nếu cần
    while (true) {
      const existingImage = await this.imageRepository.findOne({
        where: [{ fileName: finalFileName }, { slug: finalSlug }],
      });

      if (!existingImage) {
        break; // Slug và fileName không tồn tại, có thể sử dụng
      }

      // Tạo slug mới với số thứ tự
      finalSlug = `${baseSlug}-${counter}`;
      finalFileName = `${finalSlug}.${extension}`;
      counter++;

      // Giới hạn số lần thử để tránh vòng lặp vô hạn
      if (counter > 100) {
        // Nếu vẫn không tìm được tên duy nhất, thêm timestamp
        const timestamp = Date.now();
        finalSlug = `${baseSlug}-${timestamp}`;
        finalFileName = `${finalSlug}.${extension}`;
        break;
      }
    }

    return { slug: finalSlug, fileName: finalFileName };
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
    const baseSlug = slug(nameWithoutExtension, { lower: true });
    const extension = file.mimetype.split('/')[1];

    // Tạo slug và fileName duy nhất
    const { slug: finalSlug, fileName: finalFileName } =
      await this.generateUniqueSlug(baseSlug, extension);

    try {
      // Upload lên Cloudinary - sử dụng buffer đơn giản
      const uploadResult = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        {
          folder: this.configService.get('CLOUDINARY_FOLDER'),
          public_id: finalSlug, // Sử dụng slug mới để tránh conflict
        },
      );

      // Tạo record trong database
      const image = this.imageRepository.create({
        originalName,
        fileName: finalFileName, // Sử dụng tên file mới
        slug: finalSlug, // Sử dụng slug mới
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

      // Kiểm tra xem có phải lỗi duplicate key không
      if (
        error.message &&
        error.message.includes('duplicate key value violates unique constraint')
      ) {
        throw new BadRequestException(
          'Image với tên này đã tồn tại. Vui lòng thử lại với tên khác.',
        );
      }

      throw new BadRequestException(
        `Lỗi khi upload lên Cloudinary: ${error.message || 'Unknown error'}`,
      );
    }
  }

  // Kiểm tra và xóa duplicate records (nếu cần)
  async cleanupDuplicates(): Promise<{ deleted: number; message: string }> {
    try {
      // Tìm các records có slug trùng lặp
      const duplicates = await this.imageRepository
        .createQueryBuilder('image')
        .select('image.slug')
        .addSelect('COUNT(*)', 'count')
        .groupBy('image.slug')
        .having('COUNT(*) > 1')
        .getRawMany();

      if (duplicates.length === 0) {
        return { deleted: 0, message: 'Không có duplicate records nào' };
      }

      let deletedCount = 0;
      for (const duplicate of duplicates) {
        // Lấy tất cả records với slug trùng lặp, sắp xếp theo thời gian tạo
        const duplicateRecords = await this.imageRepository.find({
          where: { slug: duplicate.slug },
          order: { createdAt: 'ASC' },
        });

        // Giữ lại record đầu tiên, xóa các record còn lại
        for (let i = 1; i < duplicateRecords.length; i++) {
          const record = duplicateRecords[i];

          try {
            // Xóa image từ Cloudinary
            await cloudinary.uploader.destroy(record.cloudinaryPublicId);
          } catch (error) {
            console.error(`Lỗi khi xóa image từ Cloudinary: ${error.message}`);
          }

          // Xóa record từ database
          await this.imageRepository.remove(record);
          deletedCount++;
        }
      }

      return {
        deleted: deletedCount,
        message: `Đã xóa ${deletedCount} duplicate records`,
      };
    } catch (error) {
      console.error('Lỗi khi cleanup duplicates:', error);
      throw new BadRequestException(
        `Lỗi khi cleanup duplicates: ${error.message || 'Unknown error'}`,
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

  // Kiểm tra xem có thể upload image với tên này không
  async canUploadImage(fileName: string): Promise<{
    canUpload: boolean;
    suggestedFileName?: string;
    reason?: string;
  }> {
    const existingImage = await this.imageRepository.findOne({
      where: { fileName },
    });

    if (!existingImage) {
      return { canUpload: true };
    }

    // Tạo tên file gợi ý
    const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, '');
    const extension = fileName.split('.').pop();
    const timestamp = Date.now();
    const suggestedFileName = `${nameWithoutExtension}-${timestamp}.${extension}`;

    return {
      canUpload: false,
      suggestedFileName,
      reason: 'Image với tên này đã tồn tại',
    };
  }
}
