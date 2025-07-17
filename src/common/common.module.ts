import { CategoriesModule } from '../categories/categories.module';
import { MigrationController } from './controllers/migration.controller';
import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ProductsModule, CategoriesModule],
  controllers: [MigrationController],
})
export class CommonModule {}
