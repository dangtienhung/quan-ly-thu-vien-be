import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReadingHistory } from './entities/reading-history.entity';
import { ReadingSession } from './entities/reading-session.entity';
import { ReadingHistoryController } from './reading-history.controller';
import { ReadingHistoryService } from './reading-history.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReadingHistory, ReadingSession])],
  controllers: [ReadingHistoryController],
  providers: [ReadingHistoryService],
  exports: [ReadingHistoryService],
})
export class ReadingHistoryModule {}
