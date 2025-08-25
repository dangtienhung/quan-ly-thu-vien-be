import { IsOptional, IsPositive, Min } from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FindExpiringSoonDto {
  @ApiPropertyOptional({
    description: 'Số ngày tới (mặc định: 1)',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  days?: number = 1;
}
