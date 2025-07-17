import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PaginatedResponseDto,
  PaginationMetaDto,
  PaginationQueryDto,
} from '../common/dto/pagination.dto';
import { CreateReaderTypeDto } from './dto/create-reader-type.dto';
import { UpdateReaderTypeDto } from './dto/update-reader-type.dto';
import { ReaderType, ReaderTypeName } from './entities/reader-type.entity';

@Injectable()
export class ReaderTypesService {
  constructor(
    @InjectRepository(ReaderType)
    private readonly readerTypeRepository: Repository<ReaderType>,
  ) {}

  // CREATE - Tạo reader type mới
  async create(createReaderTypeDto: CreateReaderTypeDto): Promise<ReaderType> {
    // Check if reader type name already exists
    const existingType = await this.readerTypeRepository.findOne({
      where: { typeName: createReaderTypeDto.typeName },
    });
    if (existingType) {
      throw new ConflictException(
        `Reader type '${createReaderTypeDto.typeName}' already exists`,
      );
    }

    const readerType = this.readerTypeRepository.create(createReaderTypeDto);
    return await this.readerTypeRepository.save(readerType);
  }

  // READ ALL - Danh sách reader types với pagination
  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ReaderType>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.readerTypeRepository.findAndCount({
      // relations: ['readers'], // TODO: Uncomment when Reader entity relationships are stable
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const meta: PaginationMetaDto = {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };

    return { data, meta };
  }

  // READ ONE - Tìm reader type theo ID
  async findOne(id: string): Promise<ReaderType> {
    const readerType = await this.readerTypeRepository.findOne({
      where: { id },
      // relations: ['readers'], // TODO: Uncomment when Reader entity relationships are stable
    });
    if (!readerType) {
      throw new NotFoundException(`Reader type with ID ${id} not found`);
    }
    return readerType;
  }

  // READ ONE - Tìm reader type theo type name
  async findByTypeName(typeName: ReaderTypeName): Promise<ReaderType> {
    const readerType = await this.readerTypeRepository.findOne({
      where: { typeName },
      // relations: ['readers'], // TODO: Uncomment when Reader entity relationships are stable
    });
    if (!readerType) {
      throw new NotFoundException(`Reader type '${typeName}' not found`);
    }
    return readerType;
  }

  // UPDATE - Cập nhật reader type
  async update(
    id: string,
    updateReaderTypeDto: UpdateReaderTypeDto,
  ): Promise<ReaderType> {
    const readerType = await this.findOne(id);

    // Check if new type name conflicts with existing types
    if (
      updateReaderTypeDto.typeName &&
      updateReaderTypeDto.typeName !== readerType.typeName
    ) {
      const existingType = await this.readerTypeRepository.findOne({
        where: { typeName: updateReaderTypeDto.typeName },
      });
      if (existingType) {
        throw new ConflictException(
          `Reader type '${updateReaderTypeDto.typeName}' already exists`,
        );
      }
    }

    Object.assign(readerType, updateReaderTypeDto);
    return await this.readerTypeRepository.save(readerType);
  }

  // DELETE - Xóa reader type
  async remove(id: string): Promise<void> {
    const readerType = await this.findOne(id);

    // TODO: Uncomment when Reader entity relationships are stable
    // Check if there are any readers using this type
    // if (readerType.readers && readerType.readers.length > 0) {
    //   throw new ConflictException(
    //     'Cannot delete reader type that has associated readers',
    //   );
    // }

    await this.readerTypeRepository.remove(readerType);
  }

  // UTILITY - Get all reader types without pagination
  async findAllWithoutPagination(): Promise<ReaderType[]> {
    return await this.readerTypeRepository.find({
      order: { typeName: 'ASC' },
    });
  }

  // UTILITY - Get reader type statistics
  async getReaderTypeStats(): Promise<any> {
    // TODO: Update when Reader entity relationships are stable
    const readerTypes = await this.readerTypeRepository.find();

    return readerTypes.map((readerType) => ({
      typeName: readerType.typeName,
      maxBorrowLimit: readerType.maxBorrowLimit,
      borrowDurationDays: readerType.borrowDurationDays,
      readerCount: 0, // TODO: Count readers when relationship is active
    }));
  }

  // UTILITY - Get default reader type settings
  async getDefaultSettings(): Promise<{
    [key: string]: { maxBorrowLimit: number; borrowDurationDays: number };
  }> {
    const settings = {
      [ReaderTypeName.STUDENT]: { maxBorrowLimit: 5, borrowDurationDays: 14 },
      [ReaderTypeName.TEACHER]: { maxBorrowLimit: 10, borrowDurationDays: 21 },
      [ReaderTypeName.STAFF]: { maxBorrowLimit: 8, borrowDurationDays: 21 },
    };

    return settings;
  }

  // UTILITY - Initialize default reader types
  async initializeDefaultTypes(): Promise<void> {
    const defaultSettings = await this.getDefaultSettings();

    for (const [typeName, settings] of Object.entries(defaultSettings)) {
      const existing = await this.readerTypeRepository.findOne({
        where: { typeName: typeName as ReaderTypeName },
      });

      if (!existing) {
        const readerType = this.readerTypeRepository.create({
          typeName: typeName as ReaderTypeName,
          maxBorrowLimit: settings.maxBorrowLimit,
          borrowDurationDays: settings.borrowDurationDays,
          description: `Default settings for ${typeName}`,
        });

        await this.readerTypeRepository.save(readerType);
      }
    }
  }
}
