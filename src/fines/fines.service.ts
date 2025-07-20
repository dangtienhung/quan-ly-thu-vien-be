import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { BorrowRecordsService } from '../borrow-records/borrow-records.service';
import {
  PaginatedResponseDto,
  PaginationMetaDto,
  PaginationQueryDto,
} from '../common/dto/pagination.dto';
import { CreateFineDto } from './dto/create-fine.dto';
import { UpdateFineDto } from './dto/update-fine.dto';
import { Fine, FineStatus, FineType } from './entities/fine.entity';

@Injectable()
export class FinesService {
  constructor(
    @InjectRepository(Fine)
    private readonly fineRepository: Repository<Fine>,
    private readonly borrowRecordsService: BorrowRecordsService,
  ) {}

  // Tạo mới bản ghi phạt
  async create(createFineDto: CreateFineDto): Promise<Fine> {
    // Kiểm tra bản ghi mượn sách có tồn tại không
    const borrowRecord = await this.borrowRecordsService.findOne(
      createFineDto.borrow_id,
    );

    // Kiểm tra số tiền đã thanh toán không được lớn hơn số tiền phạt
    if (
      createFineDto.paid_amount &&
      createFineDto.paid_amount > createFineDto.fine_amount
    ) {
      throw new BadRequestException(
        'Số tiền đã thanh toán không được lớn hơn số tiền phạt',
      );
    }

    // Tự động tính toán trạng thái dựa trên số tiền đã thanh toán
    let status = FineStatus.UNPAID;
    if (createFineDto.paid_amount) {
      if (createFineDto.paid_amount >= createFineDto.fine_amount) {
        status = FineStatus.PAID;
      } else if (createFineDto.paid_amount > 0) {
        status = FineStatus.PARTIALLY_PAID;
      }
    }

    const fine = this.fineRepository.create({
      borrow_id: createFineDto.borrow_id,
      fine_amount: createFineDto.fine_amount,
      paid_amount: createFineDto.paid_amount || 0,
      fine_date: new Date(createFineDto.fine_date),
      payment_date: createFineDto.payment_date
        ? new Date(createFineDto.payment_date)
        : undefined,
      reason: createFineDto.reason,
      description: createFineDto.description,
      status: createFineDto.status || status,
      overdue_days: createFineDto.overdue_days,
      daily_rate: createFineDto.daily_rate,
      librarian_notes: createFineDto.librarian_notes,
      reader_notes: createFineDto.reader_notes,
      due_date: createFineDto.due_date
        ? new Date(createFineDto.due_date)
        : undefined,
      payment_method: createFineDto.payment_method,
      transaction_id: createFineDto.transaction_id,
    });

    return await this.fineRepository.save(fine);
  }

  // Tạo phạt tự động cho sách trễ hạn
  async createOverdueFine(
    borrowId: string,
    overdueDays: number,
    dailyRate: number = 10000,
  ): Promise<Fine> {
    const borrowRecord = await this.borrowRecordsService.findOne(borrowId);

    // Kiểm tra xem đã có phạt trễ hạn cho bản ghi này chưa
    const existingFine = await this.fineRepository.findOne({
      where: {
        borrow_id: borrowId,
        reason: FineType.OVERDUE,
        status: FineStatus.UNPAID,
      },
    });

    if (existingFine) {
      throw new BadRequestException(
        'Đã có phạt trễ hạn cho bản ghi mượn sách này',
      );
    }

    const fineAmount = overdueDays * dailyRate;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // Hạn thanh toán 30 ngày

    const fine = this.fineRepository.create({
      borrow_id: borrowId,
      fine_amount: fineAmount,
      paid_amount: 0,
      fine_date: new Date(),
      reason: FineType.OVERDUE,
      description: `Sách trả muộn ${overdueDays} ngày so với hạn`,
      status: FineStatus.UNPAID,
      overdue_days: overdueDays,
      daily_rate: dailyRate,
      due_date: dueDate,
    });

    return await this.fineRepository.save(fine);
  }

