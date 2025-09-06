import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';

export class SearchQueryDto {
  @ApiProperty({
    description: 'Search query string',
    example: 'lập trình',
  })
  @IsString()
  @IsNotEmpty()
  q: string;

  @ApiPropertyOptional({
    description: 'Page number (starting from 1)',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  limit?: number = 10;
}
