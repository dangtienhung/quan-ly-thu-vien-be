import { IsEnum, IsOptional } from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationWithPathDto } from '../../common/dto/pagination-with-path.dto';
import { ReservationStatus } from '../entities/reservation.entity';

export class FindByReaderDto extends PaginationWithPathDto {
  @ApiPropertyOptional({
    description: 'Trạng thái đặt trước để lọc',
    enum: ReservationStatus,
    example: ReservationStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;
}
