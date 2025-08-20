import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Repository } from 'typeorm';
import {
  PaginatedResponseDto,
  PaginationMetaDto,
  PaginationQueryDto,
} from '../common/dto/pagination.dto';
import { CreateReaderDto } from './dto/create-reader.dto';
import { ReadersQueryDto } from './dto/readers-query.dto';
import { UpdateReaderDto } from './dto/update-reader.dto';
import { Reader } from './entities/reader.entity';

@Injectable()
export class ReadersService {
  constructor(
    @InjectRepository(Reader)
    private readonly readerRepository: Repository<Reader>,
  ) {}

  // CREATE - Tạo reader mới
  async create(createReaderDto: CreateReaderDto): Promise<Reader> {
    // Check if user already has a reader profile
    const existingReader = await this.readerRepository.findOne({
      where: { userId: createReaderDto.userId },
    });
    if (existingReader) {
      throw new ConflictException('User already has a reader profile');
    }

    // Check if card number already exists
    const existingCard = await this.readerRepository.findOne({
      where: { cardNumber: createReaderDto.cardNumber },
    });
    if (existingCard) {
      throw new ConflictException('Card number already exists');
    }

    // Validate card dates
    const issueDate = new Date(createReaderDto.cardIssueDate);
    const expiryDate = new Date(createReaderDto.cardExpiryDate);
    if (expiryDate <= issueDate) {
      throw new BadRequestException(
        'Card expiry date must be after issue date',
      );
    }

    const reader = this.readerRepository.create(createReaderDto);
    return await this.readerRepository.save(reader);
  }

