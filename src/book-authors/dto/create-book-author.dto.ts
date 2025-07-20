import { IsNotEmpty } from 'class-validator';

export class CreateBookAuthorDto {
  @IsNotEmpty()
  book_id: string;

  @IsNotEmpty()
  author_id: string;
}
