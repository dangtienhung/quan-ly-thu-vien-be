import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PaginatedResponseDto,
  PaginationQueryDto,
} from '../common/dto/pagination.dto';
import { CreateBookAuthorDto } from './dto/create-book-author.dto';
import { UpdateBookAuthorDto } from './dto/update-book-author.dto';
import { BookAuthor } from './entities/book-author.entity';

@Injectable()
export class BookAuthorsService {
  constructor(
    @InjectRepository(BookAuthor)
    private readonly bookAuthorsRepository: Repository<BookAuthor>,
  ) {}

  async create(createBookAuthorDto: CreateBookAuthorDto): Promise<BookAuthor> {
    const bookAuthor = this.bookAuthorsRepository.create(createBookAuthorDto);
    return await this.bookAuthorsRepository.save(bookAuthor);
  }

  async createMany(
    createBookAuthorDtos: CreateBookAuthorDto[],
  ): Promise<BookAuthor[]> {
    const bookAuthors = this.bookAuthorsRepository.create(createBookAuthorDtos);
    return await this.bookAuthorsRepository.save(bookAuthors);
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BookAuthor>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.bookAuthorsRepository.findAndCount({
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const meta = {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };

    return { data, meta };
  }

  async findOne(id: string): Promise<BookAuthor> {
    const bookAuthor = await this.bookAuthorsRepository.findOne({
      where: { id },
    });
    if (!bookAuthor) {
      throw new NotFoundException(`Không tìm thấy mối quan hệ với ID ${id}`);
    }
    return bookAuthor;
  }

  async update(
    id: string,
    updateBookAuthorDto: UpdateBookAuthorDto,
  ): Promise<BookAuthor> {
    const bookAuthor = await this.findOne(id);
    Object.assign(bookAuthor, updateBookAuthorDto);
    return await this.bookAuthorsRepository.save(bookAuthor);
  }

  async remove(id: string): Promise<void> {
    const bookAuthor = await this.findOne(id);
    await this.bookAuthorsRepository.remove(bookAuthor);
  }
}
