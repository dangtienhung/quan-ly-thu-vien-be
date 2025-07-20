import { BooksModule } from 'src/books/books.module';
import { EBook } from './entities/ebook.entity';
import { EbooksController } from './ebooks.controller';
import { EbooksService } from './ebooks.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [EbooksController],
  providers: [EbooksService],
  imports: [TypeOrmModule.forFeature([EBook]), BooksModule, UsersModule],
  exports: [EbooksService],
})
export class EbooksModule {}
