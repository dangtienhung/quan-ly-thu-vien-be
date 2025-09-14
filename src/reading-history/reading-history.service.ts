import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PaginatedResponseDto,
  PaginationQueryDto,
} from '../common/dto/pagination.dto';
import { CreateReadingHistoryDto } from './dto/create-reading-history.dto';
import { UpdateReadingHistoryDto } from './dto/update-reading-history.dto';
import { UpdateReadingProgressDto } from './dto/update-reading-progress.dto';
import { ReadingHistory } from './entities/reading-history.entity';
import { ReadingSession } from './entities/reading-session.entity';

@Injectable()
export class ReadingHistoryService {
  constructor(
    @InjectRepository(ReadingHistory)
    private readonly readingHistoryRepository: Repository<ReadingHistory>,
    @InjectRepository(ReadingSession)
    private readonly readingSessionRepository: Repository<ReadingSession>,
  ) {}

  // Tạo lịch sử đọc mới (upsert - tạo mới hoặc cập nhật)
  async create(
    createReadingHistoryDto: CreateReadingHistoryDto,
  ): Promise<ReadingHistory> {
    const { reader_id, book_id } = createReadingHistoryDto;

    // // Kiểm tra xem đã có lịch sử đọc chưa
    // const existingHistory = await this.readingHistoryRepository.findOne({
    //   where: { reader_id, book_id },
    // });

    // if (existingHistory) {
    //   // Nếu đã có lịch sử đọc, cập nhật lại thông tin và trả về
    //   existingHistory.status =
    //     createReadingHistoryDto.status || existingHistory.status;
    //   existingHistory.current_page =
    //     createReadingHistoryDto.current_page || existingHistory.current_page;
    //   existingHistory.total_reading_time_seconds =
    //     createReadingHistoryDto.total_reading_time_seconds ||
    //     existingHistory.total_reading_time_seconds;
    //   existingHistory.is_favorite =
    //     createReadingHistoryDto.is_favorite !== undefined
    //       ? createReadingHistoryDto.is_favorite
    //       : existingHistory.is_favorite;
    //   existingHistory.last_read_at = new Date();

    //   return await this.readingHistoryRepository.save(existingHistory);
    // }

    const readingHistory = this.readingHistoryRepository.create({
      reader_id,
      book_id,
      status: createReadingHistoryDto.status || 'reading',
      current_page: createReadingHistoryDto.current_page || 1,
      total_reading_time_seconds:
        createReadingHistoryDto.total_reading_time_seconds || 0,
      is_favorite: createReadingHistoryDto.is_favorite || false,
      last_read_at: new Date(),
    });

    return await this.readingHistoryRepository.save(readingHistory);
  }

