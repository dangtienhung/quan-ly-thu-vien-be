import { CreatePhysicalCopyDto } from './create-physical-copy.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdatePhysicalCopyDto extends PartialType(CreatePhysicalCopyDto) {}
