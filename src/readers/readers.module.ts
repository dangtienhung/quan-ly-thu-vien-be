import { Module } from '@nestjs/common';
import { Reader } from './entities/reader.entity';
import { ReadersController } from './readers.controller';
import { ReadersService } from './readers.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Reader])],
  controllers: [ReadersController],
  providers: [ReadersService],
  exports: [ReadersService], // Export để sử dụng ở module khác
})
export class ReadersModule {}
