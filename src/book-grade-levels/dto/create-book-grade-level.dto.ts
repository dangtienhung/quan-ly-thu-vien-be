import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class CreateBookGradeLevelDto {
  @ApiProperty({
    description: 'ID sách',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4')
  book_id: string;

  @ApiProperty({
    description: 'ID khối lớp',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4')
  grade_level_id: string;
}

export class BulkSetBookGradeLevelsDto {
  @ApiProperty({
    description: 'ID sách',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4')
  book_id: string;

  @ApiProperty({ description: 'Danh sách ID khối lớp', type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @Type(() => String)
  grade_level_ids: string[];
}
