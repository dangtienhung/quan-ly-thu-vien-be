import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PaginatedResponseDto,
  PaginationQueryDto,
} from '../common/dto/pagination.dto';
import { CreateAuthorDto } from './dto/create-author.dto';
import { CreateManyAuthorsDto } from './dto/create-many-authors.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { Author } from './entities/author.entity';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
  ) {}

  // Tạo mới tác giả
  async create(createAuthorDto: CreateAuthorDto): Promise<Author> {
    const author = this.authorRepository.create(createAuthorDto);
    return await this.authorRepository.save(author);
  }

  // Tạo nhiều tác giả
  async createMany(
    createManyAuthorsDto: CreateManyAuthorsDto,
  ): Promise<Author[]> {
    const authors = this.authorRepository.create(createManyAuthorsDto.authors);
    return await this.authorRepository.save(authors);
  }

  // Lấy danh sách có phân trang
  async findAll(
    query: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Author>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.authorRepository.findAndCount({
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

  // Tìm kiếm tác giả
  async search(
    query: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Author>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.authorRepository
      .createQueryBuilder('author')
      .where(
        'author.author_name ILIKE :query OR author.bio ILIKE :query OR author.nationality ILIKE :query',
        {
          query: `%${query}%`,
        },
      )
      .orderBy('author.created_at', 'DESC')
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
  async findOne(id: string): Promise<Author> {
    const author = await this.authorRepository.findOne({ where: { id } });
    if (!author) {
      throw new NotFoundException(`Không tìm thấy tác giả với ID ${id}`);
    }
    return author;
  }

  // Tìm theo slug
  async findBySlug(slug: string): Promise<Author> {
    const author = await this.authorRepository.findOne({ where: { slug } });
    if (!author) {
      throw new NotFoundException(`Không tìm thấy tác giả với slug '${slug}'`);
    }
    return author;
  }

  // Tìm theo quốc tịch
  async findByNationality(
    nationality: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Author>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.authorRepository.findAndCount({
      where: { nationality },
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

  // Cập nhật theo ID
  async update(id: string, updateAuthorDto: UpdateAuthorDto): Promise<Author> {
    const author = await this.findOne(id);
    Object.assign(author, updateAuthorDto);
    return await this.authorRepository.save(author);
  }

  // Cập nhật theo slug
  async updateBySlug(
    slug: string,
    updateAuthorDto: UpdateAuthorDto,
  ): Promise<Author> {
    const author = await this.findBySlug(slug);
    Object.assign(author, updateAuthorDto);
    return await this.authorRepository.save(author);
  }

  // Xóa theo ID
  async remove(id: string): Promise<void> {
    const author = await this.findOne(id);
    await this.authorRepository.remove(author);
  }

  // Xóa theo slug
  async removeBySlug(slug: string): Promise<void> {
    const author = await this.findBySlug(slug);
    await this.authorRepository.remove(author);
  }
}
