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
import { Repository } from 'typeorm';
import { CreatePhysicalCopyDto } from './dto/create-physical-copy.dto';
import { UpdatePhysicalCopyDto } from './dto/update-physical-copy.dto';
import { PhysicalCopy } from './entities/physical-copy.entity';

@Injectable()
export class PhysicalCopyService {
  constructor(
    @InjectRepository(Book)
    private readonly booksService: BooksService,
    @InjectRepository(PhysicalCopy)
    private readonly physicalCopyRepository: Repository<PhysicalCopy>,
  ) {}

  // Physical Copy Methods
  async createPhysicalCopy(
    createPhysicalCopyDto: CreatePhysicalCopyDto,
  ): Promise<PhysicalCopy> {
    const book = await this.booksService.findOne(createPhysicalCopyDto.book_id);
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
}
