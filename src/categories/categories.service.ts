import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import slug from 'slug';
import { IsNull, Repository } from 'typeorm';
import {
  PaginatedResponseDto,
  PaginationMetaDto,
  PaginationQueryDto,
} from '../common/dto/pagination.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    try {
      const category = this.categoryRepository.create(createCategoryDto);
      return await this.categoryRepository.save(category);
    } catch (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        throw new ConflictException(
          `Category with name '${createCategoryDto.name}' already exists`,
        );
      }
      throw error;
    }
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Category>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.categoryRepository.findAndCount({
      relations: ['products'],
      order: { createdAt: 'DESC' },
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

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['products'],
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { slug },
      relations: ['products'],
    });
    if (!category) {
      throw new NotFoundException(`Category with slug '${slug}' not found`);
    }
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);
    try {
      Object.assign(category, updateCategoryDto);
      return await this.categoryRepository.save(category);
    } catch (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        throw new ConflictException(
          `Category with name '${updateCategoryDto.name}' already exists`,
        );
      }
      throw error;
    }
  }

  async updateBySlug(
    slugParam: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findBySlug(slugParam);
    try {
      Object.assign(category, updateCategoryDto);
      return await this.categoryRepository.save(category);
    } catch (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        throw new ConflictException(
          `Category with name '${updateCategoryDto.name}' already exists`,
        );
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
  }

  async removeBySlug(slugParam: string): Promise<void> {
    const category = await this.findBySlug(slugParam);
    await this.categoryRepository.remove(category);
  }

  // Migration utility to populate slugs for existing data
  async populateSlugs(): Promise<void> {
    const categories = await this.categoryRepository.find({
      where: { slug: IsNull() },
    });

    for (const category of categories) {
      if (category.name) {
        category.slug = slug(category.name, { lower: true });
        await this.categoryRepository.save(category);
      }
    }
  }
}
