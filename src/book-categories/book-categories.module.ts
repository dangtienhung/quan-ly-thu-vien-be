import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { BookCategoriesController } from './book-categories.controller';
import { BookCategoriesCustomerController } from './book-categories-customer.controller';
import { BookCategoriesService } from './book-categories.service';
import { BookCategory } from './entities/book-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BookCategory]), UsersModule],
  controllers: [BookCategoriesController, BookCategoriesCustomerController],
  providers: [BookCategoriesService],
  exports: [BookCategoriesService],
})
export class BookCategoriesModule {}
