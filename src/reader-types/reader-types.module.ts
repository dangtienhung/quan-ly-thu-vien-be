import { Module } from '@nestjs/common';
import { ReaderType } from './entities/reader-type.entity';
import { ReaderTypesController } from './reader-types.controller';
import { ReaderTypesService } from './reader-types.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ReaderType])],
  controllers: [ReaderTypesController],
  providers: [ReaderTypesService],
  exports: [ReaderTypesService], // Export để sử dụng ở module khác
})
export class ReaderTypesModule {}
