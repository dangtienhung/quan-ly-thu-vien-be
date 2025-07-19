import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  PaginatedResponseDto,
  PaginationQueryDto,
} from '../common/dto/pagination.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully.',
    type: Product,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Product>> {
    return this.productsService.findAll(paginationQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({ name: 'id', description: 'Product UUID', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully.',
    type: Product,
  })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findOne(@Param('id') id: string): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a product by slug' })
  @ApiParam({
    name: 'slug',
    description: 'Product slug',
    example: 'iphone-15-pro',
  })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully.',
    type: Product,
  })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findBySlug(@Param('slug') slug: string): Promise<Product> {
    return this.productsService.findBySlug(slug);
  }

  @Put(':id/category/:categoryId')
  @ApiOperation({ summary: 'Assign category to product' })
  @ApiParam({ name: 'id', description: 'Product UUID', format: 'uuid' })
  @ApiParam({
    name: 'categoryId',
    description: 'Category UUID',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Category assigned successfully.',
    type: Product,
  })
  @ApiResponse({ status: 404, description: 'Product or Category not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async assignCategory(
    @Param('id') id: string,
    @Param('categoryId') categoryId: string,
  ): Promise<Product> {
    return this.productsService.assignCategory(id, categoryId);
  }

  @Delete(':id/category')
  @ApiOperation({ summary: 'Remove category from product' })
  @ApiParam({ name: 'id', description: 'Product UUID', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Category removed successfully.',
    type: Product,
  })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async removeCategory(@Param('id') id: string): Promise<Product> {
    return this.productsService.removeCategory(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product by ID' })
  @ApiParam({ name: 'id', description: 'Product UUID', format: 'uuid' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully.',
    type: Product,
  })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, updateProductDto);
  }

  @Patch('slug/:slug')
  @ApiOperation({ summary: 'Update a product by slug' })
  @ApiParam({
    name: 'slug',
    description: 'Product slug',
    example: 'iphone-15-pro',
  })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully.',
    type: Product,
  })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async updateBySlug(
    @Param('slug') slug: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.updateBySlug(slug, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product by ID' })
  @ApiParam({ name: 'id', description: 'Product UUID', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Product deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.productsService.remove(id);
  }

  @Delete('slug/:slug')
  @ApiOperation({ summary: 'Delete a product by slug' })
  @ApiParam({
    name: 'slug',
    description: 'Product slug',
    example: 'iphone-15-pro',
  })
  @ApiResponse({ status: 204, description: 'Product deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeBySlug(@Param('slug') slug: string): Promise<void> {
    return this.productsService.removeBySlug(slug);
  }
}
