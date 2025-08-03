import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import {
  PaginatedResponseDto,
  PaginationMetaDto,
  PaginationQueryDto,
} from '../common/dto/pagination.dto';
import { CreateBorrowRecordDto } from './dto/create-borrow-record.dto';
import { UpdateBorrowRecordDto } from './dto/update-borrow-record.dto';
import { BorrowRecord, BorrowStatus } from './entities/borrow-record.entity';

@Injectable()
export class BorrowRecordsService {
  constructor(
    @InjectRepository(BorrowRecord)
    private readonly borrowRecordRepository: Repository<BorrowRecord>,
  ) {}

  // Tạo mới bản ghi mượn sách
  async create(
    createBorrowRecordDto: CreateBorrowRecordDto,
  ): Promise<BorrowRecord> {
    const borrowRecord = this.borrowRecordRepository.create({
      reader_id: createBorrowRecordDto.reader_id,
      copy_id: createBorrowRecordDto.copy_id,
      borrow_date: new Date(createBorrowRecordDto.borrow_date),
      due_date: new Date(createBorrowRecordDto.due_date),
      return_date: createBorrowRecordDto.return_date
        ? new Date(createBorrowRecordDto.return_date)
        : undefined,
      status: createBorrowRecordDto.status || BorrowStatus.BORROWED,
      librarian_id: createBorrowRecordDto.librarian_id,
      borrow_notes: createBorrowRecordDto.borrow_notes,
      return_notes: createBorrowRecordDto.return_notes,
      renewal_count: createBorrowRecordDto.renewal_count || 0,
    });

    const savedRecord = await this.borrowRecordRepository.save(borrowRecord);

    // Trả về bản ghi với đầy đủ thông tin sách
    return await this.findOne(savedRecord.id);
  }

