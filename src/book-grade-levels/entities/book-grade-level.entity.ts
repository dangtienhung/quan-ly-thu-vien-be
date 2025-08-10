import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Entity, JoinColumn, ManyToOne, PrimaryColumn, Unique } from 'typeorm';
import { Book } from '../../books/entities/book.entity';
import { GradeLevel } from '../../grade-levels/entities/grade-level.entity';

@Entity('book_grade_levels')
@Unique(['book_id', 'grade_level_id'])
export class BookGradeLevel {
  @ApiProperty({
    description: 'ID sách',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryColumn('uuid')
  book_id: string;

  @ApiProperty({
    description: 'ID khối lớp',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryColumn('uuid')
  grade_level_id: string;

  @ApiHideProperty()
  @ManyToOne(() => Book, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'book_id' })
  book?: Book;

  @ApiHideProperty()
  @ManyToOne(() => GradeLevel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'grade_level_id' })
  gradeLevel?: GradeLevel;
}
