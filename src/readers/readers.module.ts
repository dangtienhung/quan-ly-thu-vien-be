import { Module } from '@nestjs/common';
import { Reader } from './entities/reader.entity';
import { ReadersController } from './readers.controller';
import { ReadersService } from './readers.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Reader]), UsersModule],
  controllers: [ReadersController],
  providers: [ReadersService],
  exports: [ReadersService], // Export để sử dụng ở module khác
})
export class ReadersModule {}
