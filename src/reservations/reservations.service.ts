import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { BooksService } from '../books/books.service';
import {
  PaginatedResponseDto,
  PaginationMetaDto,
  PaginationQueryDto,
} from '../common/dto/pagination.dto';
import { PhysicalCopyService } from '../physical-copy/physical-copy.service';
import { ReadersService } from '../readers/readers.service';
import { CreateMultipleReservationsResponseDto } from './dto/create-multiple-reservations-response.dto';
import { CreateMultipleReservationsDto } from './dto/create-multiple-reservations.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Reservation, ReservationStatus } from './entities/reservation.entity';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly booksService: BooksService,
    private readonly readersService: ReadersService,
    private readonly physicalCopyService: PhysicalCopyService,
  ) {}

  // Tạo mới đặt trước
  async create(
    createReservationDto: CreateReservationDto,
  ): Promise<Reservation> {
    // Kiểm tra độc giả có tồn tại và đang hoạt động không
    const reader = await this.readersService.findOne(
      createReservationDto.reader_id,
    );
    if (!reader.isActive) {
      throw new BadRequestException('Độc giả không đang hoạt động');
    }

    // Kiểm tra sách có tồn tại không
    await this.booksService.findOne(createReservationDto.book_id);

    // Kiểm tra physical copy có tồn tại không (nếu được cung cấp)
    if (createReservationDto.physical_copy_id) {
      await this.physicalCopyService.findOne(
        createReservationDto.physical_copy_id,
      );
    }

    // Kiểm tra độc giả đã đặt trước sách này chưa
    const existingReservation = await this.reservationRepository.findOne({
      where: {
        reader_id: createReservationDto.reader_id,
        book_id: createReservationDto.book_id,
        status: ReservationStatus.PENDING,
      },
    });

    if (existingReservation) {
      throw new ConflictException('Độc giả đã đặt trước sách này');
    }

    // Kiểm tra ngày hết hạn phải sau ngày đặt trước
    const reservationDate = new Date(createReservationDto.reservation_date);
    const expiryDate = new Date(createReservationDto.expiry_date);

    if (expiryDate <= reservationDate) {
      throw new BadRequestException('Ngày hết hạn phải sau ngày đặt trước');
    }

    // Lấy thứ tự ưu tiên (mặc định là cuối danh sách)
    let priority = createReservationDto.priority || 1;
    if (!createReservationDto.priority) {
      const lastReservation = await this.reservationRepository.findOne({
        where: {
          book_id: createReservationDto.book_id,
          status: ReservationStatus.PENDING,
        },
        order: { priority: 'DESC' },
      });
      priority = lastReservation ? lastReservation.priority + 1 : 1;
    }

    const reservation = this.reservationRepository.create({
      reader_id: createReservationDto.reader_id,
      book_id: createReservationDto.book_id,
      physical_copy_id: createReservationDto.physical_copy_id,
      reservation_date: reservationDate,
      expiry_date: expiryDate,
      reader_notes: createReservationDto.reader_notes,
      priority,
    });

    return await this.reservationRepository.save(reservation);
  }

  // Tạo nhiều đặt trước cùng lúc
  async createMultiple(
    createMultipleReservationsDto: CreateMultipleReservationsDto,
  ): Promise<CreateMultipleReservationsResponseDto> {
    const { reservations } = createMultipleReservationsDto;
    const created: Reservation[] = [];
    const failed: Array<{ index: number; error: string; data: any }> = [];

    // Xử lý từng đặt trước một cách tuần tự để đảm bảo tính nhất quán
    for (let i = 0; i < reservations.length; i++) {
      try {
        const reservation = await this.create(reservations[i]);
        created.push(reservation);
      } catch (error) {
        failed.push({
          index: i,
          error: error.message || 'Lỗi không xác định',
          data: reservations[i],
        });
      }
    }

    return {
      created,
      failed,
      total: reservations.length,
      successCount: created.length,
      failureCount: failed.length,
    };
  }

  // Lấy tất cả đặt trước với phân trang
  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Reservation>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.reservationRepository.findAndCount({
      relations: ['reader', 'reader.readerType', 'book', 'physicalCopy'],
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

  // Tìm đặt trước theo ID
  async findOne(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['reader', 'reader.readerType', 'book', 'physicalCopy'],
    });

    if (!reservation) {
      throw new NotFoundException(`Không tìm thấy đặt trước với ID ${id}`);
    }

    return reservation;
  }

  // Tìm kiếm đặt trước
  async search(
    query: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Reservation>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.reader', 'reader')
      .leftJoinAndSelect('reader.readerType', 'readerType')
      .leftJoinAndSelect('reservation.book', 'book')
      .leftJoinAndSelect('reservation.physicalCopy', 'physicalCopy')
      .where('reader.fullName ILIKE :query', { query: `%${query}%` })
      .orWhere('book.title ILIKE :query', { query: `%${query}%` })
      .orWhere('reservation.reader_notes ILIKE :query', { query: `%${query}%` })
      .orWhere('reservation.librarian_notes ILIKE :query', {
        query: `%${query}%`,
      })
      .orderBy('reservation.created_at', 'DESC')
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

  // Lấy đặt trước theo trạng thái
  async findByStatus(
    status: ReservationStatus,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Reservation>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.reservationRepository.findAndCount({
      where: { status },
      relations: ['reader', 'reader.readerType', 'book', 'physicalCopy'],
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

  // Lấy đặt trước theo độc giả
  async findByReader(
    readerId: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Reservation>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.reservationRepository.findAndCount({
      where: { reader_id: readerId },
      relations: ['reader', 'reader.readerType', 'book', 'physicalCopy'],
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

  // Lấy đặt trước theo sách
  async findByBook(
    bookId: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Reservation>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.reservationRepository.findAndCount({
      where: { book_id: bookId },
      relations: ['reader', 'reader.readerType', 'book', 'physicalCopy'],
      order: { priority: 'ASC', created_at: 'ASC' },
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

  // Lấy đặt trước sắp hết hạn
  async findExpiringSoon(days: number = 1): Promise<Reservation[]> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    return await this.reservationRepository.find({
      where: {
        status: ReservationStatus.PENDING,
        expiry_date: MoreThan(new Date()),
      },
      relations: ['reader', 'reader.readerType', 'book', 'physicalCopy'],
      order: { expiry_date: 'ASC' },
    });
  }

  // Lấy đặt trước đã hết hạn
  async findExpired(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Reservation>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.reservationRepository.findAndCount({
      where: {
        status: ReservationStatus.PENDING,
        expiry_date: LessThan(new Date()),
      },
      relations: ['reader', 'reader.readerType', 'book', 'physicalCopy'],
      order: { expiry_date: 'ASC' },
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

  // Cập nhật đặt trước
  async update(
    id: string,
    updateReservationDto: UpdateReservationDto,
  ): Promise<Reservation> {
    const reservation = await this.findOne(id);

    // Kiểm tra logic nghiệp vụ khi cập nhật trạng thái
    if (updateReservationDto.status) {
      if (updateReservationDto.status === ReservationStatus.FULFILLED) {
        if (reservation.status !== ReservationStatus.PENDING) {
          throw new BadRequestException(
            'Chỉ có thể thực hiện đặt trước đang chờ xử lý',
          );
        }
        updateReservationDto.fulfillment_date = new Date().toISOString();
      } else if (updateReservationDto.status === ReservationStatus.CANCELLED) {
        if (reservation.status !== ReservationStatus.PENDING) {
          throw new BadRequestException(
            'Chỉ có thể hủy đặt trước đang chờ xử lý',
          );
        }
        updateReservationDto.cancelled_date = new Date().toISOString();
      }
    }

    Object.assign(reservation, updateReservationDto);
    return await this.reservationRepository.save(reservation);
  }

  // Thực hiện đặt trước
  async fulfillReservation(
    id: string,
    librarianId: string,
    notes?: string,
  ): Promise<Reservation> {
    const reservation = await this.findOne(id);

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException(
        'Chỉ có thể thực hiện đặt trước đang chờ xử lý',
      );
    }

    // Kiểm tra sách có sẵn không
    // const availableCopies = await this.physicalCopyService.findPhysicalCopies(
    //   reservation.book_id,
    //   { page: 1, limit: 100 },
    // );
    // const hasAvailable = availableCopies.data.some(
    //   (copy) => copy.status === 'available',
    // );
    // if (!hasAvailable) {
    //   throw new BadRequestException(
    //     'Sách hiện không có sẵn để thực hiện đặt trước',
    //   );
    // }

    reservation.status = ReservationStatus.FULFILLED;
    reservation.fulfillment_date = new Date();
    reservation.fulfilled_by = librarianId;
    if (notes) {
      reservation.librarian_notes = notes;
    }

    return await this.reservationRepository.save(reservation);
  }

  // Hủy đặt trước
  async cancelReservation(
    id: string,
    librarianId: string,
    reason?: string,
  ): Promise<Reservation> {
    const reservation = await this.findOne(id);

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException('Chỉ có thể hủy đặt trước đang chờ xử lý');
    }

    reservation.status = ReservationStatus.CANCELLED;
    reservation.cancelled_date = new Date();
    reservation.cancelled_by = librarianId;
    if (reason) {
      reservation.cancellation_reason = reason;
    }

    return await this.reservationRepository.save(reservation);
  }

  // Đánh dấu đặt trước hết hạn
  async expireReservation(
    id: string,
    librarianId: string,
    reason?: string,
  ): Promise<Reservation> {
    const reservation = await this.findOne(id);

    if (reservation.status === ReservationStatus.EXPIRED) {
      throw new BadRequestException('Đặt trước đã hết hạn');
    }

    if (reservation.status === ReservationStatus.FULFILLED) {
      throw new BadRequestException(
        'Không thể đánh dấu hết hạn cho đặt trước đã thực hiện',
      );
    }

    reservation.status = ReservationStatus.EXPIRED;
    reservation.cancelled_date = new Date();
    reservation.cancelled_by = librarianId;
    if (reason) {
      reservation.cancellation_reason = reason;
    } else {
      reservation.cancellation_reason = 'Đánh dấu hết hạn bởi thủ thư';
    }

    return await this.reservationRepository.save(reservation);
  }

  // Đánh dấu nhiều đặt trước hết hạn
  async expireMultipleReservations(
    reservationIds: string[],
    librarianId: string,
    reason?: string,
  ): Promise<{ success: string[]; failed: { id: string; error: string }[] }> {
    const results = {
      success: [] as string[],
      failed: [] as { id: string; error: string }[],
    };

    for (const id of reservationIds) {
      try {
        await this.expireReservation(id, librarianId, reason);
        results.success.push(id);
      } catch (error) {
        results.failed.push({
          id,
          error: error.message || 'Lỗi không xác định',
        });
      }
    }

    return results;
  }

  // Tự động hủy đặt trước hết hạn
  async autoCancelExpiredReservations(): Promise<number> {
    const expiredReservations = await this.reservationRepository.find({
      where: {
        status: ReservationStatus.PENDING,
        expiry_date: LessThan(new Date()),
      },
    });

    for (const reservation of expiredReservations) {
      reservation.status = ReservationStatus.EXPIRED;
      reservation.cancelled_date = new Date();
      reservation.cancellation_reason = 'Tự động hủy do hết hạn';
    }

    if (expiredReservations.length > 0) {
      await this.reservationRepository.save(expiredReservations);
    }

    return expiredReservations.length;
  }

  // Tự động đánh dấu đặt trước hết hạn
  async autoExpireExpiredReservations(): Promise<number> {
    const expiredReservations = await this.reservationRepository.find({
      where: {
        status: ReservationStatus.PENDING,
        expiry_date: LessThan(new Date()),
      },
    });

    for (const reservation of expiredReservations) {
      reservation.status = ReservationStatus.EXPIRED;
      reservation.cancelled_date = new Date();
      reservation.cancellation_reason = 'Tự động đánh dấu hết hạn';
    }

    if (expiredReservations.length > 0) {
      await this.reservationRepository.save(expiredReservations);
    }

    return expiredReservations.length;
  }

  // Xóa đặt trước
  async remove(id: string): Promise<void> {
    const reservation = await this.findOne(id);
    await this.reservationRepository.remove(reservation);
  }

  // Lấy thống kê đặt trước
  async getStats(): Promise<{
    total: number;
    pending: number;
    fulfilled: number;
    cancelled: number;
    expired: number;
    byStatus: { status: string; count: number }[];
    byMonth: { month: string; count: number }[];
    expiringSoon: number;
  }> {
    const [total, pending, fulfilled, cancelled, expired] = await Promise.all([
      this.reservationRepository.count(),
      this.reservationRepository.count({
        where: { status: ReservationStatus.PENDING },
      }),
      this.reservationRepository.count({
        where: { status: ReservationStatus.FULFILLED },
      }),
      this.reservationRepository.count({
        where: { status: ReservationStatus.CANCELLED },
      }),
      this.reservationRepository.count({
        where: { status: ReservationStatus.EXPIRED },
      }),
    ]);

    // Thống kê theo trạng thái
    const byStatus = [
      { status: 'pending', count: pending },
      { status: 'fulfilled', count: fulfilled },
      { status: 'cancelled', count: cancelled },
      { status: 'expired', count: expired },
    ];

    // Thống kê theo tháng (6 tháng gần nhất)
    const byMonth: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const count = await this.reservationRepository.count({
        where: {
          created_at: MoreThan(startOfMonth),
        },
      });

      byMonth.push({
        month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        count,
      });
    }

    // Số đặt trước sắp hết hạn (1 ngày tới)
    const expiringSoon = await this.reservationRepository.count({
      where: {
        status: ReservationStatus.PENDING,
        expiry_date: MoreThan(new Date()),
      },
    });

    return {
      total,
      pending,
      fulfilled,
      cancelled,
      expired,
      byStatus,
      byMonth,
      expiringSoon,
    };
  }

  // Lấy thống kê đặt trước theo status (tối ưu cho API)
  async getStatsByStatus(): Promise<{
    total: number;
    byStatus: { status: string; count: number }[];
    pending: number;
    fulfilled: number;
    cancelled: number;
    expired: number;
    expiringSoon: number;
  }> {
    const [total, pending, fulfilled, cancelled, expired] = await Promise.all([
      this.reservationRepository.count(),
      this.reservationRepository.count({
        where: { status: ReservationStatus.PENDING },
      }),
      this.reservationRepository.count({
        where: { status: ReservationStatus.FULFILLED },
      }),
      this.reservationRepository.count({
        where: { status: ReservationStatus.CANCELLED },
      }),
      this.reservationRepository.count({
        where: { status: ReservationStatus.EXPIRED },
      }),
    ]);

    // Thống kê theo trạng thái
    const byStatus = [
      { status: 'pending', count: pending },
      { status: 'fulfilled', count: fulfilled },
      { status: 'cancelled', count: cancelled },
      { status: 'expired', count: expired },
    ];

    // Số đặt trước sắp hết hạn (1 ngày tới)
    const expiringSoon = await this.reservationRepository.count({
      where: {
        status: ReservationStatus.PENDING,
        expiry_date: MoreThan(new Date()),
      },
    });

    return {
      total,
      byStatus,
      pending,
      fulfilled,
      cancelled,
      expired,
      expiringSoon,
    };
  }
}
