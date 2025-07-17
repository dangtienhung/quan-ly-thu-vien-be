import { Category } from '../categories/entities/category.entity';
import { Module } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService], // Export for use in other modules if needed
})
export class ProductsModule {}
