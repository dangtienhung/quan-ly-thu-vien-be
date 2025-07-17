import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { ReaderTypeName } from '../entities/reader-type.entity';

export class CreateReaderTypeDto {
  @ApiProperty({
    description: 'Reader type name',
    example: 'student',
    enum: ReaderTypeName,
  })
  @IsNotEmpty()
  @IsEnum(ReaderTypeName)
  typeName: ReaderTypeName;

  @ApiProperty({
    description: 'Maximum number of books that can be borrowed',
    example: 5,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  maxBorrowLimit: number;

  @ApiProperty({
    description: 'Number of days books can be borrowed',
    example: 14,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  borrowDurationDays: number;

  @ApiProperty({
    description: 'Description of the reader type',
    example: 'Students can borrow up to 5 books for 14 days',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