  // Lấy tất cả lịch sử đọc
  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ReadingHistory>> {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.readingHistoryRepository.findAndCount(
      {
        relations: ['book', 'reader', 'book.mainCategory'],
        order: { last_read_at: 'DESC' },
        skip,
        take: limit,
      },
    );

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  // Lấy lịch sử đọc theo reader
  async findByReader(
    readerId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ReadingHistory>> {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.readingHistoryRepository.findAndCount(
      {
        where: { reader_id: readerId },
        relations: ['book', 'book.mainCategory'],
        order: { last_read_at: 'DESC' },
        skip,
        take: limit,
      },
    );

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  // Lấy lịch sử đọc theo book
  async findByBook(
    bookId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ReadingHistory>> {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.readingHistoryRepository.findAndCount(
      {
        where: { book_id: bookId },
        relations: ['reader', 'reader.user'],
        order: { last_read_at: 'DESC' },
        skip,
        take: limit,
      },
    );

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  // Lấy lịch sử đọc theo reader và book
  async findByReaderAndBook(
    readerId: string,
    bookId: string,
  ): Promise<ReadingHistory> {
    const readingHistory = await this.readingHistoryRepository.findOne({
      where: { reader_id: readerId, book_id: bookId },
      relations: ['book', 'reader', 'book.mainCategory'],
    });

    if (!readingHistory) {
      throw new NotFoundException('Không tìm thấy lịch sử đọc.');
    }

    return readingHistory;
  }

  // Cập nhật tiến độ đọc
  async updateReadingProgress(
    readerId: string,
    bookId: string,
    updateProgressDto: UpdateReadingProgressDto,
  ): Promise<ReadingHistory> {
    const { current_page, session_duration, device } = updateProgressDto;

    // Tìm hoặc tạo lịch sử đọc
    let readingHistory = await this.readingHistoryRepository.findOne({
      where: { reader_id: readerId, book_id: bookId },
    });

    if (!readingHistory) {
      readingHistory = this.readingHistoryRepository.create({
        reader_id: readerId,
        book_id: bookId,
        status: 'reading',
        current_page: 1,
        total_reading_time_seconds: 0,
        is_favorite: false,
      });
    }

    // Cập nhật thông tin đọc
    readingHistory.updatePage(current_page);
    if (session_duration) {
      readingHistory.updateReadingTime(session_duration);
    }

    // Lưu lịch sử đọc
    const savedHistory =
      await this.readingHistoryRepository.save(readingHistory);

    // Tạo session đọc mới nếu có thời gian đọc
    if (session_duration && session_duration > 0) {
      const readingSession = this.readingSessionRepository.create({
        reader_id: readerId,
        book_id: bookId,
        started_at: new Date(Date.now() - session_duration * 1000),
        ended_at: new Date(),
        duration_seconds: session_duration,
        start_page: Math.max(1, current_page - 1),
        end_page: current_page,
        status: 'completed',
        device: device || undefined,
      });

      await this.readingSessionRepository.save(readingSession);
    }

    return savedHistory;
  }

  // Cập nhật lịch sử đọc
  async update(
    id: string,
    updateReadingHistoryDto: UpdateReadingHistoryDto,
  ): Promise<ReadingHistory> {
    const readingHistory = await this.findOne(id);

    Object.assign(readingHistory, updateReadingHistoryDto);
    readingHistory.last_read_at = new Date();

    return await this.readingHistoryRepository.save(readingHistory);
  }

  // Lấy một lịch sử đọc
  async findOne(id: string): Promise<ReadingHistory> {
    const readingHistory = await this.readingHistoryRepository.findOne({
      where: { id },
      relations: ['book', 'reader', 'book.mainCategory'],
    });

    if (!readingHistory) {
      throw new NotFoundException('Không tìm thấy lịch sử đọc.');
    }

    return readingHistory;
  }

  // Xóa lịch sử đọc
  async remove(id: string): Promise<void> {
    const readingHistory = await this.findOne(id);
    await this.readingHistoryRepository.remove(readingHistory);
  }

  // Lấy sách đang đọc
  async getCurrentlyReading(readerId: string): Promise<ReadingHistory[]> {
    return await this.readingHistoryRepository.find({
      where: {
        reader_id: readerId,
        status: 'reading',
      },
      relations: ['book', 'book.mainCategory'],
      order: { last_read_at: 'DESC' },
    });
  }

  // Lấy sách yêu thích
  async getFavoriteBooks(readerId: string): Promise<ReadingHistory[]> {
    return await this.readingHistoryRepository.find({
      where: {
        reader_id: readerId,
        is_favorite: true,
      },
      relations: ['book', 'book.mainCategory'],
      order: { last_read_at: 'DESC' },
    });
  }

  // Đánh dấu hoàn thành
  async markAsCompleted(
    readerId: string,
    bookId: string,
  ): Promise<ReadingHistory> {
    const readingHistory = await this.findByReaderAndBook(readerId, bookId);
    readingHistory.markAsCompleted();
    return await this.readingHistoryRepository.save(readingHistory);
  }

  // Toggle yêu thích
  async toggleFavorite(
    readerId: string,
    bookId: string,
  ): Promise<ReadingHistory> {
    const readingHistory = await this.findByReaderAndBook(readerId, bookId);
    readingHistory.toggleFavorite();
    return await this.readingHistoryRepository.save(readingHistory);
  }

  // Lấy sessions đọc theo reader
  async getReadingSessions(
    readerId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ReadingSession>> {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.readingSessionRepository.findAndCount(
      {
        where: { reader_id: readerId },
        relations: ['book'],
        order: { started_at: 'DESC' },
        skip,
        take: limit,
      },
    );

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
