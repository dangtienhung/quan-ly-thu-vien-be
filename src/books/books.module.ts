import { AuthorsModule } from '../authors/authors.module';
import { Book } from './entities/book.entity';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { CategoriesModule } from '../categories/categories.module';
import { EBook } from 'src/ebooks/entities/ebook.entity';
import { Module } from '@nestjs/common';
import { PhysicalCopy } from '../physical-copy/entities/physical-copy.entity';
import { PublishersModule } from '../publishers/publishers.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book, PhysicalCopy, EBook]),
    AuthorsModule,
    CategoriesModule,
    PublishersModule,
    UsersModule,
  ],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService],
})
export class BooksModule {}
