import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { CategoriesService } from '../../categories/categories.service';
import { ProductsService } from '../../products/products.service';

@ApiTags('migration')
@Controller('migration')
export class MigrationController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  @Post('populate-slugs')
  @ApiOperation({ summary: 'Populate slugs for existing data' })
  @ApiResponse({ status: 200, description: 'Slugs populated successfully.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  @HttpCode(HttpStatus.OK)
  async populateSlugs(): Promise<{ message: string }> {
    await this.productsService.populateSlugs();
    await this.categoriesService.populateSlugs();

    return {
      message:
        'Slugs populated successfully for all existing products and categories',
    };
  }
}