  // READ ALL - Danh sách readers với pagination và filter
  async findAll(query: ReadersQueryDto): Promise<PaginatedResponseDto<Reader>> {
    const {
      page = 1,
      limit = 10,
      cardNumber,
      cardExpiryDateFrom,
      cardExpiryDateTo,
      phone,
    } = query;
    const skip = (page - 1) * limit;

    // Xây dựng điều kiện lọc
    const whereConditions: any = {};

    if (cardNumber) {
      whereConditions.cardNumber = Like(`%${cardNumber}%`);
    }

    if (phone) {
      whereConditions.phone = Like(`%${phone}%`);
    }

    if (cardExpiryDateFrom || cardExpiryDateTo) {
      const fromDate = cardExpiryDateFrom
        ? new Date(cardExpiryDateFrom)
        : new Date('1900-01-01');
      const toDate = cardExpiryDateTo
        ? new Date(cardExpiryDateTo)
        : new Date('9999-12-31');
      whereConditions.cardExpiryDate = Between(fromDate, toDate);
    }

    const [data, totalItems] = await this.readerRepository.findAndCount({
      where:
        Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
      relations: ['user', 'readerType'],
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

  // READ ONE - Tìm reader theo ID
  async findOne(id: string): Promise<Reader> {
    const reader = await this.readerRepository.findOne({
      where: { id },
      relations: ['user', 'readerType'],
    });
    if (!reader) {
      throw new NotFoundException(`Reader with ID ${id} not found`);
    }
    return reader;
  }

  // READ ONE - Tìm reader theo user ID
  async findByUserId(userId: string): Promise<Reader> {
    const reader = await this.readerRepository.findOne({
      where: { userId },
      relations: ['user', 'readerType'],
    });
    if (!reader) {
      throw new NotFoundException(`Reader with user ID ${userId} not found`);
    }
    return reader;
  }

  // READ ONE - Tìm reader theo card number
  async findByCardNumber(cardNumber: string): Promise<Reader> {
    const reader = await this.readerRepository.findOne({
      where: { cardNumber },
      relations: ['user', 'readerType'],
    });
    if (!reader) {
      throw new NotFoundException(
        `Reader with card number '${cardNumber}' not found`,
      );
    }
    return reader;
  }

  // UPDATE - Cập nhật reader
  async update(id: string, updateReaderDto: UpdateReaderDto): Promise<Reader> {
    const reader = await this.findOne(id);

    // Check if new card number conflicts with existing readers
    if (
      updateReaderDto.cardNumber &&
      updateReaderDto.cardNumber !== reader.cardNumber
    ) {
      const existingCard = await this.readerRepository.findOne({
        where: { cardNumber: updateReaderDto.cardNumber },
      });
      if (existingCard) {
        throw new ConflictException('Card number already exists');
      }
    }

    // Validate card dates if provided
    if (updateReaderDto.cardIssueDate && updateReaderDto.cardExpiryDate) {
      const issueDate = new Date(updateReaderDto.cardIssueDate);
      const expiryDate = new Date(updateReaderDto.cardExpiryDate);
      if (expiryDate <= issueDate) {
        throw new BadRequestException(
          'Card expiry date must be after issue date',
        );
      }
    }

    Object.assign(reader, updateReaderDto);
    return await this.readerRepository.save(reader);
  }

  // DELETE - Xóa reader
  async remove(id: string): Promise<void> {
    const reader = await this.findOne(id);

    // TODO: Uncomment when BorrowRecord entity is created
    // Check if reader has active borrow records
    // if (reader.borrowRecords && reader.borrowRecords.some(record => record.status === 'borrowed')) {
    //   throw new ConflictException('Cannot delete reader with active borrowed books');
    // }

    await this.readerRepository.remove(reader);
  }

  // UTILITY - Activate reader
  async activateReader(id: string): Promise<Reader> {
    const reader = await this.findOne(id);
    reader.isActive = true;
    return await this.readerRepository.save(reader);
  }

  // UTILITY - Deactivate reader
  async deactivateReader(id: string): Promise<Reader> {
    const reader = await this.findOne(id);
    reader.isActive = false;
    return await this.readerRepository.save(reader);
  }

  // UTILITY - Check if card is expired
  async isCardExpired(id: string): Promise<boolean> {
    const reader = await this.findOne(id);
    const currentDate = new Date();
    return reader.cardExpiryDate < currentDate;
  }

  // UTILITY - Get expired cards
  async getExpiredCards(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Reader>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;
    const currentDate = new Date();

    const [data, totalItems] = await this.readerRepository
      .createQueryBuilder('reader')
      .leftJoinAndSelect('reader.user', 'user')
      .leftJoinAndSelect('reader.readerType', 'readerType')
      .where('reader.cardExpiryDate < :currentDate', { currentDate })
      .orderBy('reader.cardExpiryDate', 'ASC')
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

  // UTILITY - Get cards expiring soon
  async getCardsExpiringSoon(
    days: number,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Reader>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;
    const currentDate = new Date();
    const futureDate = new Date(
      currentDate.getTime() + days * 24 * 60 * 60 * 1000,
    );

    const [data, totalItems] = await this.readerRepository
      .createQueryBuilder('reader')
      .leftJoinAndSelect('reader.user', 'user')
      .leftJoinAndSelect('reader.readerType', 'readerType')
      .where('reader.cardExpiryDate > :currentDate', { currentDate })
      .andWhere('reader.cardExpiryDate <= :futureDate', { futureDate })
      .orderBy('reader.cardExpiryDate', 'ASC')
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

  // UTILITY - Get readers by type
  async getReadersByType(
    readerTypeId: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Reader>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.readerRepository.findAndCount({
      where: { readerTypeId },
      relations: ['user', 'readerType'],
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

  // SEARCH - Tìm kiếm readers
  async search(
    query: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Reader>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.readerRepository
      .createQueryBuilder('reader')
      .leftJoinAndSelect('reader.user', 'user')
      .leftJoinAndSelect('reader.readerType', 'readerType')
      .where('reader.fullName ILIKE :query', { query: `%${query}%` })
      .orWhere('reader.cardNumber ILIKE :query', { query: `%${query}%` })
      .orWhere('reader.phone ILIKE :query', { query: `%${query}%` })
      .orWhere('user.username ILIKE :query', { query: `%${query}%` })
      .orWhere('user.email ILIKE :query', { query: `%${query}%` })
      .orderBy('reader.createdAt', 'DESC')
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

  // UTILITY - Generate card number
  async generateCardNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `LIB${currentYear}`;

    // Get the last card number for this year
    const lastReader = await this.readerRepository
      .createQueryBuilder('reader')
      .where('reader.cardNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('reader.cardNumber', 'DESC')
      .getOne();

    let nextNumber = 1;
    if (lastReader) {
      const lastNumber = parseInt(lastReader.cardNumber.slice(prefix.length));
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }

  // UTILITY - Renew card
  async renewCard(id: string, newExpiryDate: string): Promise<Reader> {
    const reader = await this.findOne(id);

    const expiryDate = new Date(newExpiryDate);
    const currentDate = new Date();

    if (expiryDate <= currentDate) {
      throw new BadRequestException('New expiry date must be in the future');
    }

    reader.cardExpiryDate = expiryDate;
    return await this.readerRepository.save(reader);
  }
}
