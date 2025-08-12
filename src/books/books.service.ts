import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EBook } from 'src/ebooks/entities/ebook.entity';
import { Repository } from 'typeorm';
import { AuthorsService } from '../authors/authors.service';
import { BookAuthorsService } from '../book-authors/book-authors.service';
import { BookCategoriesService } from '../book-categories/book-categories.service';
import { BookGradeLevelsService } from '../book-grade-levels/book-grade-levels.service';
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
import { FindAllBooksDto } from './dto/find-all-books.dto';
import { UpdateBookViewDto, ViewUpdateType } from './dto/update-book-view.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book, BookType } from './entities/book.entity';

// Interface cho Book với authors
interface BookWithAuthors extends Omit<Book, 'authors'> {
  authors: Array<{
    id: string;
    author_name: string;
    slug: string;
    bio?: string;
    nationality?: string;
  }>;
}

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
    @Inject(forwardRef(() => BookAuthorsService))
    private readonly bookAuthorsService: BookAuthorsService,
    private readonly categoriesService: CategoriesService,
    private readonly publishersService: PublishersService,
    private readonly bookCategoriesService: BookCategoriesService,
    private readonly bookGradeLevelsService: BookGradeLevelsService,
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

    // Kiểm tra main_category_id nếu có
    if (createBookDto.main_category_id) {
      await this.bookCategoriesService.findOne(createBookDto.main_category_id);
    }

    // Tạo sách
    const book = this.bookRepository.create(createBookDto);
    const savedBook = await this.bookRepository.save(book);

    // Tạo mối quan hệ với tác giả thông qua BookAuthors
    if (createBookDto.author_ids && createBookDto.author_ids.length > 0) {
      const bookAuthorDtos = createBookDto.author_ids.map((authorId) => ({
        book_id: savedBook.id,
        author_id: authorId,
      }));
      await this.bookAuthorsService.createMany(bookAuthorDtos);
    }

    // Thiết lập grade levels nếu có
    if (createBookDto.grade_level_ids && createBookDto.grade_level_ids.length) {
      await this.bookGradeLevelsService.setForBook({
        book_id: savedBook.id,
        grade_level_ids: createBookDto.grade_level_ids,
      });
    }

    return savedBook;
  }

  // Lấy danh sách có phân trang
  async findAll(
    findAllBooksDto: FindAllBooksDto,
  ): Promise<PaginatedResponseDto<BookWithAuthors>> {
    const {
      page = 1,
      limit = 10,
      type,
      main_category_id,
      category_id,
    } = findAllBooksDto;
    const skip = (page - 1) * limit;

    // Tạo query builder với điều kiện lọc theo type
    const queryBuilder = this.bookRepository
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.category', 'category')
      .leftJoinAndSelect('book.publisher', 'publisher')
      .leftJoinAndSelect('book.mainCategory', 'mainCategory')
      .orderBy('book.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    // Thêm điều kiện lọc theo type nếu có
    if (type) {
      queryBuilder.andWhere('book.book_type = :type', { type });
    }

    // Thêm điều kiện lọc theo main_category_id nếu có
    if (main_category_id) {
      queryBuilder.andWhere('book.main_category_id = :main_category_id', {
        main_category_id,
      });
    }

    // Thêm điều kiện lọc theo category_id nếu có
    if (category_id) {
      queryBuilder.andWhere('book.category_id = :category_id', { category_id });
    }

    const [data, totalItems] = await queryBuilder.getManyAndCount();

    // Lấy thông tin tác giả cho từng sách
    const booksWithAuthors = await Promise.all(
      data.map(async (book) => {
        const bookAuthorsResponse = await this.bookAuthorsService.findByBookId(
          book.id,
          { page: 1, limit: 100 },
        );

        const authors = bookAuthorsResponse.data.map((ba) => ({
          id: ba.author.id,
          author_name: ba.author.author_name,
          slug: ba.author.slug,
          bio: ba.author.bio,
          nationality: ba.author.nationality,
        }));

        return {
          ...book,
          authors,
        } as BookWithAuthors;
      }),
    );

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      data: booksWithAuthors,
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
  ): Promise<PaginatedResponseDto<BookWithAuthors>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.bookRepository
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.category', 'category')
      .leftJoinAndSelect('book.publisher', 'publisher')
      .leftJoinAndSelect('book.mainCategory', 'mainCategory')
      .where(
        'book.title ILIKE :query OR book.description ILIKE :query OR book.isbn ILIKE :query',
        { query: `%${query}%` },
      )
      .orderBy('book.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // Lấy thông tin tác giả cho từng sách
    const booksWithAuthors = await Promise.all(
      data.map(async (book) => {
        const bookAuthorsResponse = await this.bookAuthorsService.findByBookId(
          book.id,
          { page: 1, limit: 100 },
        );

        const authors = bookAuthorsResponse.data.map((ba) => ({
          id: ba.author.id,
          author_name: ba.author.author_name,
          slug: ba.author.slug,
          bio: ba.author.bio,
          nationality: ba.author.nationality,
        }));

        return {
          ...book,
          authors,
        } as BookWithAuthors;
      }),
    );

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      data: booksWithAuthors,
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
  async findOne(id: string): Promise<BookWithAuthors> {
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: ['category', 'publisher', 'mainCategory'],
    });
    if (!book) {
      throw new NotFoundException(`Không tìm thấy sách với ID ${id}`);
    }

    // Lấy thông tin tác giả
    const bookAuthorsResponse = await this.bookAuthorsService.findByBookId(
      book.id,
      { page: 1, limit: 100 },
    );

    const authors = bookAuthorsResponse.data.map((ba) => ({
      id: ba.author.id,
      author_name: ba.author.author_name,
      slug: ba.author.slug,
      bio: ba.author.bio,
      nationality: ba.author.nationality,
    }));

    return {
      ...book,
      authors,
    } as BookWithAuthors;
  }

  // Tìm theo slug
  async findBySlug(slug: string): Promise<BookWithAuthors> {
    const book = await this.bookRepository.findOne({
      where: { slug },
      relations: ['category', 'publisher', 'mainCategory'],
    });
    if (!book) {
      throw new NotFoundException(`Không tìm thấy sách với slug '${slug}'`);
    }

    // Lấy thông tin tác giả
    const bookAuthorsResponse = await this.bookAuthorsService.findByBookId(
      book.id,
      { page: 1, limit: 100 },
    );

    const authors = bookAuthorsResponse.data.map((ba) => ({
      id: ba.author.id,
      author_name: ba.author.author_name,
      slug: ba.author.slug,
      bio: ba.author.bio,
      nationality: ba.author.nationality,
    }));

    return {
      ...book,
      authors,
    } as BookWithAuthors;
  }

  // Tìm theo ISBN
  async findByIsbn(isbn: string): Promise<BookWithAuthors> {
    const book = await this.bookRepository.findOne({
      where: { isbn },
      relations: ['category', 'publisher', 'mainCategory'],
    });
    if (!book) {
      throw new NotFoundException(`Không tìm thấy sách với ISBN ${isbn}`);
    }

    // Lấy thông tin tác giả
    const bookAuthorsResponse = await this.bookAuthorsService.findByBookId(
      book.id,
      { page: 1, limit: 100 },
    );

    const authors = bookAuthorsResponse.data.map((ba) => ({
      id: ba.author.id,
      author_name: ba.author.author_name,
      slug: ba.author.slug,
      bio: ba.author.bio,
      nationality: ba.author.nationality,
    }));

    return {
      ...book,
      authors,
    } as BookWithAuthors;
  }

  // Cập nhật theo ID
  async update(
    id: string,
    updateBookDto: UpdateBookDto,
  ): Promise<BookWithAuthors> {
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: ['category', 'publisher', 'mainCategory'],
    });
    if (!book) {
      throw new NotFoundException(`Không tìm thấy sách với ID ${id}`);
    }

    // Kiểm tra thể loại nếu được cập nhật
    if (updateBookDto.category_id) {
      await this.categoriesService.findOne(updateBookDto.category_id);
    }

    // Kiểm tra nhà xuất bản nếu được cập nhật
    if (updateBookDto.publisher_id) {
      await this.publishersService.findOne(updateBookDto.publisher_id);
    }

    // Kiểm tra main_category_id nếu có
    if (updateBookDto.main_category_id) {
      await this.bookCategoriesService.findOne(updateBookDto.main_category_id);
    }

    // Cập nhật mối quan hệ với tác giả nếu được cập nhật
    if (updateBookDto.author_ids) {
      // Kiểm tra các tác giả tồn tại
      await Promise.all(
        updateBookDto.author_ids.map((id) => this.authorsService.findOne(id)),
      );

      // Xóa tất cả mối quan hệ cũ
      await this.bookAuthorsService.removeByBookId(id);

      // Tạo mối quan hệ mới
      if (updateBookDto.author_ids.length > 0) {
        const bookAuthorDtos = updateBookDto.author_ids.map((authorId) => ({
          book_id: id,
          author_id: authorId,
        }));
        await this.bookAuthorsService.createMany(bookAuthorDtos);
      }
    }

    // Cập nhật grade levels nếu có
    if (updateBookDto.grade_level_ids) {
      await this.bookGradeLevelsService.setForBook({
        book_id: id,
        grade_level_ids: updateBookDto.grade_level_ids,
      });
    }

    // Cập nhật thông tin sách
    Object.assign(book, updateBookDto);
    const updatedBook = await this.bookRepository.save(book);

    // Lấy thông tin tác giả
    const bookAuthorsResponse = await this.bookAuthorsService.findByBookId(
      updatedBook.id,
      { page: 1, limit: 100 },
    );

    const authors = bookAuthorsResponse.data.map((ba) => ({
      id: ba.author.id,
      author_name: ba.author.author_name,
      slug: ba.author.slug,
      bio: ba.author.bio,
      nationality: ba.author.nationality,
    }));

    return {
      ...updatedBook,
      authors,
    } as BookWithAuthors;
  }

  // Cập nhật theo slug
  async updateBySlug(
    slug: string,
    updateBookDto: UpdateBookDto,
  ): Promise<BookWithAuthors> {
    const book = await this.findBySlug(slug);
    return await this.update(book.id, updateBookDto);
  }

  // Xóa theo ID
  async remove(id: string): Promise<void> {
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: ['category', 'publisher', 'mainCategory'],
    });
    if (!book) {
      throw new NotFoundException(`Không tìm thấy sách với ID ${id}`);
    }
    await this.bookRepository.remove(book);
  }

  // Xóa theo slug
  async removeBySlug(slug: string): Promise<void> {
    const book = await this.bookRepository.findOne({
      where: { slug },
      relations: ['category', 'publisher', 'mainCategory'],
    });
    if (!book) {
      throw new NotFoundException(`Không tìm thấy sách với slug '${slug}'`);
    }
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

  // Cập nhật số lượt xem sách
  async updateView(
    id: string,
    updateBookViewDto: UpdateBookViewDto,
  ): Promise<Book> {
    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) {
      throw new NotFoundException(`Không tìm thấy sách với ID ${id}`);
    }

    const { type = ViewUpdateType.INCREMENT, value } = updateBookViewDto;

    if (type === ViewUpdateType.INCREMENT) {
      book.view += 1;
    } else if (type === ViewUpdateType.SET) {
      if (value === undefined || value < 0) {
        throw new BadRequestException(
          'Giá trị số lượt xem phải là số không âm',
        );
      }
      book.view = value;
    }

    return await this.bookRepository.save(book);
  }

  // Cập nhật số lượt xem sách theo slug
  async updateViewBySlug(
    slug: string,
    updateBookViewDto: UpdateBookViewDto,
  ): Promise<Book> {
    const book = await this.bookRepository.findOne({ where: { slug } });
    if (!book) {
      throw new NotFoundException(`Không tìm thấy sách với slug '${slug}'`);
    }

    const { type = ViewUpdateType.INCREMENT, value } = updateBookViewDto;

    if (type === ViewUpdateType.INCREMENT) {
      book.view += 1;
    } else if (type === ViewUpdateType.SET) {
      if (value === undefined || value < 0) {
        throw new BadRequestException(
          'Giá trị số lượt xem phải là số không âm',
        );
      }
      book.view = value;
    }

    return await this.bookRepository.save(book);
  }

  // Lấy sách mới thêm vào
  async findLatestBooks(limit: number = 20): Promise<BookWithAuthors[]> {
    // Validate limit
    if (limit && (limit < 1 || limit > 50)) {
      throw new BadRequestException('Limit phải từ 1 đến 50');
    }

    const queryBuilder = this.bookRepository
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.category', 'category')
      .leftJoinAndSelect('book.publisher', 'publisher')
      .leftJoinAndSelect('book.mainCategory', 'mainCategory')
      .orderBy('book.created_at', 'DESC')
      .take(limit);

    const data = await queryBuilder.getMany();

    // Lấy thông tin tác giả cho từng sách
    const booksWithAuthors = await Promise.all(
      data.map(async (book) => {
        const bookAuthorsResponse = await this.bookAuthorsService.findByBookId(
          book.id,
          { page: 1, limit: 100 },
        );

        const authors = bookAuthorsResponse.data.map((ba) => ({
          id: ba.author.id,
          author_name: ba.author.author_name,
          slug: ba.author.slug,
          bio: ba.author.bio,
          nationality: ba.author.nationality,
        }));

        return {
          ...book,
          authors,
        } as BookWithAuthors;
      }),
    );

    return booksWithAuthors;
  }
}
