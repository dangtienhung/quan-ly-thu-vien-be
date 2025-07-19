import { CategoriesModule } from '../categories/categories.module';
import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [ProductsModule, CategoriesModule, UsersModule],
  controllers: [],
})
export class CommonModule {}
