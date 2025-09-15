import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import slug from 'slug';
import { EBook } from 'src/ebooks/entities/ebook.entity';
import { Repository } from 'typeorm';
import { AuthorsService } from '../authors/authors.service';
import { BookAuthorsService } from '../book-authors/book-authors.service';
import { BookCategoriesService } from '../book-categories/book-categories.service';
import { BookCategory } from '../book-categories/entities/book-category.entity';
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
import {
  BookStatisticsResponseDto,
  MainCategoryStatisticsDto,
} from './dto/book-statistics.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { FindAllBooksDto } from './dto/find-all-books.dto';
import { HierarchicalCategoryStatisticsDto } from './dto/hierarchical-category-statistics.dto';
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
    @InjectRepository(BookCategory)
    private readonly bookCategoryRepository: Repository<BookCategory>,
    private readonly authorsService: AuthorsService,
    @Inject(forwardRef(() => BookAuthorsService))
    private readonly bookAuthorsService: BookAuthorsService,
    private readonly categoriesService: CategoriesService,
    private readonly publishersService: PublishersService,
    private readonly bookCategoriesService: BookCategoriesService,
    private readonly bookGradeLevelsService: BookGradeLevelsService,
  ) {}

  /**
   * Lấy tất cả category IDs bao gồm parent và children của một category
   * @param categoryId - ID của category gốc
   * @returns Array chứa ID của category gốc và tất cả children
   */
  private async getCategoryIdsWithChildren(
    categoryId: string,
  ): Promise<string[]> {
    // Lấy category gốc
    const rootCategory = await this.bookCategoriesService.findOne(categoryId);
    if (!rootCategory) {
      return [categoryId]; // Trả về ID gốc nếu không tìm thấy
    }

    const allCategoryIds = [categoryId]; // Bắt đầu với ID gốc

    // Lấy tất cả children categories (recursive)
    const getChildrenIds = async (parentId: string): Promise<string[]> => {
      const children =
        await this.bookCategoriesService.findByParentId(parentId);
      const childrenIds: string[] = [];

      for (const child of children) {
        childrenIds.push(child.id);
        // Recursively get children of children
        const grandChildrenIds = await getChildrenIds(child.id);
        childrenIds.push(...grandChildrenIds);
      }

      return childrenIds;
    };

    const childrenIds = await getChildrenIds(categoryId);
    allCategoryIds.push(...childrenIds);

    return allCategoryIds;
  }

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

    // Tạo slug tạm thời trước khi save (với timestamp để tránh trùng lặp)
    const baseSlug = slug(createBookDto.title, { lower: true });
    const timestamp = Date.now().toString().slice(-6); // 6 ký tự cuối của timestamp
    const tempSlug = `${baseSlug}-${timestamp}`;
    book.slug = tempSlug;

    const savedBook = await this.bookRepository.save(book);

    // Tạo slug với ID sau khi đã có ID
    savedBook.generateSlugWithId();
    const updatedBook = await this.bookRepository.save(savedBook);

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

    return updatedBook;
  }

  // Lấy danh sách có phân trang
  async findAll(
    findAllBooksDto: FindAllBooksDto,
  ): Promise<PaginatedResponseDto<BookWithAuthors>> {
    const {
      page = 1,
      limit = 10,
      q,
      type,
      main_category_id,
      category_id,
      view,
    } = findAllBooksDto;
    const skip = (page - 1) * limit;

    // Tạo query builder với điều kiện lọc theo type
    const queryBuilder = this.bookRepository
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.category', 'category')
      .leftJoinAndSelect('book.publisher', 'publisher')
      .leftJoinAndSelect('book.mainCategory', 'mainCategory');

    // Sắp xếp theo view nếu có, nếu không thì sắp xếp theo created_at
    if (view) {
      queryBuilder.orderBy('book.view', view.toUpperCase() as 'ASC' | 'DESC');
    } else {
      queryBuilder.orderBy('book.created_at', 'DESC');
    }

    queryBuilder.skip(skip).take(limit);

    // Thêm điều kiện tìm kiếm theo q nếu có
    if (q) {
      queryBuilder.andWhere(
        '(book.title ILIKE :query OR book.description ILIKE :query)',
        { query: `%${q}%` },
      );
    }

    // Thêm điều kiện lọc theo type nếu có
    if (type) {
      queryBuilder.andWhere('book.book_type = :type', { type });
    }

    // Thêm điều kiện lọc theo main_category_id nếu có (bao gồm parent và children)
    if (main_category_id) {
      // Lấy tất cả category IDs bao gồm parent và children
      const categoryIds =
        await this.getCategoryIdsWithChildren(main_category_id);
      queryBuilder.andWhere('book.main_category_id IN (:...categoryIds)', {
        categoryIds,
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

    // Tạo slug với ID nếu title được cập nhật
    if (updateBookDto.title) {
      book.generateSlugWithId();
    }

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

    // Tạo slug tạm thời cho tất cả books (với timestamp để tránh trùng lặp)
    books.forEach((book, index) => {
      const baseSlug = slug(book.title, { lower: true });
      const timestamp = Date.now().toString().slice(-6); // 6 ký tự cuối của timestamp
      const tempSlug = `${baseSlug}-${timestamp}-${index}`; // Thêm index để đảm bảo unique
      book.slug = tempSlug;
    });

    const savedBooks = await this.bookRepository.save(books);

    // Tạo slug với ID cho tất cả books
    savedBooks.forEach((book) => {
      book.generateSlugWithId();
    });

    return await this.bookRepository.save(savedBooks);
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

  // Thống kê sách theo thể loại
  async getBookStatistics(): Promise<BookStatisticsResponseDto> {
    try {
      // Lấy tổng số sách
      const totalBooks = await this.bookRepository.count();

      // Lấy tổng số sách vật lý
      const totalPhysicalBooks = await this.bookRepository.count({
        where: { book_type: BookType.PHYSICAL },
      });

      // Lấy tổng số sách điện tử
      const totalEbooks = await this.bookRepository.count({
        where: { book_type: BookType.EBOOK },
      });

      // Lấy thống kê theo thể loại chính (main_category) - chỉ sách có main_category_id
      const mainCategoryStats = await this.bookRepository
        .createQueryBuilder('book')
        .leftJoin('book.mainCategory', 'mainCategory')
        .select([
          'mainCategory.id as mainCategoryId',
          'mainCategory.name as mainCategoryName',
          'COUNT(book.id) as bookCount',
          'SUM(CASE WHEN book.book_type = :physicalType THEN 1 ELSE 0 END) as physicalBookCount',
          'SUM(CASE WHEN book.book_type = :ebookType THEN 1 ELSE 0 END) as ebookCount',
        ])
        .setParameter('physicalType', BookType.PHYSICAL)
        .setParameter('ebookType', BookType.EBOOK)
        .where('book.main_category_id IS NOT NULL')
        .groupBy('mainCategory.id, mainCategory.name')
        .orderBy('bookCount', 'DESC')
        .getRawMany();

      // Lấy thống kê cho sách không có main_category_id
      const booksWithoutMainCategory = await this.bookRepository
        .createQueryBuilder('book')
        .select([
          'COUNT(book.id) as bookCount',
          'SUM(CASE WHEN book.book_type = :physicalType THEN 1 ELSE 0 END) as physicalBookCount',
          'SUM(CASE WHEN book.book_type = :ebookType THEN 1 ELSE 0 END) as ebookCount',
        ])
        .setParameter('physicalType', BookType.PHYSICAL)
        .setParameter('ebookType', BookType.EBOOK)
        .where('book.main_category_id IS NULL')
        .getRawOne();

      console.log('Raw mainCategoryStats:', mainCategoryStats);

      // Xử lý dữ liệu thống kê theo main category
      const byMainCategory: MainCategoryStatisticsDto[] = mainCategoryStats
        .filter((stat) => stat.bookcount && parseInt(stat.bookcount) > 0) // Lọc bỏ các record null
        .map((stat) => ({
          mainCategoryId: stat.maincategoryid,
          mainCategoryName: stat.maincategoryname,
          bookCount: parseInt(stat.bookcount),
          physicalBookCount: parseInt(stat.physicalbookcount),
          ebookCount: parseInt(stat.ebookcount),
          percentage:
            totalBooks > 0 ? (parseInt(stat.bookcount) / totalBooks) * 100 : 0,
        }));

      // Thêm thống kê cho sách không có main category (nếu có)
      if (
        booksWithoutMainCategory &&
        parseInt(booksWithoutMainCategory.bookcount) > 0
      ) {
        byMainCategory.push({
          mainCategoryId: 'no-category',
          mainCategoryName: 'Chưa phân loại',
          bookCount: parseInt(booksWithoutMainCategory.bookcount),
          physicalBookCount: parseInt(
            booksWithoutMainCategory.physicalbookcount,
          ),
          ebookCount: parseInt(booksWithoutMainCategory.ebookcount),
          percentage:
            totalBooks > 0
              ? (parseInt(booksWithoutMainCategory.bookcount) / totalBooks) *
                100
              : 0,
        });
      }

      // Tạo thống kê hierarchical
      const hierarchicalStats =
        await this.buildHierarchicalStatistics(totalBooks);

      return {
        totalBooks,
        totalPhysicalBooks,
        totalEbooks,
        byMainCategory,
        byHierarchicalCategory: hierarchicalStats.byHierarchicalCategory,
        byType: {
          physical: totalPhysicalBooks,
          ebook: totalEbooks,
        },
        totalMainCategories: hierarchicalStats.totalMainCategories,
        totalSubCategories: hierarchicalStats.totalSubCategories,
      };
    } catch (error) {
      console.error('Error in getBookStatistics:', error);
      throw new BadRequestException(
        'Database operation failed: ' + error.message,
      );
    }
  }

  // Helper method để tạo thống kê hierarchical
  private async buildHierarchicalStatistics(totalBooks: number): Promise<{
    byHierarchicalCategory: HierarchicalCategoryStatisticsDto[];
    totalMainCategories: number;
    totalSubCategories: number;
  }> {
    try {
      // Lấy tất cả book categories với quan hệ parent/children
      const allBookCategories = await this.bookCategoryRepository.find({
        relations: ['parent', 'children'],
        order: { name: 'ASC' },
      });

      // Lấy thống kê sách trực tiếp theo từng book category (không bao gồm children)
      const directCategoryStats = await this.bookRepository
        .createQueryBuilder('book')
        .leftJoin('book.mainCategory', 'mainCategory')
        .select([
          'mainCategory.id as categoryId',
          'mainCategory.name as categoryName',
          'mainCategory.parent_id as parentId',
          'COUNT(book.id) as directBookCount',
          'SUM(CASE WHEN book.book_type = :physicalType THEN 1 ELSE 0 END) as directPhysicalBookCount',
          'SUM(CASE WHEN book.book_type = :ebookType THEN 1 ELSE 0 END) as directEbookCount',
        ])
        .setParameter('physicalType', BookType.PHYSICAL)
        .setParameter('ebookType', BookType.EBOOK)
        .where('book.main_category_id IS NOT NULL')
        .groupBy('mainCategory.id, mainCategory.name, mainCategory.parent_id')
        .getRawMany();

      // Tạo map cho thống kê trực tiếp theo categoryId
      const directStatsMap = new Map();
      directCategoryStats.forEach((stat) => {
        directStatsMap.set(stat.categoryid, {
          directBookCount: parseInt(stat.directbookcount) || 0,
          directPhysicalBookCount: parseInt(stat.directphysicalbookcount) || 0,
          directEbookCount: parseInt(stat.directebookcount) || 0,
        });
      });

      // Hàm tính tổng sách bao gồm children (đệ quy)
      const calculateTotalStats = (
        categoryId: string,
      ): {
        totalBookCount: number;
        totalPhysicalBookCount: number;
        totalEbookCount: number;
      } => {
        const directStats = directStatsMap.get(categoryId) || {
          directBookCount: 0,
          directPhysicalBookCount: 0,
          directEbookCount: 0,
        };

        // Tìm tất cả children của category này
        const children = allBookCategories.filter(
          (cat) => cat.parent_id === categoryId,
        );

        let childrenBookCount = 0;
        let childrenPhysicalBookCount = 0;
        let childrenEbookCount = 0;

        // Tính tổng sách của tất cả children
        for (const child of children) {
          const childStats = calculateTotalStats(child.id);
          childrenBookCount += childStats.totalBookCount;
          childrenPhysicalBookCount += childStats.totalPhysicalBookCount;
          childrenEbookCount += childStats.totalEbookCount;
        }

        return {
          totalBookCount: directStats.directBookCount + childrenBookCount,
          totalPhysicalBookCount:
            directStats.directPhysicalBookCount + childrenPhysicalBookCount,
          totalEbookCount: directStats.directEbookCount + childrenEbookCount,
        };
      };

      // Tạo cấu trúc phân cấp với thống kê đúng
      const buildHierarchicalStructure = (
        categories: any[],
        parentId: string | null = null,
        level: number = 0,
      ): HierarchicalCategoryStatisticsDto[] => {
        return categories
          .filter((cat) => cat.parent_id === parentId)
          .map((category) => {
            // Tính thống kê tổng bao gồm children
            const totalStats = calculateTotalStats(category.id);

            // Lấy thống kê trực tiếp (không bao gồm children)
            const directStats = directStatsMap.get(category.id) || {
              directBookCount: 0,
              directPhysicalBookCount: 0,
              directEbookCount: 0,
            };

            // Xây dựng children
            const children = buildHierarchicalStructure(
              categories,
              category.id,
              level + 1,
            );

            return {
              categoryId: category.id,
              categoryName: category.name,
              slug: category.name.toLowerCase().replace(/\s+/g, '-'),
              description: undefined, // BookCategory không có description
              parentId: category.parent_id,
              parentName: category.parent?.name,
              bookCount: totalStats.totalBookCount, // Tổng bao gồm children
              physicalBookCount: totalStats.totalPhysicalBookCount,
              ebookCount: totalStats.totalEbookCount,
              percentage:
                totalBooks > 0
                  ? (totalStats.totalBookCount / totalBooks) * 100
                  : 0,
              expandable: children.length > 0,
              expanded: false,
              children: children.length > 0 ? children : undefined,
              level,
              isMainCategory: level === 0,
              directBookCount: directStats.directBookCount,
              directPhysicalBookCount: directStats.directPhysicalBookCount,
              directEbookCount: directStats.directEbookCount,
            };
          })
          .sort((a, b) => b.bookCount - a.bookCount); // Sắp xếp theo số lượng sách giảm dần
      };

      // Xây dựng cấu trúc phân cấp
      const hierarchicalCategories =
        buildHierarchicalStructure(allBookCategories);

      // Đếm số lượng thể loại chính và con
      const totalMainCategories = hierarchicalCategories.length;
      const totalSubCategories = allBookCategories.filter(
        (cat) => cat.parent_id !== null,
      ).length;

      return {
        byHierarchicalCategory: hierarchicalCategories,
        totalMainCategories,
        totalSubCategories,
      };
    } catch (error) {
      console.error('Error in buildHierarchicalStatistics:', error);
      throw new BadRequestException(
        'Database operation failed: ' + error.message,
      );
    }
  }
}
