import { Book } from 'src/books/entities/book.entity';
import { BooksModule } from 'src/books/books.module';
import { EbooksController } from './ebooks.controller';
import { EbooksService } from './ebooks.service';
import { Module } from '@nestjs/common';
import { PhysicalCopy } from 'src/physical-copy/entities/physical-copy.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [EbooksController],
  providers: [EbooksService],
  imports: [
    TypeOrmModule.forFeature([Book, PhysicalCopy]),
    BooksModule,
    UsersModule,
  ],
  exports: [EbooksService],
})
export class EbooksModule {}
