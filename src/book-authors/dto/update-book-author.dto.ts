import { IsOptional } from 'class-validator';

export class UpdateBookAuthorDto {
  @IsOptional()
  book_id?: string;

  @IsOptional()
  author_id?: string;
}
