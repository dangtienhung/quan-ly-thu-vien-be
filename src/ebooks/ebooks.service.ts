import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BooksService } from 'src/books/books.service';
import { Book, BookType } from 'src/books/entities/book.entity';
import {
  PaginatedResponseDto,
  PaginationQueryDto,
} from 'src/common/dto/pagination.dto';
import { PhysicalCopy } from 'src/physical-copy/entities/physical-copy.entity';
import { Repository } from 'typeorm';
import { CreateEBookDto } from './dto/create-ebook.dto';
import { UpdateEBookDto } from './dto/update-ebook.dto';
import { EBook } from './entities/ebook.entity';

@Injectable()
export class EbooksService {
  constructor(
    @InjectRepository(Book)
    private readonly booksService: BooksService,
    @InjectRepository(PhysicalCopy)
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
}
