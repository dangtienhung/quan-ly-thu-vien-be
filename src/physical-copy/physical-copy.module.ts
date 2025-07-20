import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksModule } from 'src/books/books.module';
import { Book } from 'src/books/entities/book.entity';
import { UsersModule } from 'src/users/users.module';
import { PhysicalCopy } from './entities/physical-copy.entity';
import { PhysicalCopyController } from './physical-copy.controller';
import { PhysicalCopyService } from './physical-copy.service';

@Module({
  controllers: [PhysicalCopyController],
  imports: [
    TypeOrmModule.forFeature([PhysicalCopy, Book]),
    BooksModule,
    UsersModule,
  ],
  providers: [PhysicalCopyService],
  exports: [PhysicalCopyService],
})
export class PhysicalCopyModule {}
