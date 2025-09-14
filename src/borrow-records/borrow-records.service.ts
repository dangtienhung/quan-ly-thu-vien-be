import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThan, MoreThanOrEqual, Repository } from 'typeorm';
import {
  PaginatedResponseDto,
  PaginationMetaDto,
  PaginationQueryDto,
} from '../common/dto/pagination.dto';
import { CreateBorrowRecordDto } from './dto/create-borrow-record.dto';
import { FindByReaderWithSearchDto } from './dto/find-by-reader-with-search.dto';
import { FindByStatusWithSearchDto } from './dto/find-by-status-with-search.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { UpdateBorrowRecordDto } from './dto/update-borrow-record.dto';
import { BorrowRecord, BorrowStatus } from './entities/borrow-record.entity';
import { NotificationService } from './notification.service';

@Injectable()
export class BorrowRecordsService {
  constructor(
    @InjectRepository(BorrowRecord)
    private readonly borrowRecordRepository: Repository<BorrowRecord>,
    private readonly notificationService: NotificationService,
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
      status: createBorrowRecordDto.status || BorrowStatus.PENDING_APPROVAL,
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
    paginationQuery: FindByStatusWithSearchDto,
  ): Promise<PaginatedResponseDto<BorrowRecord>> {
    const { page = 1, limit = 10, q } = paginationQuery;
    const skip = (page - 1) * limit;

    // Sử dụng QueryBuilder để hỗ trợ search
    const queryBuilder = this.borrowRecordRepository
      .createQueryBuilder('borrowRecord')
      .leftJoinAndSelect('borrowRecord.reader', 'reader')
      .leftJoinAndSelect('borrowRecord.physicalCopy', 'physicalCopy')
      .leftJoinAndSelect('physicalCopy.book', 'book')
      .leftJoinAndSelect('borrowRecord.librarian', 'librarian')
      .where('borrowRecord.status = :status', { status });

    // Thêm điều kiện search với OR
    if (q) {
      queryBuilder.andWhere(
        '(book.title ILIKE :searchTerm OR reader.fullName ILIKE :searchTerm)',
        { searchTerm: `%${q}%` },
      );
    }

    // Thêm pagination và ordering
    queryBuilder
      .orderBy('borrowRecord.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, totalItems] = await queryBuilder.getManyAndCount();

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
    paginationQuery: FindByReaderWithSearchDto,
  ): Promise<PaginatedResponseDto<BorrowRecord>> {
    const { page = 1, limit = 10, q } = paginationQuery;
    const skip = (page - 1) * limit;

    // Sử dụng QueryBuilder để hỗ trợ search
    const queryBuilder = this.borrowRecordRepository
      .createQueryBuilder('borrowRecord')
      .leftJoinAndSelect('borrowRecord.reader', 'reader')
      .leftJoinAndSelect('borrowRecord.physicalCopy', 'physicalCopy')
      .leftJoinAndSelect('physicalCopy.book', 'book')
      .leftJoinAndSelect('borrowRecord.librarian', 'librarian')
      .where('borrowRecord.reader_id = :readerId', { readerId });

    // Thêm điều kiện search với OR
    if (q) {
      queryBuilder.andWhere(
        '(book.title ILIKE :searchTerm OR reader.fullName ILIKE :searchTerm)',
        { searchTerm: `%${q}%` },
      );
    }

    // Thêm pagination và ordering
    queryBuilder
      .orderBy('borrowRecord.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, totalItems] = await queryBuilder.getManyAndCount();

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

  // Lấy bản ghi mượn sách chờ phê duyệt
  async findPendingApproval(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BorrowRecord>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.borrowRecordRepository.findAndCount({
      where: { status: BorrowStatus.PENDING_APPROVAL },
      relations: ['reader', 'physicalCopy', 'physicalCopy.book', 'librarian'],
      order: { created_at: 'ASC' }, // Sắp xếp theo thời gian tạo để xử lý theo thứ tự
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

  // Lấy bản ghi mượn sách đã bị hủy
  async findCancelled(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BorrowRecord>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.borrowRecordRepository.findAndCount({
      where: { status: BorrowStatus.CANCELLED },
      relations: ['reader', 'physicalCopy', 'physicalCopy.book', 'librarian'],
      order: { created_at: 'DESC' }, // Sắp xếp theo thời gian tạo mới nhất
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

  // Phê duyệt yêu cầu mượn sách
  async approveBorrowRequest(
    id: string,
    librarianId: string,
    notes?: string,
  ): Promise<BorrowRecord> {
    const borrowRecord = await this.findOne(id);

    if (borrowRecord.status !== BorrowStatus.PENDING_APPROVAL) {
      throw new BadRequestException(
        'Chỉ có thể phê duyệt các yêu cầu đang chờ phê duyệt',
      );
    }

    // Cập nhật trạng thái thành BORROWED
    borrowRecord.status = BorrowStatus.BORROWED;
    borrowRecord.librarian_id = librarianId;
    if (notes) {
      borrowRecord.borrow_notes = notes;
    }

    return await this.borrowRecordRepository.save(borrowRecord);
  }

  // Từ chối yêu cầu mượn sách
  async rejectBorrowRequest(
    id: string,
    librarianId: string,
    reason: string,
  ): Promise<BorrowRecord> {
    const borrowRecord = await this.findOne(id);

    if (borrowRecord.status !== BorrowStatus.PENDING_APPROVAL) {
      throw new BadRequestException(
        'Chỉ có thể từ chối các yêu cầu đang chờ phê duyệt',
      );
    }

    // Cập nhật trạng thái thành CANCELLED
    borrowRecord.status = BorrowStatus.CANCELLED;
    borrowRecord.librarian_id = librarianId;
    borrowRecord.return_notes = `Yêu cầu bị từ chối: ${reason}`;

    return await this.borrowRecordRepository.save(borrowRecord);
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
    byStatus: { status: string; count: number }[];
    pendingApproval: number;
    borrowed: number;
    returned: number;
    overdue: number;
    renewed: number;
    cancelled: number;
    activeLoans: number;
    overdueLoans: number;
    byMonth: { month: string; count: number }[];
    byReaderType: { readerType: string; count: number }[];
    byBookCategory: { category: string; count: number }[];
  }> {
    try {
      // Thống kê tổng quan
      const total = await this.borrowRecordRepository.count();

      // Thống kê theo trạng thái
      const statusStats = await this.borrowRecordRepository
        .createQueryBuilder('borrowRecord')
        .select('borrowRecord.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('borrowRecord.status')
        .getRawMany();

      const byStatus = statusStats.map((stat) => ({
        status: stat.status,
        count: parseInt(stat.count),
      }));

      // Thống kê chi tiết từng trạng thái
      const pendingApproval = await this.borrowRecordRepository.count({
        where: { status: BorrowStatus.PENDING_APPROVAL },
      });

      const borrowed = await this.borrowRecordRepository.count({
        where: { status: BorrowStatus.BORROWED },
      });

      const returned = await this.borrowRecordRepository.count({
        where: { status: BorrowStatus.RETURNED },
      });

      const overdue = await this.borrowRecordRepository.count({
        where: { status: BorrowStatus.OVERDUE },
      });

      const renewed = await this.borrowRecordRepository.count({
        where: { status: BorrowStatus.RENEWED },
      });

      const cancelled = await this.borrowRecordRepository.count({
        where: { status: BorrowStatus.CANCELLED },
      });

      // Sách đang được mượn (bao gồm cả BORROWED và RENEWED)
      const activeLoans = await this.borrowRecordRepository.count({
        where: [
          { status: BorrowStatus.BORROWED },
          { status: BorrowStatus.RENEWED },
        ],
      });

      // Sách quá hạn (bao gồm cả OVERDUE và các sách BORROWED/RENEWED có due_date < now)
      const overdueLoans = await this.borrowRecordRepository.count({
        where: [
          { status: BorrowStatus.OVERDUE },
          {
            status: BorrowStatus.BORROWED,
            due_date: LessThan(new Date()),
          },
          {
            status: BorrowStatus.RENEWED,
            due_date: LessThan(new Date()),
          },
        ],
      });

      // Thống kê theo tháng (6 tháng gần nhất)
      let byMonth: { month: string; count: number }[] = [];
      try {
        const monthStats = await this.borrowRecordRepository
          .createQueryBuilder('borrowRecord')
          .select("DATE_TRUNC('month', borrowRecord.created_at)", 'month')
          .addSelect('COUNT(*)', 'count')
          .where('borrowRecord.created_at >= :sixMonthsAgo', {
            sixMonthsAgo: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000),
          })
          .groupBy('month')
          .orderBy('month', 'DESC')
          .getRawMany();

        byMonth = monthStats.map((item) => ({
          month: item.month,
          count: parseInt(item.count),
        }));
      } catch (error) {
        console.error('Error getting month stats:', error);
        byMonth = [];
      }

      // Thống kê theo loại độc giả
      let byReaderType: { readerType: string; count: number }[] = [];
      try {
        const readerTypeStats = await this.borrowRecordRepository
          .createQueryBuilder('borrowRecord')
          .leftJoin('borrowRecord.reader', 'reader')
          .leftJoin('reader.readerType', 'readerType')
          .select('readerType.typeName', 'readerType')
          .addSelect('COUNT(*)', 'count')
          .groupBy('readerType.typeName')
          .getRawMany();

        byReaderType = readerTypeStats.map((stat) => ({
          readerType: stat.readerType || 'Không xác định',
          count: parseInt(stat.count),
        }));
      } catch (error) {
        console.error('Error getting reader type stats:', error);
        byReaderType = [];
      }

      // Thống kê theo danh mục sách
      let byBookCategory: { category: string; count: number }[] = [];
      try {
        const bookCategoryStats = await this.borrowRecordRepository
          .createQueryBuilder('borrowRecord')
          .leftJoin('borrowRecord.physicalCopy', 'physicalCopy')
          .leftJoin('physicalCopy.book', 'book')
          .leftJoin('book.category', 'category')
          .select('category.category_name', 'category')
          .addSelect('COUNT(*)', 'count')
          .groupBy('category.category_name')
          .getRawMany();

        byBookCategory = bookCategoryStats.map((stat) => ({
          category: stat.category || 'Không xác định',
          count: parseInt(stat.count),
        }));
      } catch (error) {
        console.error('Error getting book category stats:', error);
        byBookCategory = [];
      }

      return {
        total,
        byStatus,
        pendingApproval,
        borrowed,
        returned,
        overdue,
        renewed,
        cancelled,
        activeLoans,
        overdueLoans,
        byMonth,
        byReaderType,
        byBookCategory,
      };
    } catch (error) {
      console.error('Error in getStats:', error);
      throw new Error('Database operation failed');
    }
  }

  // Cập nhật trạng thái quá hạn tự động
  async updateOverdueStatus(): Promise<{ updatedCount: number }> {
    const result = await this.borrowRecordRepository
      .createQueryBuilder()
      .update(BorrowRecord)
      .set({ status: BorrowStatus.OVERDUE })
      .where('status IN (:...statuses)', {
        statuses: [BorrowStatus.BORROWED, BorrowStatus.RENEWED],
      })
      .andWhere('due_date < :now', { now: new Date() })
      .execute();

    return { updatedCount: result.affected || 0 };
  }

  // Lấy thống kê quá hạn chi tiết
  async getOverdueStats(): Promise<{
    totalOverdue: number;
    byStatus: { status: string; count: number }[];
    byDaysOverdue: { daysOverdue: number; count: number }[];
    byReaderType: { readerType: string; count: number }[];
  }> {
    try {
      const now = new Date();

      // Tổng số sách quá hạn
      const totalOverdue = await this.borrowRecordRepository.count({
        where: [
          { status: BorrowStatus.OVERDUE },
          {
            status: BorrowStatus.BORROWED,
            due_date: LessThan(now),
          },
          {
            status: BorrowStatus.RENEWED,
            due_date: LessThan(now),
          },
        ],
      });

      // Thống kê theo trạng thái
      let byStatus: { status: string; count: number }[] = [];
      try {
        const statusStats = await this.borrowRecordRepository
          .createQueryBuilder('borrowRecord')
          .select('borrowRecord.status', 'status')
          .addSelect('COUNT(*)', 'count')
          .where('borrowRecord.status = :overdue', {
            overdue: BorrowStatus.OVERDUE,
          })
          .orWhere(
            '(borrowRecord.status IN (:...activeStatuses) AND borrowRecord.due_date < :now)',
            {
              activeStatuses: [BorrowStatus.BORROWED, BorrowStatus.RENEWED],
              now,
            },
          )
          .groupBy('borrowRecord.status')
          .getRawMany();

        byStatus = statusStats.map((stat) => ({
          status: stat.status,
          count: parseInt(stat.count),
        }));
      } catch (error) {
        console.error('Error getting overdue status stats:', error);
        byStatus = [];
      }

      // Thống kê theo số ngày quá hạn
      let byDaysOverdue: { daysOverdue: number; count: number }[] = [];
      try {
        const daysStats = await this.borrowRecordRepository
          .createQueryBuilder('borrowRecord')
          .select(
            'CEIL(EXTRACT(EPOCH FROM (:now - borrowRecord.due_date)) / 86400)',
            'daysOverdue',
          )
          .addSelect('COUNT(*)', 'count')
          .where('borrowRecord.due_date < :now', { now })
          .andWhere('borrowRecord.status IN (:...statuses)', {
            statuses: [
              BorrowStatus.BORROWED,
              BorrowStatus.RENEWED,
              BorrowStatus.OVERDUE,
            ],
          })
          .groupBy(
            'CEIL(EXTRACT(EPOCH FROM (:now - borrowRecord.due_date)) / 86400)',
          )
          .orderBy(
            'CEIL(EXTRACT(EPOCH FROM (:now - borrowRecord.due_date)) / 86400)',
            'ASC',
          )
          .getRawMany();

        byDaysOverdue = daysStats.map((stat) => ({
          daysOverdue: parseInt(stat.daysOverdue),
          count: parseInt(stat.count),
        }));
      } catch (error) {
        console.error('Error getting days overdue stats:', error);
        byDaysOverdue = [];
      }

      // Thống kê theo loại độc giả
      let byReaderType: { readerType: string; count: number }[] = [];
      try {
        const readerTypeStats = await this.borrowRecordRepository
          .createQueryBuilder('borrowRecord')
          .leftJoin('borrowRecord.reader', 'reader')
          .leftJoin('reader.readerType', 'readerType')
          .select('readerType.typeName', 'readerType')
          .addSelect('COUNT(*)', 'count')
          .where('borrowRecord.due_date < :now', { now })
          .andWhere('borrowRecord.status IN (:...statuses)', {
            statuses: [
              BorrowStatus.BORROWED,
              BorrowStatus.RENEWED,
              BorrowStatus.OVERDUE,
            ],
          })
          .groupBy('readerType.typeName')
          .getRawMany();

        byReaderType = readerTypeStats.map((stat) => ({
          readerType: stat.readerType || 'Không xác định',
          count: parseInt(stat.count),
        }));
      } catch (error) {
        console.error('Error getting overdue reader type stats:', error);
        byReaderType = [];
      }

      return {
        totalOverdue,
        byStatus,
        byDaysOverdue,
        byReaderType,
      };
    } catch (error) {
      console.error('Error in getOverdueStats:', error);
      throw new Error('Database operation failed');
    }
  }

  // Lấy danh sách sách mượn gần đến hạn trả (trong vòng N ngày)
  async findNearDue(
    paginationQuery: PaginationQueryDto,
    daysBeforeDue: number = 2,
  ): Promise<PaginatedResponseDto<BorrowRecord>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const now = new Date();
    const targetDate = new Date(
      now.getTime() + daysBeforeDue * 24 * 60 * 60 * 1000,
    );

    const [data, totalItems] = await this.borrowRecordRepository.findAndCount({
      where: {
        due_date: Between(now, targetDate),
        status: BorrowStatus.BORROWED,
      },
      relations: ['reader', 'physicalCopy', 'physicalCopy.book', 'librarian'],
      order: { due_date: 'ASC' }, // Sắp xếp theo ngày đến hạn gần nhất
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

  // Gửi thông báo nhắc nhở cho người dùng sắp đến hạn trả
  async sendDueDateReminders(notificationDto: SendNotificationDto): Promise<{
    success: boolean;
    message: string;
    totalReaders: number;
    notificationsSent: number;
    details: Array<{
      readerId: string;
      readerName: string;
      bookTitle: string;
      dueDate: Date;
      daysUntilDue: number;
    }>;
  }> {
    const { daysBeforeDue = 2, customMessage, readerId } = notificationDto;

    const now = new Date();

    // Xử lý trường hợp daysBeforeDue = 0 (gửi ngay cho tất cả sách đang mượn)
    const whereConditions: any = {
      status: BorrowStatus.BORROWED,
    };

    if (daysBeforeDue === 0) {
      // Gửi cho tất cả sách đang mượn
      whereConditions.due_date = MoreThanOrEqual(now);
    } else {
      // Gửi cho sách sắp đến hạn
      const targetDate = new Date(
        now.getTime() + daysBeforeDue * 24 * 60 * 60 * 1000,
      );
      whereConditions.due_date = Between(now, targetDate);
    }

    // Nếu có readerId cụ thể
    if (readerId) {
      whereConditions.reader_id = readerId;
    }

    // Lấy danh sách sách gần đến hạn
    const nearDueRecords = await this.borrowRecordRepository.find({
      where: whereConditions,
      relations: ['reader', 'physicalCopy', 'physicalCopy.book'],
      order: { due_date: 'ASC' },
    });

    if (nearDueRecords.length === 0) {
      return {
        success: true,
        message: 'Không có sách nào sắp đến hạn trả trong thời gian này.',
        totalReaders: 0,
        notificationsSent: 0,
        details: [],
      };
    }

    // Tạo danh sách thông báo
    const notificationDetails = nearDueRecords.map((record) => {
      const daysUntilDue = Math.ceil(
        (record.due_date.getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
      );

      return {
        readerId: record.reader_id,
        readerName: record.reader.fullName,
        bookTitle: record.physicalCopy.book.title,
        dueDate: record.due_date,
        daysUntilDue,
      };
    });

    // Lấy danh sách độc giả duy nhất
    const uniqueReaders = new Set(
      nearDueRecords.map((record) => record.reader_id),
    );
    const totalReaders = uniqueReaders.size;

    // Tạo nội dung thông báo
    const defaultMessage =
      customMessage ||
      (daysBeforeDue === 0
        ? 'Nhắc nhở: Vui lòng kiểm tra sách đang mượn và trả sách đúng hạn để tránh phí phạt.'
        : `Sách của bạn sắp đến hạn trả trong ${daysBeforeDue} ngày tới. Vui lòng trả sách đúng hạn để tránh phí phạt.`);

    // Tạo thông báo trong database cho từng độc giả
    let totalNotificationsSent = 0;

    for (const detail of notificationDetails) {
      try {
        await this.notificationService.createNotification(
          detail.readerId,
          'Nhắc nhở trả sách',
          defaultMessage,
          'due_date_reminder' as any,
          {
            bookTitle: detail.bookTitle,
            dueDate: detail.dueDate,
            daysUntilDue: detail.daysUntilDue,
          },
        );
        totalNotificationsSent++;
      } catch (error) {
        console.error(
          `Lỗi tạo thông báo cho độc giả ${detail.readerId}:`,
          error,
        );
      }
    }

    console.log('=== THÔNG BÁO NHẮC NHỞ ĐẾN HẠN TRẢ SÁCH ===');
    console.log(`Nội dung: ${defaultMessage}`);
    console.log(`Tổng số độc giả: ${totalReaders}`);
    console.log(`Tổng số thông báo đã tạo: ${totalNotificationsSent}`);
    console.log('Chi tiết:');

    notificationDetails.forEach((detail) => {
      console.log(
        `- ${detail.readerName}: "${detail.bookTitle}" (${detail.daysUntilDue} ngày nữa)`,
      );
    });

    return {
      success: true,
      message: `Đã tạo thông báo nhắc nhở cho ${totalReaders} độc giả về ${nearDueRecords.length} cuốn sách sắp đến hạn trả.`,
      totalReaders,
      notificationsSent: totalNotificationsSent,
      details: notificationDetails,
    };
  }

  // Lấy thống kê sách gần đến hạn
  async getNearDueStats(daysBeforeDue: number = 2): Promise<{
    totalNearDue: number;
    byDaysUntilDue: { daysUntilDue: number; count: number }[];
    byReader: { readerName: string; count: number }[];
    byBookCategory: { category: string; count: number }[];
  }> {
    const now = new Date();
    const targetDate = new Date(
      now.getTime() + daysBeforeDue * 24 * 60 * 60 * 1000,
    );

    // Tổng số sách gần đến hạn
    const totalNearDue = await this.borrowRecordRepository.count({
      where: {
        due_date: Between(now, targetDate),
        status: BorrowStatus.BORROWED,
      },
    });

    // Thống kê theo số ngày còn lại
    let byDaysUntilDue: { daysUntilDue: number; count: number }[] = [];
    try {
      const daysStats = await this.borrowRecordRepository
        .createQueryBuilder('borrowRecord')
        .select(
          'CEIL(EXTRACT(EPOCH FROM (borrowRecord.due_date - :now)) / 86400)',
          'daysUntilDue',
        )
        .addSelect('COUNT(*)', 'count')
        .where('borrowRecord.due_date BETWEEN :now AND :targetDate', {
          now,
          targetDate,
        })
        .andWhere('borrowRecord.status = :status', {
          status: BorrowStatus.BORROWED,
        })
        .groupBy('daysUntilDue')
        .orderBy('daysUntilDue', 'ASC')
        .getRawMany();

      byDaysUntilDue = daysStats.map((stat) => ({
        daysUntilDue: parseInt(stat.daysUntilDue),
        count: parseInt(stat.count),
      }));
    } catch (error) {
      console.error('Error getting days until due stats:', error);
      byDaysUntilDue = [];
    }

    // Thống kê theo độc giả
    let byReader: { readerName: string; count: number }[] = [];
    try {
      const readerStats = await this.borrowRecordRepository
        .createQueryBuilder('borrowRecord')
        .leftJoin('borrowRecord.reader', 'reader')
        .select('reader.fullName', 'readerName')
        .addSelect('COUNT(*)', 'count')
        .where('borrowRecord.due_date BETWEEN :now AND :targetDate', {
          now,
          targetDate,
        })
        .andWhere('borrowRecord.status = :status', {
          status: BorrowStatus.BORROWED,
        })
        .groupBy('reader.fullName')
        .orderBy('count', 'DESC')
        .getRawMany();

      byReader = readerStats.map((stat) => ({
        readerName: stat.readerName || 'Không xác định',
        count: parseInt(stat.count),
      }));
    } catch (error) {
      console.error('Error getting reader stats:', error);
      byReader = [];
    }

    // Thống kê theo danh mục sách
    let byBookCategory: { category: string; count: number }[] = [];
    try {
      const categoryStats = await this.borrowRecordRepository
        .createQueryBuilder('borrowRecord')
        .leftJoin('borrowRecord.physicalCopy', 'physicalCopy')
        .leftJoin('physicalCopy.book', 'book')
        .leftJoin('book.category', 'category')
        .select('category.category_name', 'category')
        .addSelect('COUNT(*)', 'count')
        .where('borrowRecord.due_date BETWEEN :now AND :targetDate', {
          now,
          targetDate,
        })
        .andWhere('borrowRecord.status = :status', {
          status: BorrowStatus.BORROWED,
        })
        .groupBy('category.category_name')
        .orderBy('count', 'DESC')
        .getRawMany();

      byBookCategory = categoryStats.map((stat) => ({
        category: stat.category || 'Không xác định',
        count: parseInt(stat.count),
      }));
    } catch (error) {
      console.error('Error getting book category stats:', error);
      byBookCategory = [];
    }

    return {
      totalNearDue,
      byDaysUntilDue,
      byReader,
      byBookCategory,
    };
  }
}
