import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BulkSetBookGradeLevelsDto,
  CreateBookGradeLevelDto,
} from './dto/create-book-grade-level.dto';
import { BookGradeLevel } from './entities/book-grade-level.entity';

@Injectable()
export class BookGradeLevelsService {
  constructor(
    @InjectRepository(BookGradeLevel)
    private readonly repo: Repository<BookGradeLevel>,
  ) {}

  async add(dto: CreateBookGradeLevelDto): Promise<BookGradeLevel> {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async remove(book_id: string, grade_level_id: string): Promise<void> {
    await this.repo.delete({ book_id, grade_level_id });
  }

  async listByBook(book_id: string): Promise<BookGradeLevel[]> {
    return this.repo.find({ where: { book_id } });
  }

  async listByGradeLevel(grade_level_id: string): Promise<BookGradeLevel[]> {
    return this.repo.find({ where: { grade_level_id } });
  }

  async setForBook(
    payload: BulkSetBookGradeLevelsDto,
  ): Promise<{ book_id: string; grade_level_ids: string[] }> {
    const { book_id, grade_level_ids } = payload;

    await this.repo.delete({ book_id });

    if (grade_level_ids.length > 0) {
      const entities = grade_level_ids.map((gid) =>
        this.repo.create({ book_id, grade_level_id: gid }),
      );
      await this.repo.save(entities);
    }

    return { book_id, grade_level_ids };
  }
}
