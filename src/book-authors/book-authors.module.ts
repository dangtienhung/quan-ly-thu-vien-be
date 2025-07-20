import { Module, forwardRef } from '@nestjs/common';

import { AuthorsModule } from '../authors/authors.module';
import { BookAuthor } from './entities/book-author.entity';
import { BookAuthorsController } from './book-authors.controller';
import { BookAuthorsService } from './book-authors.service';
import { BooksModule } from '../books/books.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BookAuthor]),
    forwardRef(() => BooksModule),
    forwardRef(() => AuthorsModule),
    UsersModule,
  ],
  controllers: [BookAuthorsController],
  providers: [BookAuthorsService],
  exports: [BookAuthorsService],
})
export class BookAuthorsModule {}
