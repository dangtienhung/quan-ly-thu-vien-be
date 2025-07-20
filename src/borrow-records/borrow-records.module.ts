import { BorrowRecord } from './entities/borrow-record.entity';
import { BorrowRecordsController } from './borrow-records.controller';
import { BorrowRecordsService } from './borrow-records.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([BorrowRecord]), UsersModule],
  controllers: [BorrowRecordsController],
  providers: [BorrowRecordsService],
  exports: [BorrowRecordsService],
})
export class BorrowRecordsModule {}
