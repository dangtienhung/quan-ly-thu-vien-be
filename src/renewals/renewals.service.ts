import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BorrowRecordsService } from '../borrow-records/borrow-records.service';
import { BorrowStatus } from '../borrow-records/entities/borrow-record.entity';
import {
  PaginatedResponseDto,
  PaginationMetaDto,
  PaginationQueryDto,
} from '../common/dto/pagination.dto';
import { CreateRenewalDto } from './dto/create-renewal.dto';
import { UpdateRenewalDto } from './dto/update-renewal.dto';
import { Renewal } from './entities/renewal.entity';

@Injectable()
export class RenewalsService {
  constructor(
    @InjectRepository(Renewal)
    private readonly renewalRepository: Repository<Renewal>,
    private readonly borrowRecordsService: BorrowRecordsService,
  ) {}

  // Tạo mới bản ghi gia hạn
  async create(createRenewalDto: CreateRenewalDto): Promise<Renewal> {
    // Kiểm tra bản ghi mượn sách có tồn tại không
    const borrowRecord = await this.borrowRecordsService.findOne(
      createRenewalDto.borrow_id,
    );

    // Kiểm tra trạng thái bản ghi mượn sách
    if (
      borrowRecord.status !== BorrowStatus.BORROWED &&
      borrowRecord.status !== BorrowStatus.RENEWED
    ) {
      throw new BadRequestException('Chỉ có thể gia hạn sách đang được mượn');
    }

    // Kiểm tra số lần gia hạn
    if (borrowRecord.renewal_count >= 3) {
      throw new BadRequestException(
        'Đã đạt giới hạn số lần gia hạn (tối đa 3 lần)',
      );
    }

    // Kiểm tra ngày hạn mới phải sau ngày hạn cũ
    const newDueDate = new Date(createRenewalDto.new_due_date);
    if (newDueDate <= borrowRecord.due_date) {
      throw new BadRequestException('Ngày hạn mới phải sau ngày hạn hiện tại');
    }

    const renewal = this.renewalRepository.create({
      borrow_id: createRenewalDto.borrow_id,
      renewal_date: new Date(createRenewalDto.renewal_date),
      new_due_date: new Date(createRenewalDto.new_due_date),
      librarian_id: createRenewalDto.librarian_id,
      reason: createRenewalDto.reason,
      librarian_notes: createRenewalDto.librarian_notes,
      renewal_number: createRenewalDto.renewal_number,
      status: createRenewalDto.status || 'approved',
    });

    const savedRenewal = await this.renewalRepository.save(renewal);

    // Cập nhật bản ghi mượn sách
    if (savedRenewal.status === 'approved') {
      await this.borrowRecordsService.update(createRenewalDto.borrow_id, {
        due_date: createRenewalDto.new_due_date,
        status: BorrowStatus.RENEWED,
        renewal_count: borrowRecord.renewal_count + 1,
      });
    }

    return savedRenewal;
  }

