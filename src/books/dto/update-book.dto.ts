import { CreateBookDto } from './create-book.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateBookDto extends PartialType(CreateBookDto) {}
