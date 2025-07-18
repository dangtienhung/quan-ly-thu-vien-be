import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import slug from 'slug';
import { IsNull, Repository } from 'typeorm';
import {
  PaginatedResponseDto,
  PaginationMetaDto,
  PaginationQueryDto,
} from '../common/dto/pagination.dto';
import { CreatePublisherDto } from './dto/create-publisher.dto';
import { UpdatePublisherDto } from './dto/update-publisher.dto';
import { Publisher } from './entities/publisher.entity';

@Injectable()
export class PublishersService {
  constructor(
    @InjectRepository(Publisher)
    private readonly publisherRepository: Repository<Publisher>,
  ) {}

  // Tạo mới nhà xuất bản
  async create(createPublisherDto: CreatePublisherDto): Promise<Publisher> {
    const publisher = this.publisherRepository.create(createPublisherDto);
    return await this.publisherRepository.save(publisher);
  }

  // Lấy tất cả nhà xuất bản với phân trang
  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Publisher>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.publisherRepository.findAndCount({
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

  // Tìm nhà xuất bản theo ID
  async findOne(id: string): Promise<Publisher> {
    const publisher = await this.publisherRepository.findOne({
      where: { id },
    });
    if (!publisher) {
      throw new NotFoundException(`Không tìm thấy nhà xuất bản với ID ${id}`);
    }
    return publisher;
  }

  // Tìm nhà xuất bản theo slug
  async findBySlug(slug: string): Promise<Publisher> {
    const publisher = await this.publisherRepository.findOne({
      where: { slug },
    });
    if (!publisher) {
      throw new NotFoundException(
        `Không tìm thấy nhà xuất bản với slug '${slug}'`,
      );
    }
    return publisher;
  }

  // Tìm kiếm nhà xuất bản
  async search(
    query: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Publisher>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.publisherRepository
      .createQueryBuilder('publisher')
      .where('publisher.publisherName ILIKE :query', {
        query: `%${query}%`,
      })
      .orWhere('publisher.address ILIKE :query', { query: `%${query}%` })
      .orWhere('publisher.email ILIKE :query', { query: `%${query}%` })
      .orWhere('publisher.phone ILIKE :query', { query: `%${query}%` })
      .orWhere('publisher.country ILIKE :query', { query: `%${query}%` })
      .orderBy('publisher.createdAt', 'DESC')
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

  // Lấy nhà xuất bản theo trạng thái
  async findByStatus(
    isActive: boolean,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Publisher>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.publisherRepository.findAndCount({
      where: { isActive },
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

  // Lấy nhà xuất bản theo quốc gia
  async findByCountry(
    country: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Publisher>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.publisherRepository.findAndCount({
      where: { country },
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

  // Cập nhật nhà xuất bản
  async update(
    id: string,
    updatePublisherDto: UpdatePublisherDto,
  ): Promise<Publisher> {
    const publisher = await this.findOne(id);
    Object.assign(publisher, updatePublisherDto);
    return await this.publisherRepository.save(publisher);
  }

  // Cập nhật nhà xuất bản theo slug
  async updateBySlug(
    slugParam: string,
    updatePublisherDto: UpdatePublisherDto,
  ): Promise<Publisher> {
    const publisher = await this.findBySlug(slugParam);
    Object.assign(publisher, updatePublisherDto);
    return await this.publisherRepository.save(publisher);
  }

  // Kích hoạt/vô hiệu hóa nhà xuất bản
  async toggleStatus(id: string): Promise<Publisher> {
    const publisher = await this.findOne(id);
    publisher.isActive = !publisher.isActive;
    return await this.publisherRepository.save(publisher);
  }

  // Xóa nhà xuất bản
  async remove(id: string): Promise<void> {
    const publisher = await this.findOne(id);
    await this.publisherRepository.remove(publisher);
  }

  // Xóa nhà xuất bản theo slug
  async removeBySlug(slugParam: string): Promise<void> {
    const publisher = await this.findBySlug(slugParam);
    await this.publisherRepository.remove(publisher);
  }

  // Tạo slug cho dữ liệu cũ (Migration utility)
  async populateSlugs(): Promise<void> {
    const publishers = await this.publisherRepository.find({
      where: { slug: IsNull() },
    });

    for (const publisher of publishers) {
      if (publisher.publisherName) {
        publisher.slug = slug(publisher.publisherName, { lower: true });
        await this.publisherRepository.save(publisher);
      }
    }
  }

  // Thống kê nhà xuất bản
  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byCountry: { country: string; count: number }[];
  }> {
    const total = await this.publisherRepository.count();
    const active = await this.publisherRepository.count({
      where: { isActive: true },
    });
    const inactive = await this.publisherRepository.count({
      where: { isActive: false },
    });

    const byCountry = await this.publisherRepository
      .createQueryBuilder('publisher')
      .select('publisher.country', 'country')
      .addSelect('COUNT(*)', 'count')
      .where('publisher.country IS NOT NULL')
      .groupBy('publisher.country')
      .orderBy('count', 'DESC')
      .getRawMany();

    return {
      total,
      active,
      inactive,
      byCountry: byCountry.map((item) => ({
        country: item.country,
        count: parseInt(item.count),
      })),
    };
  }
}