  // Lấy tất cả bản ghi gia hạn với phân trang
  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Renewal>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.renewalRepository.findAndCount({
      relations: ['borrowRecord', 'librarian'],
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

  // Tìm bản ghi gia hạn theo ID
  async findOne(id: string): Promise<Renewal> {
    const renewal = await this.renewalRepository.findOne({
      where: { id },
      relations: ['borrowRecord', 'librarian'],
    });

    if (!renewal) {
      throw new NotFoundException(
        `Không tìm thấy bản ghi gia hạn với ID ${id}`,
      );
    }

    return renewal;
  }

  // Tìm kiếm bản ghi gia hạn
  async search(
    query: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Renewal>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.renewalRepository
      .createQueryBuilder('renewal')
      .leftJoinAndSelect('renewal.borrowRecord', 'borrowRecord')
      .leftJoinAndSelect('renewal.librarian', 'librarian')
      .where('renewal.reason ILIKE :query', { query: `%${query}%` })
      .orWhere('renewal.librarian_notes ILIKE :query', { query: `%${query}%` })
      .orWhere('borrowRecord.id ILIKE :query', { query: `%${query}%` })
      .orderBy('renewal.created_at', 'DESC')
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

  // Lấy bản ghi gia hạn theo trạng thái
  async findByStatus(
    status: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Renewal>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.renewalRepository.findAndCount({
      where: { status },
      relations: ['borrowRecord', 'librarian'],
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

  // Lấy bản ghi gia hạn theo bản ghi mượn sách
  async findByBorrowId(
    borrowId: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Renewal>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.renewalRepository.findAndCount({
      where: { borrow_id: borrowId },
      relations: ['borrowRecord', 'librarian'],
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

  // Lấy bản ghi gia hạn theo thủ thư
  async findByLibrarian(
    librarianId: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Renewal>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.renewalRepository.findAndCount({
      where: { librarian_id: librarianId },
      relations: ['borrowRecord', 'librarian'],
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

  // Cập nhật bản ghi gia hạn
  async update(
    id: string,
    updateRenewalDto: UpdateRenewalDto,
  ): Promise<Renewal> {
    const renewal = await this.findOne(id);

    // Xử lý ngày tháng nếu có
    const updateData: any = { ...updateRenewalDto };
    if (updateRenewalDto.renewal_date) {
      updateData.renewal_date = new Date(updateRenewalDto.renewal_date);
    }
    if (updateRenewalDto.new_due_date) {
      updateData.new_due_date = new Date(updateRenewalDto.new_due_date);
    }

    Object.assign(renewal, updateData);
    return await this.renewalRepository.save(renewal);
  }

  // Phê duyệt gia hạn
  async approveRenewal(id: string, librarianNotes?: string): Promise<Renewal> {
    const renewal = await this.findOne(id);

    if (renewal.status === 'approved') {
      throw new BadRequestException('Gia hạn đã được phê duyệt trước đó');
    }

    if (renewal.status === 'rejected') {
      throw new BadRequestException(
        'Không thể phê duyệt gia hạn đã bị từ chối',
      );
    }

    renewal.status = 'approved';
    if (librarianNotes) {
      renewal.librarian_notes = librarianNotes;
    }

    const updatedRenewal = await this.renewalRepository.save(renewal);

    // Cập nhật bản ghi mượn sách
    await this.borrowRecordsService.update(renewal.borrow_id, {
      due_date: renewal.new_due_date.toISOString(),
      status: BorrowStatus.RENEWED,
    });

    return updatedRenewal;
  }

  // Từ chối gia hạn
  async rejectRenewal(id: string, librarianNotes?: string): Promise<Renewal> {
    const renewal = await this.findOne(id);

    if (renewal.status === 'rejected') {
      throw new BadRequestException('Gia hạn đã bị từ chối trước đó');
    }

    if (renewal.status === 'approved') {
      throw new BadRequestException(
        'Không thể từ chối gia hạn đã được phê duyệt',
      );
    }

    renewal.status = 'rejected';
    if (librarianNotes) {
      renewal.librarian_notes = librarianNotes;
    }

    return await this.renewalRepository.save(renewal);
  }

  // Xóa bản ghi gia hạn
  async remove(id: string): Promise<void> {
    const renewal = await this.findOne(id);
    await this.renewalRepository.remove(renewal);
  }

  // Lấy thống kê gia hạn
  async getStats(): Promise<{
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    byMonth: { month: string; count: number }[];
  }> {
    const total = await this.renewalRepository.count();
    const approved = await this.renewalRepository.count({
      where: { status: 'approved' },
    });
    const pending = await this.renewalRepository.count({
      where: { status: 'pending' },
    });
    const rejected = await this.renewalRepository.count({
      where: { status: 'rejected' },
    });

    // Thống kê theo tháng (6 tháng gần nhất)
    const byMonth = await this.renewalRepository
      .createQueryBuilder('renewal')
      .select("DATE_TRUNC('month', renewal.created_at)", 'month')
      .addSelect('COUNT(*)', 'count')
      .where('renewal.created_at >= :sixMonthsAgo', {
        sixMonthsAgo: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000),
      })
      .groupBy('month')
      .orderBy('month', 'DESC')
      .getRawMany();

    return {
      total,
      approved,
      pending,
      rejected,
      byMonth: byMonth.map((item) => ({
        month: item.month,
        count: parseInt(item.count),
      })),
    };
  }
}
