import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EBook } from 'src/ebooks/entities/ebook.entity';
import { Repository } from 'typeorm';
import { AuthorsService } from '../authors/authors.service';
import { CategoriesService } from '../categories/categories.service';
import {
  PaginatedResponseDto,
  PaginationQueryDto,
} from '../common/dto/pagination.dto';
import { CreatePhysicalCopyDto } from '../physical-copy/dto/create-physical-copy.dto';
import { UpdatePhysicalCopyDto } from '../physical-copy/dto/update-physical-copy.dto';
import { PhysicalCopy } from '../physical-copy/entities/physical-copy.entity';
import { PublishersService } from '../publishers/publishers.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book, BookType } from './entities/book.entity';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(PhysicalCopy)
    private readonly physicalCopyRepository: Repository<PhysicalCopy>,
    @InjectRepository(EBook)
    private readonly ebookRepository: Repository<EBook>,
    private readonly authorsService: AuthorsService,
    private readonly categoriesService: CategoriesService,
    private readonly publishersService: PublishersService,
  ) {}

  // Tạo sách mới
  async create(createBookDto: CreateBookDto): Promise<Book> {
    // Kiểm tra thể loại tồn tại
    await this.categoriesService.findOne(createBookDto.category_id);

    // Kiểm tra nhà xuất bản tồn tại
    await this.publishersService.findOne(createBookDto.publisher_id);

    // Kiểm tra các tác giả tồn tại
    await Promise.all(
      createBookDto.author_ids.map((id) => this.authorsService.findOne(id)),
    );

    // Kiểm tra physical_type nếu là sách vật lý
    if (
      createBookDto.book_type === BookType.PHYSICAL &&
      !createBookDto.physical_type
    ) {
      throw new BadRequestException('Sách vật lý phải có physical_type');
    }

    // Tạo sách
    const book = this.bookRepository.create(createBookDto);
    const savedBook = await this.bookRepository.save(book);

    // Thêm quan hệ với tác giả
    savedBook.authors = await Promise.all(
      createBookDto.author_ids.map((id) => this.authorsService.findOne(id)),
    );

    return await this.bookRepository.save(savedBook);
  }

  // Lấy danh sách có phân trang
  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Book>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.bookRepository.findAndCount({
      relations: ['category', 'publisher', 'authors'],
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

  // Tìm kiếm sách
  async search(
    query: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Book>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.bookRepository
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.category', 'category')
      .leftJoinAndSelect('book.publisher', 'publisher')
      .leftJoinAndSelect('book.authors', 'authors')
      .where(
        'book.title ILIKE :query OR book.description ILIKE :query OR book.isbn ILIKE :query',
        { query: `%${query}%` },
      )
      .orderBy('book.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

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

  // Tìm theo ID
  async findOne(id: string): Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: ['category', 'publisher', 'authors'],
    });
    if (!book) {
      throw new NotFoundException(`Không tìm thấy sách với ID ${id}`);
    }
    return book;
  }

  // Tìm theo slug
  async findBySlug(slug: string): Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: { slug },
      relations: ['category', 'publisher', 'authors'],
    });
    if (!book) {
      throw new NotFoundException(`Không tìm thấy sách với slug '${slug}'`);
    }
    return book;
  }

  // Tìm theo ISBN
  async findByIsbn(isbn: string): Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: { isbn },
      relations: ['category', 'publisher', 'authors'],
    });
    if (!book) {
      throw new NotFoundException(`Không tìm thấy sách với ISBN ${isbn}`);
    }
    return book;
  }

  // Cập nhật theo ID
  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    const book = await this.findOne(id);

    // Kiểm tra thể loại nếu được cập nhật
    if (updateBookDto.category_id) {
      await this.categoriesService.findOne(updateBookDto.category_id);
    }

    // Kiểm tra nhà xuất bản nếu được cập nhật
    if (updateBookDto.publisher_id) {
      await this.publishersService.findOne(updateBookDto.publisher_id);
    }

    // Kiểm tra các tác giả nếu được cập nhật
    if (updateBookDto.author_ids) {
      await Promise.all(
        updateBookDto.author_ids.map((id) => this.authorsService.findOne(id)),
      );
      book.authors = await Promise.all(
        updateBookDto.author_ids.map((id) => this.authorsService.findOne(id)),
      );
    }

    // Cập nhật thông tin sách
    Object.assign(book, updateBookDto);
    return await this.bookRepository.save(book);
  }

  // Cập nhật theo slug
  async updateBySlug(
    slug: string,
    updateBookDto: UpdateBookDto,
  ): Promise<Book> {
    const book = await this.findBySlug(slug);
    return await this.update(book.id, updateBookDto);
  }

  // Xóa theo ID
  async remove(id: string): Promise<void> {
    const book = await this.findOne(id);
    await this.bookRepository.remove(book);
  }

  // Xóa theo slug
  async removeBySlug(slug: string): Promise<void> {
    const book = await this.findBySlug(slug);
    await this.bookRepository.remove(book);
  }

  // Physical Copy Methods

  async createPhysicalCopy(
    createPhysicalCopyDto: CreatePhysicalCopyDto,
  ): Promise<PhysicalCopy> {
    const book = await this.findOne(createPhysicalCopyDto.book_id);
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

  // Ebook Methods
  async createMany(createBookDtos: CreateBookDto[]): Promise<Book[]> {
    const books = this.bookRepository.create(createBookDtos);
    return await this.bookRepository.save(books);
  }
}
