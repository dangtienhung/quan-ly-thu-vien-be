import { BorrowRecordsModule } from '../borrow-records/borrow-records.module';
import { Module } from '@nestjs/common';
import { Renewal } from './entities/renewal.entity';
import { RenewalsController } from './renewals.controller';
import { RenewalsService } from './renewals.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Renewal]),
    BorrowRecordsModule,
    UsersModule,
  ],
  controllers: [RenewalsController],
  providers: [RenewalsService],
  exports: [RenewalsService],
})
export class RenewalsModule {}
