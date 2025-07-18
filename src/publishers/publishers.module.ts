import { Module } from '@nestjs/common';
import { Publisher } from './entities/publisher.entity';
import { PublishersController } from './publishers.controller';
import { PublishersService } from './publishers.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Publisher])],
  controllers: [PublishersController],
  providers: [PublishersService],
  exports: [PublishersService],
})
export class PublishersModule {}
