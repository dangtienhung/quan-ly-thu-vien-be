import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import slug from 'slug';
import { IsNull, Repository } from 'typeorm';
import {
  PaginatedResponseDto,
  PaginationMetaDto,
  PaginationQueryDto,
} from '../common/dto/pagination.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location } from './entities/location.entity';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}

  // Tạo mới
  async create(createLocationDto: CreateLocationDto): Promise<Location> {
    const location = this.locationRepository.create(createLocationDto);
    return await this.locationRepository.save(location);
  }

  // Lấy tất cả với phân trang
  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Location>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.locationRepository.findAndCount({
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

  // Tìm theo ID
  async findOne(id: string): Promise<Location> {
    const location = await this.locationRepository.findOne({ where: { id } });
    if (!location) {
      throw new NotFoundException(`Không tìm thấy vị trí với ID ${id}`);
    }
    return location;
  }

  // Tìm theo slug
  async findBySlug(slug: string): Promise<Location> {
    const location = await this.locationRepository.findOne({ where: { slug } });
    if (!location) {
      throw new NotFoundException(`Không tìm thấy vị trí với slug '${slug}'`);
    }
    return location;
  }

  // Tìm kiếm
  async search(
    query: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Location>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.locationRepository
      .createQueryBuilder('location')
      .where('location.name ILIKE :query', { query: `%${query}%` })
      .orWhere('location.description ILIKE :query', { query: `%${query}%` })
      .orWhere('location.section ILIKE :query', { query: `%${query}%` })
      .orWhere('location.shelf ILIKE :query', { query: `%${query}%` })
      .orderBy('location.createdAt', 'DESC')
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

  // Cập nhật
  async update(
    id: string,
    updateLocationDto: UpdateLocationDto,
  ): Promise<Location> {
    const location = await this.findOne(id);
    Object.assign(location, updateLocationDto);
    return await this.locationRepository.save(location);
  }

  // Cập nhật theo slug
  async updateBySlug(
    slugParam: string,
    updateLocationDto: UpdateLocationDto,
  ): Promise<Location> {
    const location = await this.findBySlug(slugParam);
    Object.assign(location, updateLocationDto);
    return await this.locationRepository.save(location);
  }

  // Xóa
  async remove(id: string): Promise<void> {
    const location = await this.findOne(id);
    await this.locationRepository.remove(location);
  }

  // Xóa theo slug
  async removeBySlug(slugParam: string): Promise<void> {
    const location = await this.findBySlug(slugParam);
    await this.locationRepository.remove(location);
  }

  // Tạo slug cho dữ liệu cũ (Migration utility)
  async populateSlugs(): Promise<void> {
    const locations = await this.locationRepository.find({
      where: { slug: IsNull() },
    });

    for (const location of locations) {
      if (location.name) {
        location.slug = slug(location.name, { lower: true });
        await this.locationRepository.save(location);
      }
    }
  }
}