  // Lấy tất cả bản ghi phạt với phân trang
  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Fine>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.fineRepository.findAndCount({
      relations: ['borrowRecord'],
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

  // Tìm bản ghi phạt theo ID
  async findOne(id: string): Promise<Fine> {
    const fine = await this.fineRepository.findOne({
      where: { id },
      relations: ['borrowRecord'],
    });

    if (!fine) {
      throw new NotFoundException(`Không tìm thấy bản ghi phạt với ID ${id}`);
    }

    return fine;
  }

  // Tìm kiếm bản ghi phạt
  async search(
    query: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Fine>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.fineRepository
      .createQueryBuilder('fine')
      .leftJoinAndSelect('fine.borrowRecord', 'borrowRecord')
      .where('fine.description ILIKE :query', { query: `%${query}%` })
      .orWhere('fine.librarian_notes ILIKE :query', { query: `%${query}%` })
      .orWhere('fine.reader_notes ILIKE :query', { query: `%${query}%` })
      .orWhere('fine.transaction_id ILIKE :query', { query: `%${query}%` })
      .orderBy('fine.created_at', 'DESC')
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

  // Lấy bản ghi phạt theo trạng thái
  async findByStatus(
    status: FineStatus,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Fine>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.fineRepository.findAndCount({
      where: { status },
      relations: ['borrowRecord'],
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

  // Lấy bản ghi phạt theo loại
  async findByType(
    type: FineType,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Fine>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.fineRepository.findAndCount({
      where: { reason: type },
      relations: ['borrowRecord'],
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

  // Lấy bản ghi phạt theo bản ghi mượn sách
  async findByBorrowId(
    borrowId: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Fine>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.fineRepository.findAndCount({
      where: { borrow_id: borrowId },
      relations: ['borrowRecord'],
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

  // Lấy bản ghi phạt quá hạn thanh toán
  async findOverdue(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Fine>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.fineRepository.findAndCount({
      where: {
        status: FineStatus.UNPAID,
        due_date: LessThan(new Date()),
      },
      relations: ['borrowRecord'],
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

  // Cập nhật bản ghi phạt
  async update(id: string, updateFineDto: UpdateFineDto): Promise<Fine> {
    const fine = await this.findOne(id);

    // Xử lý ngày tháng nếu có
    const updateData: any = { ...updateFineDto };
    if (updateFineDto.fine_date) {
      updateData.fine_date = new Date(updateFineDto.fine_date);
    }
    if (updateFineDto.payment_date) {
      updateData.payment_date = new Date(updateFineDto.payment_date);
    }
    if (updateFineDto.due_date) {
      updateData.due_date = new Date(updateFineDto.due_date);
    }

    // Cập nhật trạng thái dựa trên số tiền đã thanh toán
    if (updateFineDto.paid_amount !== undefined) {
      if (updateFineDto.paid_amount >= fine.fine_amount) {
        updateData.status = FineStatus.PAID;
      } else if (updateFineDto.paid_amount > 0) {
        updateData.status = FineStatus.PARTIALLY_PAID;
      } else {
        updateData.status = FineStatus.UNPAID;
      }
    }

    Object.assign(fine, updateData);
    return await this.fineRepository.save(fine);
  }

  // Thanh toán phạt
  async payFine(
    id: string,
    amount: number,
    paymentMethod: string,
    transactionId?: string,
  ): Promise<Fine> {
    const fine = await this.findOne(id);

    if (fine.status === FineStatus.PAID) {
      throw new BadRequestException('Phạt đã được thanh toán đầy đủ');
    }

    if (fine.status === FineStatus.WAIVED) {
      throw new BadRequestException('Phạt đã được miễn');
    }

    const newPaidAmount = fine.paid_amount + amount;
    if (newPaidAmount > fine.fine_amount) {
      throw new BadRequestException('Số tiền thanh toán vượt quá số tiền phạt');
    }

    fine.paid_amount = newPaidAmount;
    fine.payment_date = new Date();
    fine.payment_method = paymentMethod;
    if (transactionId) {
      fine.transaction_id = transactionId;
    }

    // Cập nhật trạng thái
    if (newPaidAmount >= fine.fine_amount) {
      fine.status = FineStatus.PAID;
    } else {
      fine.status = FineStatus.PARTIALLY_PAID;
    }

    return await this.fineRepository.save(fine);
  }

  // Miễn phạt
  async waiveFine(id: string, librarianNotes?: string): Promise<Fine> {
    const fine = await this.findOne(id);

    if (fine.status === FineStatus.PAID) {
      throw new BadRequestException('Không thể miễn phạt đã thanh toán');
    }

    fine.status = FineStatus.WAIVED;
    if (librarianNotes) {
      fine.librarian_notes = librarianNotes;
    }

    return await this.fineRepository.save(fine);
  }

  // Xóa bản ghi phạt
  async remove(id: string): Promise<void> {
    const fine = await this.findOne(id);
    await this.fineRepository.remove(fine);
  }

  // Lấy thống kê phạt
  async getStats(): Promise<{
    total: number;
    unpaid: number;
    paid: number;
    partially_paid: number;
    waived: number;
    totalAmount: number;
    totalPaid: number;
    totalUnpaid: number;
    byType: { type: string; count: number; amount: number }[];
    byMonth: { month: string; count: number; amount: number }[];
  }> {
    const total = await this.fineRepository.count();
    const unpaid = await this.fineRepository.count({
      where: { status: FineStatus.UNPAID },
    });
    const paid = await this.fineRepository.count({
      where: { status: FineStatus.PAID },
    });
    const partially_paid = await this.fineRepository.count({
      where: { status: FineStatus.PARTIALLY_PAID },
    });
    const waived = await this.fineRepository.count({
      where: { status: FineStatus.WAIVED },
    });

    // Tính tổng tiền
    const totalAmountResult = await this.fineRepository
      .createQueryBuilder('fine')
      .select('SUM(fine.fine_amount)', 'total')
      .getRawOne();
    const totalAmount = parseFloat(totalAmountResult.total) || 0;

    const totalPaidResult = await this.fineRepository
      .createQueryBuilder('fine')
      .select('SUM(fine.paid_amount)', 'total')
      .getRawOne();
    const totalPaid = parseFloat(totalPaidResult.total) || 0;

    const totalUnpaid = totalAmount - totalPaid;

    // Thống kê theo loại phạt
    const byType = await this.fineRepository
      .createQueryBuilder('fine')
      .select('fine.reason', 'type')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(fine.fine_amount)', 'amount')
      .groupBy('fine.reason')
      .getRawMany();

    // Thống kê theo tháng (6 tháng gần nhất)
    const byMonth = await this.fineRepository
      .createQueryBuilder('fine')
      .select("DATE_TRUNC('month', fine.created_at)", 'month')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(fine.fine_amount)', 'amount')
      .where('fine.created_at >= :sixMonthsAgo', {
        sixMonthsAgo: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000),
      })
      .groupBy('month')
      .orderBy('month', 'DESC')
      .getRawMany();

    return {
      total,
      unpaid,
      paid,
      partially_paid,
      waived,
      totalAmount,
      totalPaid,
      totalUnpaid,
      byType: byType.map((item) => ({
        type: item.type,
        count: parseInt(item.count),
        amount: parseFloat(item.amount),
      })),
      byMonth: byMonth.map((item) => ({
        month: item.month,
        count: parseInt(item.count),
        amount: parseFloat(item.amount),
      })),
    };
  }
}
