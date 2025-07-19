import { Module } from '@nestjs/common';
import { ReaderType } from './entities/reader-type.entity';
import { ReaderTypesController } from './reader-types.controller';
import { ReaderTypesService } from './reader-types.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([ReaderType]), UsersModule],
  controllers: [ReaderTypesController],
  providers: [ReaderTypesService],
  exports: [ReaderTypesService], // Export để sử dụng ở module khác
})
export class ReaderTypesModule {}
