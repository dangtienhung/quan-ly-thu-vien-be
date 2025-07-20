import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { BookAuthorsController } from './book-authors.controller';
import { BookAuthorsService } from './book-authors.service';
import { BookAuthor } from './entities/book-author.entity';

@Module({
  controllers: [BookAuthorsController],
  providers: [BookAuthorsService],
  imports: [TypeOrmModule.forFeature([BookAuthor]), UsersModule],
})
export class BookAuthorsModule {}
