import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import slug from 'slug';
import { Repository } from 'typeorm';
import { UpdateUploadDto } from './dto/update-upload.dto';
import { Upload } from './entities/upload.entity';

@Injectable()
export class UploadsService {
  constructor(
    @InjectRepository(Upload)
    private readonly uploadRepository: Repository<Upload>,
  ) {}

  // Upload file PDF
  async uploadFile(file: Express.Multer.File): Promise<Upload> {
    // Kiểm tra file có tồn tại không
    if (!file) {
      throw new BadRequestException('Không có file được upload');
    }

    // Kiểm tra MIME type - chỉ cho phép PDF
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Chỉ cho phép upload file PDF');
    }

    // Kiểm tra kích thước file (20MB = 20 * 1024 * 1024 bytes)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      throw new BadRequestException('File không được quá 20MB');
    }

    // Sử dụng tên file gốc
    const originalName = file.originalname;

    // Tạo slug từ tên file gốc (loại bỏ phần mở rộng)
    const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, '');
    const fileSlug = slug(nameWithoutExtension, { lower: true });
    const extension = originalName.split('.').pop();
    const fileName = `${fileSlug}.${extension}`;
    const filePath = `files/${fileName}`;

    // Kiểm tra xem file đã tồn tại chưa
    const existingUpload = await this.uploadRepository.findOne({
      where: { fileName },
    });

    if (existingUpload) {
      throw new BadRequestException('File với tên này đã tồn tại');
    }

    // Tạo thư mục files nếu chưa tồn tại
    const uploadDir = path.join(process.cwd(), 'files');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Lưu file vào thư mục files
    const fullPath = path.join(uploadDir, fileName);
    fs.writeFileSync(fullPath, file.buffer);

    // Tạo record trong database
    const upload = this.uploadRepository.create({
      originalName,
      fileName,
      slug: fileSlug,
      filePath,
      fileSize: file.size,
      mimeType: file.mimetype,
    });

    return await this.uploadRepository.save(upload);
  }

  // Lấy tất cả uploads
  async findAll(): Promise<Upload[]> {
    return await this.uploadRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  // Tìm theo ID
  async findOne(id: string): Promise<Upload> {
    const upload = await this.uploadRepository.findOne({ where: { id } });
    if (!upload) {
      throw new NotFoundException(`Không tìm thấy upload với ID ${id}`);
    }
    return upload;
  }

  // Tìm theo slug
  async findBySlug(slug: string): Promise<Upload> {
    const upload = await this.uploadRepository.findOne({ where: { slug } });
    if (!upload) {
      throw new NotFoundException(`Không tìm thấy upload với slug '${slug}'`);
    }
    return upload;
  }

  // Cập nhật upload
  async update(id: string, updateUploadDto: UpdateUploadDto): Promise<Upload> {
    const upload = await this.findOne(id);
    Object.assign(upload, updateUploadDto);
    return await this.uploadRepository.save(upload);
  }

  // Cập nhật upload theo slug
  async updateBySlug(
    slug: string,
    updateUploadDto: UpdateUploadDto,
  ): Promise<Upload> {
    const upload = await this.findBySlug(slug);
    Object.assign(upload, updateUploadDto);
    return await this.uploadRepository.save(upload);
  }

  // Xóa upload
  async remove(id: string): Promise<void> {
    const upload = await this.findOne(id);

    // Xóa file vật lý
    const fullPath = path.join(process.cwd(), upload.filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    // Xóa record trong database
    await this.uploadRepository.remove(upload);
  }

  // Xóa theo slug
  async removeBySlug(slug: string): Promise<void> {
    const upload = await this.findBySlug(slug);

    // Xóa file vật lý
    const fullPath = path.join(process.cwd(), upload.filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    // Xóa record trong database
    await this.uploadRepository.remove(upload);
  }

  // Lấy file buffer để download
  async getFileBuffer(
    id: string,
  ): Promise<{ buffer: Buffer; fileName: string; mimeType: string }> {
    const upload = await this.findOne(id);
    const fullPath = path.join(process.cwd(), upload.filePath);

    if (!fs.existsSync(fullPath)) {
      throw new NotFoundException('File không tồn tại trên server');
    }

    const buffer = fs.readFileSync(fullPath);
    return {
      buffer,
      fileName: upload.fileName,
      mimeType: upload.mimeType,
    };
  }

  // Lấy file buffer theo slug
  async getFileBufferBySlug(
    slug: string,
  ): Promise<{ buffer: Buffer; fileName: string; mimeType: string }> {
    const upload = await this.findBySlug(slug);
    const fullPath = path.join(process.cwd(), upload.filePath);

    if (!fs.existsSync(fullPath)) {
      throw new NotFoundException('File không tồn tại trên server');
    }

    const buffer = fs.readFileSync(fullPath);
    return {
      buffer,
      fileName: upload.fileName,
      mimeType: upload.mimeType,
    };
  }

  // Import file từ thư mục files vào database
  async importFileFromDirectory(
    fileName: string,
    originalName?: string,
  ): Promise<Upload> {
    const filePath = `files/${fileName}`;
    const fullPath = path.join(process.cwd(), filePath);

    // Kiểm tra file có tồn tại không
    if (!fs.existsSync(fullPath)) {
      throw new NotFoundException(
        `File ${fileName} không tồn tại trong thư mục files/`,
      );
    }

    // Kiểm tra file đã có trong database chưa
    const existingUpload = await this.uploadRepository.findOne({
      where: { fileName },
    });

    if (existingUpload) {
      return existingUpload;
    }

    // Lấy thông tin file
    const stats = fs.statSync(fullPath);
    const fileSize = stats.size;

    // Tạo slug từ tên file (loại bỏ phần mở rộng)
    const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, '');
    const fileSlug = slug(nameWithoutExtension, { lower: true });

    // Tạo record trong database
    const upload = this.uploadRepository.create({
      originalName: originalName || fileName,
      fileName,
      slug: fileSlug,
      filePath,
      fileSize,
      mimeType: 'application/pdf',
    });

    return await this.uploadRepository.save(upload);
  }

  // Import tất cả file PDF từ thư mục files
  async importAllFilesFromDirectory(): Promise<Upload[]> {
    const uploadDir = path.join(process.cwd(), 'files');
    const results: Upload[] = [];

    if (!fs.existsSync(uploadDir)) {
      throw new NotFoundException('Thư mục files/ không tồn tại');
    }

    const files = fs.readdirSync(uploadDir);

    for (const file of files) {
      if (file.endsWith('.pdf')) {
        try {
          const upload = await this.importFileFromDirectory(file);
          results.push(upload);
        } catch (error) {
          console.error(`Lỗi khi import file ${file}:`, error.message);
        }
      }
    }

    return results;
  }

  // Lấy file buffer theo đường dẫn file
  async getFileByPath(
    filePath: string,
  ): Promise<{ buffer: Buffer; fileName: string; mimeType: string }> {
    // Tự động thêm 'files/' nếu chưa có
    let normalizedFilePath = filePath;
    if (!filePath.startsWith('files/')) {
      normalizedFilePath = `files/${filePath}`;
    }

    // Tìm upload record trong database
    const upload = await this.uploadRepository.findOne({
      where: { filePath: normalizedFilePath },
    });

    if (!upload) {
      throw new NotFoundException('Không tìm thấy file trong database');
    }

    const fullPath = path.join(process.cwd(), normalizedFilePath);

    if (!fs.existsSync(fullPath)) {
      throw new NotFoundException('File không tồn tại trên server');
    }

    const buffer = fs.readFileSync(fullPath);
    return {
      buffer,
      fileName: upload.fileName,
      mimeType: upload.mimeType,
    };
  }
}
