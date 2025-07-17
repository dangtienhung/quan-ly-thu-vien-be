import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'iPhone 15 Pro',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Latest iPhone with advanced features',
    required: false,
  })
  @IsString()
  @IsOptional()
  desc?: string;

  @ApiProperty({
    description: 'Product price in USD',
    example: 999.99,
    required: true,
    minimum: 0,
  })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({
    description: 'Product image URL',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiHideProperty()
  @IsUUID()
  @IsOptional()
  categoryId?: string;
}
