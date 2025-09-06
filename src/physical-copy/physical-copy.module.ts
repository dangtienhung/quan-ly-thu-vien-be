import { Book } from 'src/books/entities/book.entity';
import { BooksModule } from 'src/books/books.module';
import { Location } from 'src/locations/entities/location.entity';
import { LocationsModule } from 'src/locations/locations.module';
import { Module } from '@nestjs/common';
import { PhysicalCopy } from './entities/physical-copy.entity';
import { PhysicalCopyController } from './physical-copy.controller';
import { PhysicalCopyService } from './physical-copy.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [PhysicalCopyController],
  imports: [
    TypeOrmModule.forFeature([PhysicalCopy, Book, Location]),
    BooksModule,
    LocationsModule,
    UsersModule,
  ],
  providers: [PhysicalCopyService],
  exports: [PhysicalCopyService],
})
export class PhysicalCopyModule {}
