import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthorsService } from '../authors/authors.service';
import { BooksService } from '../books/books.service';
import {
  PaginatedResponseDto,
  PaginationMetaDto,
  PaginationQueryDto,
} from '../common/dto/pagination.dto';
import { CreateBookAuthorDto } from './dto/create-book-author.dto';
import { UpdateBookAuthorDto } from './dto/update-book-author.dto';
import { BookAuthor } from './entities/book-author.entity';

@Injectable()
export class BookAuthorsService {
  constructor(
    @InjectRepository(BookAuthor)
    private readonly bookAuthorRepository: Repository<BookAuthor>,
    @Inject(forwardRef(() => BooksService))
    private readonly booksService: BooksService,
    @Inject(forwardRef(() => AuthorsService))
    private readonly authorsService: AuthorsService,
  ) {}

  // Tạo mới
  async create(createBookAuthorDto: CreateBookAuthorDto): Promise<BookAuthor> {
    // Kiểm tra sách tồn tại
    await this.booksService.findOne(createBookAuthorDto.book_id);

    // Kiểm tra tác giả tồn tại
    await this.authorsService.findOne(createBookAuthorDto.author_id);

    // Kiểm tra mối quan hệ đã tồn tại
    const exists = await this.exists(
      createBookAuthorDto.book_id,
      createBookAuthorDto.author_id,
    );
    if (exists) {
      throw new BadRequestException('Mối quan hệ sách-tác giả này đã tồn tại');
    }

    const bookAuthor = this.bookAuthorRepository.create(createBookAuthorDto);
    return await this.bookAuthorRepository.save(bookAuthor);
  }

  // Tạo nhiều mối quan hệ
  async createMany(
    createBookAuthorDtos: CreateBookAuthorDto[],
  ): Promise<BookAuthor[]> {
    const validRelationships: CreateBookAuthorDto[] = [];
    const errors: string[] = [];

    for (const dto of createBookAuthorDtos) {
      try {
        // Kiểm tra sách tồn tại
        await this.booksService.findOne(dto.book_id);

        // Kiểm tra tác giả tồn tại
        await this.authorsService.findOne(dto.author_id);

        // Kiểm tra mối quan hệ đã tồn tại
        const exists = await this.exists(dto.book_id, dto.author_id);
        if (!exists) {
          validRelationships.push(dto);
        } else {
          errors.push(
            `Mối quan hệ sách ${dto.book_id} - tác giả ${dto.author_id} đã tồn tại`,
          );
        }
      } catch (error) {
        console.error('Error processing relationship:', dto, error);
        if (error instanceof NotFoundException) {
          errors.push(
            `Không tìm thấy sách hoặc tác giả: ${dto.book_id} - ${dto.author_id} (${error.message})`,
          );
        } else {
          errors.push(
            `Lỗi xử lý: ${dto.book_id} - ${dto.author_id} (${error.message})`,
          );
        }
      }
    }

    if (errors.length > 0) {
      console.error('Bulk create errors:', errors);
      throw new BadRequestException({
        message: 'Một số mối quan hệ không thể tạo',
        errors,
        validCount: validRelationships.length,
        errorCount: errors.length,
        totalCount: createBookAuthorDtos.length,
      });
    }

    if (validRelationships.length === 0) {
      throw new BadRequestException('Không có mối quan hệ hợp lệ nào để tạo');
    }

    try {
      const bookAuthors = this.bookAuthorRepository.create(validRelationships);
      const result = await this.bookAuthorRepository.save(bookAuthors);
      console.log(`Successfully created ${result.length} relationships`);
      return result;
    } catch (error) {
      console.error('Error saving relationships:', error);
      throw new BadRequestException(
        `Lỗi khi lưu mối quan hệ: ${error.message}`,
      );
    }
  }

  // Lấy tất cả với phân trang
  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BookAuthor>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.bookAuthorRepository.findAndCount({
      relations: ['book', 'author'],
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

  // Tìm theo ID
  async findOne(id: string): Promise<BookAuthor> {
    const bookAuthor = await this.bookAuthorRepository.findOne({
      where: { id },
      relations: ['book', 'author'],
    });
    if (!bookAuthor) {
      throw new NotFoundException(
        `Không tìm thấy mối quan hệ sách-tác giả với ID ${id}`,
      );
    }
    return bookAuthor;
  }

  // Tìm theo book_id
  async findByBookId(
    bookId: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BookAuthor>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.bookAuthorRepository.findAndCount({
      where: { book_id: bookId },
      relations: ['book', 'author'],
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

  // Tìm theo author_id
  async findByAuthorId(
    authorId: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BookAuthor>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.bookAuthorRepository.findAndCount({
      where: { author_id: authorId },
      relations: ['book', 'author'],
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

  // Tìm kiếm
  async search(
    query: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BookAuthor>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.bookAuthorRepository
      .createQueryBuilder('bookAuthor')
      .leftJoinAndSelect('bookAuthor.book', 'book')
      .leftJoinAndSelect('bookAuthor.author', 'author')
      .where('book.title ILIKE :query', { query: `%${query}%` })
      .orWhere('author.author_name ILIKE :query', { query: `%${query}%` })
      .orderBy('bookAuthor.created_at', 'DESC')
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

  // Cập nhật
  async update(
    id: string,
    updateBookAuthorDto: UpdateBookAuthorDto,
  ): Promise<BookAuthor> {
    const bookAuthor = await this.findOne(id);

    // Kiểm tra sách tồn tại nếu được cập nhật
    if (updateBookAuthorDto.book_id) {
      await this.booksService.findOne(updateBookAuthorDto.book_id);
    }

    // Kiểm tra tác giả tồn tại nếu được cập nhật
    if (updateBookAuthorDto.author_id) {
      await this.authorsService.findOne(updateBookAuthorDto.author_id);
    }

    // Kiểm tra mối quan hệ mới đã tồn tại (nếu cả book_id và author_id đều được cập nhật)
    if (updateBookAuthorDto.book_id && updateBookAuthorDto.author_id) {
      const newBookId = updateBookAuthorDto.book_id;
      const newAuthorId = updateBookAuthorDto.author_id;

      // Chỉ kiểm tra nếu book_id hoặc author_id thay đổi
      if (
        newBookId !== bookAuthor.book_id ||
        newAuthorId !== bookAuthor.author_id
      ) {
        const exists = await this.exists(newBookId, newAuthorId);
        if (exists) {
          throw new BadRequestException(
            'Mối quan hệ sách-tác giả này đã tồn tại',
          );
        }
      }
    }

    Object.assign(bookAuthor, updateBookAuthorDto);
    return await this.bookAuthorRepository.save(bookAuthor);
  }

  // Xóa
  async remove(id: string): Promise<void> {
    const bookAuthor = await this.findOne(id);
    await this.bookAuthorRepository.remove(bookAuthor);
  }

  // Xóa theo book_id
  async removeByBookId(bookId: string): Promise<void> {
    await this.bookAuthorRepository.delete({ book_id: bookId });
  }

  // Xóa theo author_id
  async removeByAuthorId(authorId: string): Promise<void> {
    await this.bookAuthorRepository.delete({ author_id: authorId });
  }

  // Kiểm tra mối quan hệ đã tồn tại
  async exists(bookId: string, authorId: string): Promise<boolean> {
    const count = await this.bookAuthorRepository.count({
      where: { book_id: bookId, author_id: authorId },
    });
    return count > 0;
  }
}
