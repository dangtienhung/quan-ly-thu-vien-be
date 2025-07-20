import { PartialType } from '@nestjs/swagger';
import { CreateRenewalDto } from './create-renewal.dto';

export class UpdateRenewalDto extends PartialType(CreateRenewalDto) {}
