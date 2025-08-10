import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Not, Repository } from 'typeorm';
import {
  PaginatedResponseDto,
  PaginationMetaDto,
  PaginationQueryDto,
} from '../common/dto/pagination.dto';
import { CreateBookCategoryDto } from './dto/create-book-category.dto';
import { UpdateBookCategoryDto } from './dto/update-book-category.dto';
import { BookCategory } from './entities/book-category.entity';

@Injectable()
export class BookCategoriesService {
  constructor(
    @InjectRepository(BookCategory)
    private readonly categoryRepo: Repository<BookCategory>,
  ) {}

  private async ensureNameUnique(name: string, excludeId?: string) {
    const where = excludeId ? { id: Not(excludeId), name } : ({ name } as any);
    const existed = await this.categoryRepo.findOne({ where });
    if (existed) {
      throw new ConflictException(`Thể loại với tên '${name}' đã tồn tại`);
    }
  }

  private async resolveParent(
    parent_id?: string | null,
  ): Promise<BookCategory | null> {
    if (!parent_id) return null;
    const parent = await this.categoryRepo.findOne({
      where: { id: parent_id },
    });
    if (!parent)
      throw new NotFoundException(
        `Không tìm thấy danh mục cha với ID ${parent_id}`,
      );
    return parent;
  }

  async create(dto: CreateBookCategoryDto): Promise<BookCategory> {
    await this.ensureNameUnique(dto.name);
    const entity = this.categoryRepo.create({
      name: dto.name,
      parent_id: dto.parent_id ?? null,
    });

    if (dto.parent_id) {
      entity.parent = await this.resolveParent(dto.parent_id);
    }

    return this.categoryRepo.save(entity);
  }

  async findAll(
    pagination: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BookCategory>> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.categoryRepo.findAndCount({
      relations: { parent: true },
      order: { name: 'ASC' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalItems / limit) || 1;
    const meta: PaginationMetaDto = {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    return { data, meta };
  }

  async findAllWithoutPagination(): Promise<BookCategory[]> {
    return this.categoryRepo.find({
      relations: { parent: true },
      order: { name: 'ASC' },
    });
  }

  async search(
    query: string,
    pagination: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<BookCategory>> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.categoryRepo.findAndCount({
      where: [{ name: ILike(`%${query}%`) }],
      relations: { parent: true },
      order: { name: 'ASC' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalItems / limit) || 1;
    const meta: PaginationMetaDto = {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    return { data, meta };
  }

  async findOne(id: string): Promise<BookCategory> {
    const entity = await this.categoryRepo.findOne({
      where: { id },
      relations: { parent: true, children: true },
    });
    if (!entity)
      throw new NotFoundException(`Không tìm thấy thể loại với ID ${id}`);
    return entity;
  }

  async update(id: string, dto: UpdateBookCategoryDto): Promise<BookCategory> {
    const entity = await this.findOne(id);

    if (dto.name && dto.name !== entity.name) {
      await this.ensureNameUnique(dto.name, id);
    }

    if (dto.parent_id !== undefined) {
      if (dto.parent_id === id) {
        throw new BadRequestException('Danh mục cha không thể là chính nó');
      }
      entity.parent = await this.resolveParent(dto.parent_id ?? undefined);
      entity.parent_id = dto.parent_id ?? null;
    }

    if (dto.name) entity.name = dto.name;

    return this.categoryRepo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.categoryRepo.remove(entity);
  }
}
