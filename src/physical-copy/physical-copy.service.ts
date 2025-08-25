import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BooksService } from 'src/books/books.service';
import { BookType } from 'src/books/entities/book.entity';
import {
  PaginatedResponseDto,
  PaginationMetaDto,
  PaginationQueryDto,
} from 'src/common/dto/pagination.dto';
import { In, Repository } from 'typeorm';
import { CreatePhysicalCopyDto } from './dto/create-physical-copy.dto';
import { UpdatePhysicalCopyDto } from './dto/update-physical-copy.dto';
import {
  CopyCondition,
  CopyStatus,
  PhysicalCopy,
} from './entities/physical-copy.entity';

@Injectable()
export class PhysicalCopyService {
  constructor(
    private readonly booksService: BooksService,
    @InjectRepository(PhysicalCopy)
    private readonly physicalCopyRepository: Repository<PhysicalCopy>,
  ) {}

  // Physical Copy Methods
  async createPhysicalCopy(
    createPhysicalCopyDto: CreatePhysicalCopyDto,
  ): Promise<PhysicalCopy> {
    const book = await this.booksService.findOne(createPhysicalCopyDto.book_id);
    if (book.book_type !== BookType.PHYSICAL) {
      throw new BadRequestException('Chỉ có thể tạo bản sao cho sách vật lý');
    }

    const copy = this.physicalCopyRepository.create(createPhysicalCopyDto);
    return await this.physicalCopyRepository.save(copy);
  }

