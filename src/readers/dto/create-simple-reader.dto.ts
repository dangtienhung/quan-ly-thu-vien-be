import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateSimpleReaderDto {
  @ApiProperty({
    description: 'User ID to associate with this reader',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Reader full name',
    example: 'Nguyễn Văn An',
  })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({
    description: 'Library card number',
    example: 'LIB2024001',
    required: false,
  })
  @IsOptional()
  @IsString()
  cardNumber?: string;

  @ApiProperty({
    description: 'Reader type name',
    example: 'staff',
  })
  @IsNotEmpty()
  @IsString()
  readerTypeName: string;
}
