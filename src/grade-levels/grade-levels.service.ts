import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import {
  PaginatedResponseDto,
  PaginationMetaDto,
  PaginationQueryDto,
} from '../common/dto/pagination.dto';
import { CreateGradeLevelDto } from './dto/create-grade-level.dto';
import { UpdateGradeLevelDto } from './dto/update-grade-level.dto';
import { GradeLevel } from './entities/grade-level.entity';

@Injectable()
export class GradeLevelsService {
  constructor(
    @InjectRepository(GradeLevel)
    private readonly gradeLevelRepository: Repository<GradeLevel>,
  ) {}

  async create(createDto: CreateGradeLevelDto): Promise<GradeLevel> {
    const exists = await this.gradeLevelRepository.findOne({
      where: { name: createDto.name },
    });
    if (exists) {
      throw new ConflictException(
        `Khối lớp với tên '${createDto.name}' đã tồn tại`,
      );
    }
    const entity = this.gradeLevelRepository.create(createDto);
    return this.gradeLevelRepository.save(entity);
  }

  async findAll(
    pagination: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<GradeLevel>> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.gradeLevelRepository.findAndCount({
      order: { order: 'ASC', name: 'ASC' },
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

  async findAllWithoutPagination(): Promise<GradeLevel[]> {
    return this.gradeLevelRepository.find({
      order: { order: 'ASC', name: 'ASC' },
    });
  }

  async search(
    query: string,
    pagination: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<GradeLevel>> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.gradeLevelRepository.findAndCount({
      where: [
        { name: ILike(`%${query}%`) },
        { description: ILike(`%${query}%`) },
      ],
      order: { order: 'ASC', name: 'ASC' },
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

  async findOne(id: string): Promise<GradeLevel> {
    const entity = await this.gradeLevelRepository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Không tìm thấy khối lớp với ID ${id}`);
    }
    return entity;
  }

  async update(
    id: string,
    updateDto: UpdateGradeLevelDto,
  ): Promise<GradeLevel> {
    const entity = await this.findOne(id);

    if (updateDto.name && updateDto.name !== entity.name) {
      const duplicate = await this.gradeLevelRepository.findOne({
        where: { name: updateDto.name },
      });
      if (duplicate) {
        throw new ConflictException(
          `Khối lớp với tên '${updateDto.name}' đã tồn tại`,
        );
      }
    }

    Object.assign(entity, updateDto);
    return this.gradeLevelRepository.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.gradeLevelRepository.remove(entity);
  }
}
