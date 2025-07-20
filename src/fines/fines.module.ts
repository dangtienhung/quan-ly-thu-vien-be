import { BorrowRecordsModule } from '../borrow-records/borrow-records.module';
import { Fine } from './entities/fine.entity';
import { FinesController } from './fines.controller';
import { FinesService } from './fines.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Fine]), BorrowRecordsModule, UsersModule],
  controllers: [FinesController],
  providers: [FinesService],
  exports: [FinesService],
})
export class FinesModule {}
