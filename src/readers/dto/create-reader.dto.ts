import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../entities/reader.entity';

export class CreateReaderDto {
  @ApiProperty({
    description: 'User ID to associate with this reader',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Reader type ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID()
  readerTypeId: string;

  @ApiProperty({
    description: 'Reader full name',
    example: 'Nguyễn Văn An',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  fullName: string;

  @ApiProperty({
    description: 'Date of birth',
    example: '1995-06-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dob?: string;

  @ApiProperty({
    description: 'Gender',
    example: 'male',
    enum: Gender,
    required: false,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({
    description: 'Home address',
    example: '123 Đường ABC, Quận 1, TP.HCM',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'Phone number',
    example: '0123456789',
    maxLength: 20,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({
    description: 'Library card number',
    example: 'LIB2024001',
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  cardNumber?: string;

  @ApiProperty({
    description: 'Card issue date',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  cardIssueDate?: string;

  @ApiProperty({
    description: 'Card expiry date',
    example: '2025-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  cardExpiryDate?: string;
}
