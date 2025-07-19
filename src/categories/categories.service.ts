import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import {
  PaginatedResponseDto,
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

  // Tạo mới thể loại
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    if (createCategoryDto.parent_id) {
      const parent = await this.findOne(createCategoryDto.parent_id);
      if (!parent) {
        throw new NotFoundException(
          `Không tìm thấy thể loại cha với ID ${createCategoryDto.parent_id}`,
        );
      }
    }
    const category = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(category);
  }

  // Lấy danh sách có phân trang
  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Category>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.categoryRepository.findAndCount({
      relations: ['parent', 'children'],
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

  // Lấy danh sách thể loại cha (không có parent_id)
  async findMainCategories(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Category>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.categoryRepository.findAndCount({
      where: { parent_id: IsNull() },
      relations: ['children'],
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

  // Lấy danh sách thể loại con của một thể loại
  async findSubCategories(
    parentId: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Category>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const parent = await this.findOne(parentId);

    const [data, totalItems] = await this.categoryRepository.findAndCount({
      where: { parent_id: parentId },
      relations: ['parent'],
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

  // Tìm kiếm thể loại
  async search(
    query: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Category>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.parent', 'parent')
      .leftJoinAndSelect('category.children', 'children')
      .where(
        'category.category_name ILIKE :query OR category.description ILIKE :query',
        {
          query: `%${query}%`,
        },
      )
      .orderBy('category.created_at', 'DESC')
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
  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
    if (!category) {
      throw new NotFoundException(`Không tìm thấy thể loại với ID ${id}`);
    }
    return category;
  }

  // Tìm theo slug
  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { slug },
      relations: ['parent', 'children'],
    });
    if (!category) {
      throw new NotFoundException(`Không tìm thấy thể loại với slug '${slug}'`);
    }
    return category;
  }

  // Cập nhật theo ID
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);

    if (updateCategoryDto.parent_id) {
      // Kiểm tra parent_id mới có tồn tại không
      const parent = await this.findOne(updateCategoryDto.parent_id);

      // Kiểm tra không cho phép đặt parent là chính nó
      if (updateCategoryDto.parent_id === id) {
        throw new Error('Không thể đặt thể loại làm thể loại cha của chính nó');
      }

      // Kiểm tra không cho phép đặt parent là một trong các thể loại con của nó
      const isChild = await this.isChildCategory(
        updateCategoryDto.parent_id,
        id,
      );
      if (isChild) {
        throw new Error('Không thể đặt thể loại con làm thể loại cha');
      }
    }

    Object.assign(category, updateCategoryDto);
    return await this.categoryRepository.save(category);
  }

  // Kiểm tra xem categoryId có phải là con (hoặc cháu) của parentId không
  private async isChildCategory(
    categoryId: string,
    parentId: string,
  ): Promise<boolean> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
      relations: ['children'],
    });

    if (!category) return false;
    if (category.parent_id === parentId) return true;

    for (const child of category.children || []) {
      if (await this.isChildCategory(child.id, parentId)) {
        return true;
      }
    }

    return false;
  }

  // Cập nhật theo slug
  async updateBySlug(
    slug: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findBySlug(slug);
    if (updateCategoryDto.parent_id) {
      await this.findOne(updateCategoryDto.parent_id);
    }
    Object.assign(category, updateCategoryDto);
    return await this.categoryRepository.save(category);
  }

  // Xóa theo ID
  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);

    // Kiểm tra xem có thể loại con không
    if (category.children && category.children.length > 0) {
      throw new Error('Không thể xóa thể loại có chứa thể loại con');
    }

    await this.categoryRepository.remove(category);
  }

  // Xóa theo slug
  async removeBySlug(slug: string): Promise<void> {
    const category = await this.findBySlug(slug);

    // Kiểm tra xem có thể loại con không
    if (category.children && category.children.length > 0) {
      throw new Error('Không thể xóa thể loại có chứa thể loại con');
    }

    await this.categoryRepository.remove(category);
  }
}
