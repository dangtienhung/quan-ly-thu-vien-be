import { Module, forwardRef } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { EBook } from 'src/ebooks/entities/ebook.entity';
import { AuthorsModule } from '../authors/authors.module';
import { BookAuthorsModule } from '../book-authors/book-authors.module';
import { BookCategoriesModule } from '../book-categories/book-categories.module';
import { BookGradeLevelsModule } from '../book-grade-levels/book-grade-levels.module';
import { CategoriesModule } from '../categories/categories.module';
import { PhysicalCopy } from '../physical-copy/entities/physical-copy.entity';
import { PublishersModule } from '../publishers/publishers.module';
import { UsersModule } from '../users/users.module';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { Book } from './entities/book.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book, PhysicalCopy, EBook]),
    AuthorsModule,
    forwardRef(() => BookAuthorsModule),
    CategoriesModule,
    PublishersModule,
    UsersModule,
    BookCategoriesModule,
    BookGradeLevelsModule,
  ],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService],
})
export class BooksModule {}
