import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import slug from 'slug';
import { IsNull, Repository } from 'typeorm';
import { Category } from '../categories/entities/category.entity';
import {
  PaginatedResponseDto,
  PaginationMetaDto,
  PaginationQueryDto,
} from '../common/dto/pagination.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Product>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.productRepository.findAndCount({
      relations: ['category'],
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

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { slug },
      relations: ['category'],
    });
    if (!product) {
      throw new NotFoundException(`Product with slug '${slug}' not found`);
    }
    return product;
  }

  async assignCategory(
    productId: string,
    categoryId: string,
  ): Promise<Product> {
    // Verify category exists
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    // Get product and update category
    const product = await this.findOne(productId);
    product.categoryId = categoryId;
    await this.productRepository.save(product);

    // Return with category relation loaded
    return this.findOne(productId);
  }

  async removeCategory(productId: string): Promise<Product> {
    const product = await this.findOne(productId);
    product.categoryId = undefined;
    await this.productRepository.save(product);

    // Return with category relation loaded
    return this.findOne(productId);
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id); // This will throw NotFoundException if not found
    Object.assign(product, updateProductDto);
    return await this.productRepository.save(product);
  }

  async updateBySlug(
    slug: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findBySlug(slug); // This will throw NotFoundException if not found
    Object.assign(product, updateProductDto);
    return await this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id); // This will throw NotFoundException if not found
    await this.productRepository.remove(product);
  }

  async removeBySlug(slug: string): Promise<void> {
    const product = await this.findBySlug(slug); // This will throw NotFoundException if not found
    await this.productRepository.remove(product);
  }

  // Migration utility to populate slugs for existing data
  async populateSlugs(): Promise<void> {
    const products = await this.productRepository.find({
      where: { slug: IsNull() },
    });

    for (const product of products) {
      if (product.name) {
        product.slug = slug(product.name, { lower: true });
        await this.productRepository.save(product);
      }
    }
  }
}
