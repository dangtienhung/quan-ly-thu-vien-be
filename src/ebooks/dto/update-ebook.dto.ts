import { CreateEBookDto } from '../../ebooks/dto/create-ebook.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateEBookDto extends PartialType(CreateEBookDto) {}
