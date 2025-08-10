import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { BookGradeLevelsController } from './book-grade-levels.controller';
import { BookGradeLevelsService } from './book-grade-levels.service';
import { BookGradeLevel } from './entities/book-grade-level.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BookGradeLevel]), UsersModule],
  controllers: [BookGradeLevelsController],
  providers: [BookGradeLevelsService],
  exports: [BookGradeLevelsService],
})
export class BookGradeLevelsModule {}
