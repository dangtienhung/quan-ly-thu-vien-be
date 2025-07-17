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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully.',
    type: Category,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 409, description: 'Category name already exists.' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories with pagination' })
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
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully.',
  })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Category>> {
    return this.categoriesService.findAll(paginationQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiParam({ name: 'id', description: 'Category UUID', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully.',
    type: Category,
  })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findOne(@Param('id') id: string): Promise<Category> {
    return this.categoriesService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a category by slug' })
  @ApiParam({
    name: 'slug',
    description: 'Category slug',
    example: 'electronics',
  })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully.',
    type: Category,
  })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findBySlug(@Param('slug') slug: string): Promise<Category> {
    return this.categoriesService.findBySlug(slug);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category by ID' })
  @ApiParam({ name: 'id', description: 'Category UUID', format: 'uuid' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully.',
    type: Category,
  })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  @ApiResponse({ status: 409, description: 'Category name already exists.' })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Patch('slug/:slug')
  @ApiOperation({ summary: 'Update a category by slug' })
  @ApiParam({
    name: 'slug',
    description: 'Category slug',
    example: 'electronics',
  })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully.',
    type: Category,
  })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  @ApiResponse({ status: 409, description: 'Category name already exists.' })
  async updateBySlug(
    @Param('slug') slug: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.updateBySlug(slug, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category by ID' })
  @ApiParam({ name: 'id', description: 'Category UUID', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Category deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.categoriesService.remove(id);
  }

  @Delete('slug/:slug')
  @ApiOperation({ summary: 'Delete a category by slug' })
  @ApiParam({
    name: 'slug',
    description: 'Category slug',
    example: 'electronics',
  })
  @ApiResponse({ status: 204, description: 'Category deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeBySlug(@Param('slug') slug: string): Promise<void> {
    return this.categoriesService.removeBySlug(slug);
  }
}
