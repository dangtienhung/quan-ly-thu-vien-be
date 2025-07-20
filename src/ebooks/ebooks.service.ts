import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BooksService } from 'src/books/books.service';
import { BookType } from 'src/books/entities/book.entity';
import {
  PaginatedResponseDto,
  PaginationMetaDto,
  PaginationQueryDto,
} from 'src/common/dto/pagination.dto';
import { Between, In, MoreThan, Repository } from 'typeorm';
import { CreateEBookDto } from './dto/create-ebook.dto';
import { UpdateEBookDto } from './dto/update-ebook.dto';
import { EBook } from './entities/ebook.entity';

@Injectable()
export class EbooksService {
  constructor(
    private readonly booksService: BooksService,
    @InjectRepository(EBook)
    private readonly ebookRepository: Repository<EBook>,
  ) {}

  // EBook Methods
  async createEBook(createEBookDto: CreateEBookDto): Promise<EBook> {
    const book = await this.booksService.findOne(createEBookDto.book_id);
    if (book.book_type !== BookType.EBOOK) {
      throw new BadRequestException('Chỉ có thể tạo file cho sách điện tử');
    }

    const ebook = this.ebookRepository.create(createEBookDto);
    return await this.ebookRepository.save(ebook);
  }

  async findEBooks(
    bookId: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<EBook>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.ebookRepository.findAndCount({
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

  async updateEBook(
    id: string,
    updateEBookDto: UpdateEBookDto,
  ): Promise<EBook> {
    const ebook = await this.ebookRepository.findOne({
      where: { id },
      relations: ['book'],
    });
    if (!ebook) {
      throw new NotFoundException(`Không tìm thấy ebook với ID ${id}`);
    }

    Object.assign(ebook, updateEBookDto);
    return await this.ebookRepository.save(ebook);
  }

  async removeEBook(id: string): Promise<void> {
    const ebook = await this.ebookRepository.findOne({ where: { id } });
    if (!ebook) {
      throw new NotFoundException(`Không tìm thấy ebook với ID ${id}`);
    }
    await this.ebookRepository.remove(ebook);
  }

  // Additional Methods

  async incrementEBookDownloadCount(id: string): Promise<EBook> {
    const ebook = await this.ebookRepository.findOne({ where: { id } });
    if (!ebook) {
      throw new NotFoundException(`Không tìm thấy ebook với ID ${id}`);
    }

    ebook.download_count += 1;
    return await this.ebookRepository.save(ebook);
  }

  // Bổ sung các method mới

  // Lấy tất cả ebook với phân trang
  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<EBook>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.ebookRepository.findAndCount({
      relations: ['book'],
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

  // Tìm kiếm ebook
  async search(
    query: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<EBook>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.ebookRepository
      .createQueryBuilder('ebook')
      .leftJoinAndSelect('ebook.book', 'book')
      .where('book.title ILIKE :query', { query: `%${query}%` })
      .orWhere('book.isbn ILIKE :query', { query: `%${query}%` })
      .orWhere('ebook.file_format ILIKE :query', { query: `%${query}%` })
      .orderBy('ebook.created_at', 'DESC')
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

  // Lọc theo định dạng file
  async findByFormat(
    format: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<EBook>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.ebookRepository.findAndCount({
      where: { file_format: format },
      relations: ['book'],
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

  // Lọc theo kích thước file
  async findBySizeRange(
    minSize: number,
    maxSize: number,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<EBook>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.ebookRepository.findAndCount({
      where: {
        file_size: Between(minSize, maxSize),
      },
      relations: ['book'],
      order: { file_size: 'ASC' },
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

  // Lấy ebook phổ biến (nhiều lượt tải)
  async findPopular(limit: number = 10): Promise<EBook[]> {
    return await this.ebookRepository.find({
      relations: ['book'],
      order: { download_count: 'DESC' },
      take: limit,
    });
  }

  // Lấy ebook mới nhất
  async findRecent(limit: number = 10): Promise<EBook[]> {
    return await this.ebookRepository.find({
      relations: ['book'],
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  // Lấy ebook theo lượt tải
  async findByDownloadCount(
    minDownloads: number,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<EBook>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.ebookRepository.findAndCount({
      where: { download_count: MoreThan(minDownloads) },
      relations: ['book'],
      order: { download_count: 'DESC' },
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

  // Tìm ebook theo ID
  async findOne(id: string): Promise<EBook> {
    const ebook = await this.ebookRepository.findOne({
      where: { id },
      relations: ['book'],
    });

    if (!ebook) {
      throw new NotFoundException(`Không tìm thấy ebook với ID ${id}`);
    }

    return ebook;
  }

  // Lấy thống kê ebook
  async getStats(): Promise<{
    total: number;
    totalDownloads: number;
    totalSize: number;
    byFormat: { format: string; count: number; totalSize: number }[];
    popularEbooks: { id: string; title: string; downloads: number }[];
    recentUploads: { id: string; title: string; uploadDate: string }[];
  }> {
    const [total, totalDownloads, totalSize] = await Promise.all([
      this.ebookRepository.count(),
      this.ebookRepository
        .createQueryBuilder('ebook')
        .select('SUM(ebook.download_count)', 'total')
        .getRawOne(),
      this.ebookRepository
        .createQueryBuilder('ebook')
        .select('SUM(ebook.file_size)', 'total')
        .getRawOne(),
    ]);

    // Thống kê theo định dạng
    const formatStats = await this.ebookRepository
      .createQueryBuilder('ebook')
      .select('ebook.file_format', 'format')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(ebook.file_size)', 'totalSize')
      .groupBy('ebook.file_format')
      .getRawMany();

    const byFormat = formatStats.map((stat) => ({
      format: stat.format,
      count: parseInt(stat.count),
      totalSize: parseInt(stat.totalSize) || 0,
    }));

    // Ebook phổ biến
    const popularEbooks = await this.ebookRepository
      .createQueryBuilder('ebook')
      .leftJoinAndSelect('ebook.book', 'book')
      .select(['ebook.id', 'book.title', 'ebook.download_count'])
      .orderBy('ebook.download_count', 'DESC')
      .limit(10)
      .getRawMany();

    const popular = popularEbooks.map((ebook) => ({
      id: ebook.ebook_id,
      title: ebook.book_title,
      downloads: parseInt(ebook.ebook_download_count),
    }));

    // Ebook mới nhất
    const recentUploads = await this.ebookRepository
      .createQueryBuilder('ebook')
      .leftJoinAndSelect('ebook.book', 'book')
      .select(['ebook.id', 'book.title', 'ebook.created_at'])
      .orderBy('ebook.created_at', 'DESC')
      .limit(10)
      .getRawMany();

    const recent = recentUploads.map((ebook) => ({
      id: ebook.ebook_id,
      title: ebook.book_title,
      uploadDate: ebook.ebook_created_at,
    }));

    return {
      total,
      totalDownloads: parseInt(totalDownloads.total) || 0,
      totalSize: parseInt(totalSize.total) || 0,
      byFormat,
      popularEbooks: popular,
      recentUploads: recent,
    };
  }

  // Tạo nhiều ebook cùng lúc
  async createMany(
    bookId: string,
    ebooks: Partial<CreateEBookDto>[],
  ): Promise<EBook[]> {
    const book = await this.booksService.findOne(bookId);
    if (book.book_type !== BookType.EBOOK) {
      throw new BadRequestException('Chỉ có thể tạo file cho sách điện tử');
    }

    const ebookEntities = ebooks.map((ebookData) =>
      this.ebookRepository.create({
        ...ebookData,
        book_id: bookId,
      }),
    );

    return await this.ebookRepository.save(ebookEntities);
  }

  // Cập nhật thông tin file
  async updateFileInfo(
    id: string,
    fileInfo: { file_path?: string; file_size?: number; file_format?: string },
  ): Promise<EBook> {
    const ebook = await this.findOne(id);

    Object.assign(ebook, fileInfo);
    return await this.ebookRepository.save(ebook);
  }

  // Xóa nhiều ebook
  async removeMany(ids: string[]): Promise<void> {
    const ebooks = await this.ebookRepository.find({
      where: { id: In(ids) },
    });

    if (ebooks.length !== ids.length) {
      throw new NotFoundException('Một số ebook không tồn tại');
    }

    await this.ebookRepository.remove(ebooks);
  }

  // Lấy ebook theo tác giả
  async findByAuthor(
    authorId: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<EBook>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.ebookRepository
      .createQueryBuilder('ebook')
      .leftJoinAndSelect('ebook.book', 'book')
      .leftJoin('book.bookAuthors', 'bookAuthor')
      .leftJoin('bookAuthor.author', 'author')
      .where('author.id = :authorId', { authorId })
      .orderBy('ebook.created_at', 'DESC')
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

  // Lấy ebook theo thể loại
  async findByCategory(
    categoryId: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<EBook>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.ebookRepository
      .createQueryBuilder('ebook')
      .leftJoinAndSelect('ebook.book', 'book')
      .leftJoin('book.category', 'category')
      .where('category.id = :categoryId', { categoryId })
      .orderBy('ebook.created_at', 'DESC')
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
}
