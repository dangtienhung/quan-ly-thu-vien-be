import { BooksModule } from '../books/books.module';
import { Module } from '@nestjs/common';
import { PhysicalCopyModule } from '../physical-copy/physical-copy.module';
import { ReadersModule } from '../readers/readers.module';
import { Reservation } from './entities/reservation.entity';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation]),
    BooksModule,
    ReadersModule,
    PhysicalCopyModule,
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}
