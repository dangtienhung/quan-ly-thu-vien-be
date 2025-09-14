import { PartialType } from '@nestjs/swagger';
import { CreateReadingHistoryDto } from './create-reading-history.dto';

export class UpdateReadingHistoryDto extends PartialType(
  CreateReadingHistoryDto,
) {}