  async findPhysicalCopies(
    bookId: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<PhysicalCopy>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.physicalCopyRepository.findAndCount({
      where: { book_id: bookId },
      relations: ['book'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      data,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }

  async findPhysicalCopyByBarcode(barcode: string): Promise<PhysicalCopy> {
    const copy = await this.physicalCopyRepository.findOne({
      where: { barcode },
      relations: ['book'],
    });
    if (!copy) {
      throw new NotFoundException(
        `Không tìm thấy bản sao với barcode ${barcode}`,
      );
    }
    return copy;
  }

  async updatePhysicalCopy(
    id: string,
    updatePhysicalCopyDto: UpdatePhysicalCopyDto,
  ): Promise<PhysicalCopy> {
    const copy = await this.physicalCopyRepository.findOne({
      where: { id },
      relations: ['book'],
    });
    if (!copy) {
      throw new NotFoundException(`Không tìm thấy bản sao với ID ${id}`);
    }

    Object.assign(copy, updatePhysicalCopyDto);
    return await this.physicalCopyRepository.save(copy);
  }

  async removePhysicalCopy(id: string): Promise<void> {
    const copy = await this.physicalCopyRepository.findOne({ where: { id } });
    if (!copy) {
      throw new NotFoundException(`Không tìm thấy bản sao với ID ${id}`);
    }
    await this.physicalCopyRepository.remove(copy);
  }

  // Bổ sung các method mới

  // Lấy tất cả bản sao với phân trang
  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<PhysicalCopy>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.physicalCopyRepository.findAndCount({
      relations: ['book'],
      order: { created_at: 'DESC' },
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

  // Tìm kiếm bản sao
  async search(
    query: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<PhysicalCopy>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.physicalCopyRepository
      .createQueryBuilder('copy')
      .leftJoinAndSelect('copy.book', 'book')
      .where('copy.barcode ILIKE :query', { query: `%${query}%` })
      .orWhere('copy.location ILIKE :query', { query: `%${query}%` })
      .orWhere('copy.condition_details ILIKE :query', { query: `%${query}%` })
      .orWhere('copy.notes ILIKE :query', { query: `%${query}%` })
      .orWhere('book.title ILIKE :query', { query: `%${query}%` })
      .orderBy('copy.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

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

  // Lọc theo trạng thái
  async findByStatus(
    status: CopyStatus,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<PhysicalCopy>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.physicalCopyRepository.findAndCount({
      where: { status },
      relations: ['book'],
      order: { created_at: 'DESC' },
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

  // Lọc theo tình trạng
  async findByCondition(
    condition: CopyCondition,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<PhysicalCopy>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.physicalCopyRepository.findAndCount({
      where: { current_condition: condition },
      relations: ['book'],
      order: { created_at: 'DESC' },
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

  // Lọc theo vị trí
  async findByLocation(
    location: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<PhysicalCopy>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.physicalCopyRepository.findAndCount({
      where: { location },
      relations: ['book'],
      order: { created_at: 'DESC' },
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

  // Lấy bản sao sẵn sàng cho mượn
  async findAvailable(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<PhysicalCopy>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.physicalCopyRepository.findAndCount({
      where: {
        status: CopyStatus.AVAILABLE,
        is_archived: false,
      },
      relations: ['book'],
      order: { created_at: 'DESC' },
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

  // Lấy bản sao có sẵn theo bookId
  async findAvailableByBookId(
    bookId: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<PhysicalCopy>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    // Kiểm tra sách có tồn tại không
    await this.booksService.findOne(bookId);

    const [data, totalItems] = await this.physicalCopyRepository.findAndCount({
      where: {
        book_id: bookId,
        status: CopyStatus.AVAILABLE,
        is_archived: false,
      },
      relations: ['book'],
      order: { created_at: 'DESC' },
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

  // Lấy bản sao cần bảo trì
  async findNeedingMaintenance(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<PhysicalCopy>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.physicalCopyRepository.findAndCount({
      where: {
        status: In([CopyStatus.DAMAGED, CopyStatus.MAINTENANCE]),
      },
      relations: ['book'],
      order: { created_at: 'DESC' },
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

  // Cập nhật trạng thái bản sao
  async updateStatus(
    id: string,
    status: CopyStatus,
    notes?: string,
  ): Promise<PhysicalCopy> {
    const copy = await this.findOne(id);

    copy.status = status;
    if (notes) {
      copy.notes = notes;
    }

    return await this.physicalCopyRepository.save(copy);
  }

  // Cập nhật tình trạng bản sao
  async updateCondition(
    id: string,
    condition: CopyCondition,
    details?: string,
  ): Promise<PhysicalCopy> {
    const copy = await this.findOne(id);

    copy.current_condition = condition;
    if (details) {
      copy.condition_details = details;
    }
    copy.last_checkup_date = new Date();

    return await this.physicalCopyRepository.save(copy);
  }

  // Lưu trữ/Bỏ lưu trữ bản sao
  async toggleArchive(id: string): Promise<PhysicalCopy> {
    const copy = await this.findOne(id);

    copy.is_archived = !copy.is_archived;
    if (copy.is_archived) {
      copy.status = CopyStatus.MAINTENANCE;
    }

    return await this.physicalCopyRepository.save(copy);
  }

  // Tìm bản sao theo ID
  async findOne(id: string): Promise<PhysicalCopy> {
    const copy = await this.physicalCopyRepository.findOne({
      where: { id },
      relations: ['book'],
    });

    if (!copy) {
      throw new NotFoundException(`Không tìm thấy bản sao với ID ${id}`);
    }

    return copy;
  }

  // Lấy thống kê bản sao
  async getStats(): Promise<{
    total: number;
    available: number;
    borrowed: number;
    reserved: number;
    damaged: number;
    lost: number;
    maintenance: number;
    archived: number;
    byCondition: { condition: string; count: number }[];
    byLocation: { location: string; count: number }[];
    totalValue: number;
  }> {
    const [
      total,
      available,
      borrowed,
      reserved,
      damaged,
      lost,
      maintenance,
      archived,
    ] = await Promise.all([
      this.physicalCopyRepository.count(),
      this.physicalCopyRepository.count({
        where: { status: CopyStatus.AVAILABLE },
      }),
      this.physicalCopyRepository.count({
        where: { status: CopyStatus.BORROWED },
      }),
      this.physicalCopyRepository.count({
        where: { status: CopyStatus.RESERVED },
      }),
      this.physicalCopyRepository.count({
        where: { status: CopyStatus.DAMAGED },
      }),
      this.physicalCopyRepository.count({ where: { status: CopyStatus.LOST } }),
      this.physicalCopyRepository.count({
        where: { status: CopyStatus.MAINTENANCE },
      }),
      this.physicalCopyRepository.count({ where: { is_archived: true } }),
    ]);

    // Thống kê theo tình trạng
    const byCondition = [
      {
        condition: 'new',
        count: await this.physicalCopyRepository.count({
          where: { current_condition: CopyCondition.NEW },
        }),
      },
      {
        condition: 'good',
        count: await this.physicalCopyRepository.count({
          where: { current_condition: CopyCondition.GOOD },
        }),
      },
      {
        condition: 'worn',
        count: await this.physicalCopyRepository.count({
          where: { current_condition: CopyCondition.WORN },
        }),
      },
      {
        condition: 'damaged',
        count: await this.physicalCopyRepository.count({
          where: { current_condition: CopyCondition.DAMAGED },
        }),
      },
    ];

    // Thống kê theo vị trí
    const locationStats = await this.physicalCopyRepository
      .createQueryBuilder('copy')
      .select('copy.location', 'location')
      .addSelect('COUNT(*)', 'count')
      .groupBy('copy.location')
      .getRawMany();

    const byLocation = locationStats.map((stat) => ({
      location: stat.location,
      count: parseInt(stat.count),
    }));

    // Tổng giá trị
    const totalValueResult = await this.physicalCopyRepository
      .createQueryBuilder('copy')
      .select('SUM(copy.purchase_price)', 'total')
      .getRawOne();

    const totalValue = parseFloat(totalValueResult.total) || 0;

    return {
      total,
      available,
      borrowed,
      reserved,
      damaged,
      lost,
      maintenance,
      archived,
      byCondition,
      byLocation,
      totalValue,
    };
  }

  // Tạo nhiều bản sao cùng lúc
  async createMany(
    bookId: string,
    count: number,
    createPhysicalCopyDto: Partial<CreatePhysicalCopyDto>,
  ): Promise<PhysicalCopy[]> {
    const book = await this.booksService.findOne(bookId);
    if (book.book_type !== BookType.PHYSICAL) {
      throw new BadRequestException('Chỉ có thể tạo bản sao cho sách vật lý');
    }

    const copies: PhysicalCopy[] = [];
    for (let i = 0; i < count; i++) {
      const barcode = `${book.isbn}-${Date.now()}-${i + 1}`;
      const copy = this.physicalCopyRepository.create({
        ...createPhysicalCopyDto,
        book_id: bookId,
        barcode,
      });
      copies.push(copy);
    }

    return await this.physicalCopyRepository.save(copies);
  }
}