  // Lấy tất cả bản ghi mượn sách với phân trang
  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BorrowRecord>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.borrowRecordRepository.findAndCount({
      relations: ['reader', 'physicalCopy', 'physicalCopy.book', 'librarian'],
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

  // Tìm bản ghi mượn sách theo ID
  async findOne(id: string): Promise<BorrowRecord> {
    const borrowRecord = await this.borrowRecordRepository.findOne({
      where: { id },
      relations: ['reader', 'physicalCopy', 'physicalCopy.book', 'librarian'],
    });

    if (!borrowRecord) {
      throw new NotFoundException(
        `Không tìm thấy bản ghi mượn sách với ID ${id}`,
      );
    }

    return borrowRecord;
  }

  // Tìm kiếm bản ghi mượn sách
  async search(
    query: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BorrowRecord>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.borrowRecordRepository
      .createQueryBuilder('borrowRecord')
      .leftJoinAndSelect('borrowRecord.reader', 'reader')
      .leftJoinAndSelect('borrowRecord.physicalCopy', 'physicalCopy')
      .leftJoinAndSelect('physicalCopy.book', 'book')
      .leftJoinAndSelect('borrowRecord.librarian', 'librarian')
      .where('reader.fullName ILIKE :query', { query: `%${query}%` })
      .orWhere('physicalCopy.barcode ILIKE :query', { query: `%${query}%` })
      .orWhere('book.title ILIKE :query', { query: `%${query}%` })
      .orWhere('borrowRecord.borrow_notes ILIKE :query', {
        query: `%${query}%`,
      })
      .orWhere('borrowRecord.return_notes ILIKE :query', {
        query: `%${query}%`,
      })
      .orderBy('borrowRecord.created_at', 'DESC')
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

  // Lấy bản ghi mượn sách theo trạng thái
  async findByStatus(
    status: BorrowStatus,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BorrowRecord>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.borrowRecordRepository.findAndCount({
      where: { status },
      relations: ['reader', 'physicalCopy', 'physicalCopy.book', 'librarian'],
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

  // Lấy bản ghi mượn sách theo độc giả
  async findByReader(
    readerId: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BorrowRecord>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.borrowRecordRepository.findAndCount({
      where: { reader_id: readerId },
      relations: ['reader', 'physicalCopy', 'physicalCopy.book', 'librarian'],
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

  // Lấy bản ghi mượn sách quá hạn
  async findOverdue(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BorrowRecord>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.borrowRecordRepository.findAndCount({
      where: {
        status: BorrowStatus.BORROWED,
        due_date: LessThan(new Date()),
      },
      relations: ['reader', 'physicalCopy', 'physicalCopy.book', 'librarian'],
      order: { due_date: 'ASC' },
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

  // Cập nhật bản ghi mượn sách
  async update(
    id: string,
    updateBorrowRecordDto: UpdateBorrowRecordDto,
  ): Promise<BorrowRecord> {
    const borrowRecord = await this.findOne(id);

    // Xử lý ngày tháng nếu có
    const updateData: any = { ...updateBorrowRecordDto };
    if (updateBorrowRecordDto.borrow_date) {
      updateData.borrow_date = new Date(updateBorrowRecordDto.borrow_date);
    }
    if (updateBorrowRecordDto.due_date) {
      updateData.due_date = new Date(updateBorrowRecordDto.due_date);
    }
    if (updateBorrowRecordDto.return_date) {
      updateData.return_date = new Date(updateBorrowRecordDto.return_date);
    }

    Object.assign(borrowRecord, updateData);
    const savedRecord = await this.borrowRecordRepository.save(borrowRecord);

    // Trả về bản ghi với đầy đủ thông tin sách
    return await this.findOne(savedRecord.id);
  }

  // Trả sách
  async returnBook(id: string, returnNotes?: string): Promise<BorrowRecord> {
    const borrowRecord = await this.findOne(id);

    if (borrowRecord.status === BorrowStatus.RETURNED) {
      throw new BadRequestException('Sách đã được trả trước đó');
    }

    borrowRecord.status = BorrowStatus.RETURNED;
    borrowRecord.return_date = new Date();
    if (returnNotes) {
      borrowRecord.return_notes = returnNotes;
    }

    const savedRecord = await this.borrowRecordRepository.save(borrowRecord);

    // Trả về bản ghi với đầy đủ thông tin sách
    return await this.findOne(savedRecord.id);
  }

  // Gia hạn sách
  async renewBook(id: string, newDueDate: Date): Promise<BorrowRecord> {
    const borrowRecord = await this.findOne(id);

    if (borrowRecord.status !== BorrowStatus.BORROWED) {
      throw new BadRequestException('Chỉ có thể gia hạn sách đang được mượn');
    }

    if (borrowRecord.renewal_count >= 3) {
      throw new BadRequestException(
        'Đã đạt giới hạn số lần gia hạn (tối đa 3 lần)',
      );
    }

    borrowRecord.status = BorrowStatus.RENEWED;
    borrowRecord.due_date = newDueDate;
    borrowRecord.renewal_count += 1;

    const savedRecord = await this.borrowRecordRepository.save(borrowRecord);

    // Trả về bản ghi với đầy đủ thông tin sách
    return await this.findOne(savedRecord.id);
  }

  // Xóa bản ghi mượn sách
  async remove(id: string): Promise<void> {
    const borrowRecord = await this.findOne(id);
    await this.borrowRecordRepository.remove(borrowRecord);
  }

  // Lấy thống kê mượn sách
  async getStats(): Promise<{
    total: number;
    borrowed: number;
    returned: number;
    overdue: number;
    renewed: number;
    byMonth: { month: string; count: number }[];
  }> {
    const total = await this.borrowRecordRepository.count();
    const borrowed = await this.borrowRecordRepository.count({
      where: { status: BorrowStatus.BORROWED },
    });
    const returned = await this.borrowRecordRepository.count({
      where: { status: BorrowStatus.RETURNED },
    });
    const overdue = await this.borrowRecordRepository.count({
      where: {
        status: BorrowStatus.BORROWED,
        due_date: LessThan(new Date()),
      },
    });
    const renewed = await this.borrowRecordRepository.count({
      where: { status: BorrowStatus.RENEWED },
    });

    // Thống kê theo tháng (6 tháng gần nhất)
    const byMonth = await this.borrowRecordRepository
      .createQueryBuilder('borrowRecord')
      .select("DATE_TRUNC('month', borrowRecord.created_at)", 'month')
      .addSelect('COUNT(*)', 'count')
      .where('borrowRecord.created_at >= :sixMonthsAgo', {
        sixMonthsAgo: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000),
      })
      .groupBy('month')
      .orderBy('month', 'DESC')
      .getRawMany();

    return {
      total,
      borrowed,
      returned,
      overdue,
      renewed,
      byMonth: byMonth.map((item) => ({
        month: item.month,
        count: parseInt(item.count),
      })),
    };
  }

  // Cập nhật trạng thái quá hạn tự động
  async updateOverdueStatus(): Promise<void> {
    await this.borrowRecordRepository
      .createQueryBuilder()
      .update(BorrowRecord)
      .set({ status: BorrowStatus.OVERDUE })
      .where('status = :borrowed', { borrowed: BorrowStatus.BORROWED })
      .andWhere('due_date < :now', { now: new Date() })
      .execute();
  }
}
