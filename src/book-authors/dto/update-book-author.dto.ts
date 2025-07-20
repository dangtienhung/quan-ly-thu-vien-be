import { PartialType } from '@nestjs/swagger';
import { CreateBookAuthorDto } from './create-book-author.dto';

export class UpdateBookAuthorDto extends PartialType(CreateBookAuthorDto) {}
