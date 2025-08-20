import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { Reader } from '../readers/entities/reader.entity';
import { BorrowRecordsController } from './borrow-records.controller';
import { BorrowRecordsService } from './borrow-records.service';
import { BorrowRecord } from './entities/borrow-record.entity';
import { Notification } from './entities/notification.entity';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BorrowRecord, Notification, Reader]),
    UsersModule,
  ],
  controllers: [BorrowRecordsController, NotificationController],
  providers: [BorrowRecordsService, NotificationService],
  exports: [BorrowRecordsService, NotificationService],
})
export class BorrowRecordsModule {}
