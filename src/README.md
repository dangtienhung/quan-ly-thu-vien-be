# Hệ thống Quản lý Thư viện - Backend API

## 📋 Tổng quan

Hệ thống Quản lý Thư viện Backend là một RESTful API được xây dựng với NestJS, TypeORM, và PostgreSQL. Dự án hỗ trợ đầy đủ các tính năng quản lý thư viện hiện đại như:

- ✅ **Quản lý người dùng** với vai trò admin/reader và trạng thái tài khoản
- ✅ **Quản lý loại độc giả** với giới hạn mượn sách và thời hạn
- ✅ **Quản lý độc giả** với thông tin cá nhân và thẻ thư viện
- ✅ **CRUD operations** quản lý sách, tác giả, thể loại với UUID primary keys
- ✅ **Phân trang (Pagination)** cho tất cả danh sách
- ✅ **Slug-based URLs** cho SEO-friendly routes
- ✅ **Xử lý lỗi tự động** không cần try-catch
- ✅ **Swagger UI** documentation tiếng Việt cho tất cả API endpoints
- ✅ **Phản hồi lỗi thông minh** theo môi trường
- ✅ **Hỗ trợ migration** cơ sở dữ liệu

## 🚀 Câu lệnh Chạy Dự án

### Yêu cầu hệ thống
- Node.js 18+
- PostgreSQL 12+
- npm hoặc yarn

### Cài đặt & Khởi chạy

```bash
# 1. Clone repository và cài đặt dependencies
git clone <repository-url>
cd backend-nest-template
npm install

# 2. Cấu hình environment variables
cp .env.example .env
# Chỉnh sửa file .env với thông tin database của bạn

# 3. Khởi động PostgreSQL database
# Sử dụng Docker (khuyến nghị)
docker-compose up -d

# Hoặc khởi động PostgreSQL local
# Đảm bảo database 'quan-ly-thu-vien-dev' đã được tạo

# 4. Chạy development server
npm run dev
# hoặc
npm run start:dev

# 5. Truy cập Swagger UI
# Mở trình duyệt tại: http://localhost:8000/api
```

### Các lệnh phát triển khác

```bash
# Chạy production
npm run start:prod

# Chạy với debug mode
npm run start:debug

# Build project
npm run build

# Chạy tests
npm run test
npm run test:watch
npm run test:e2e

# Linting và format code
npm run lint
npm run format
```

## 🛠️ Quy trình Tạo Module Mới

### 1. Tạo Module Mới (BẮT BUỘC cho module chưa tồn tại)

```bash
# LUÔN CHẠY CÂU LỆNH NÀY TRƯỚC nếu module chưa tồn tại
nest g resource example --no-spec

# Câu lệnh này sẽ tự động tạo:
# - src/example/example.module.ts
# - src/example/example.controller.ts
# - src/example/example.service.ts
# - src/example/dto/create-example.dto.ts
# - src/example/dto/update-example.dto.ts
# - src/example/entities/example.entity.ts

# ❌ KHÔNG cần chạy manual steps nếu đã chạy nest g resource:
# nest g module example --no-spec
# nest g controller example --no-spec
# nest g service example --no-spec
```

### 2. Setup Entity & DTOs

**Tạo entity với slug support:**

```typescript
// src/example/entities/example.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import slug from 'slug';

@Entity('examples')
export class Example {
  @ApiProperty({
    description: 'ID duy nhất của bản ghi (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Tên của example',
    example: 'Tên example mẫu',
  })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({
    description: 'Slug cho URL thân thiện (tự động tạo từ tên)',
    example: 'ten-example-mau',
    required: false,
  })
  @Column({ type: 'varchar', length: 300, unique: true, nullable: true })
  slug?: string;

  @ApiProperty({
    description: 'Mô tả chi tiết',
    example: 'Đây là mô tả chi tiết về example',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Ngày tạo',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Ngày cập nhật cuối cùng',
    example: '2024-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  // Tự động tạo slug từ tên
  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    if (this.name) {
      this.slug = slug(this.name, { lower: true });
    }
  }
}
```

**Add pagination DTOs:**

```typescript
// src/example/dto/create-example.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateExampleDto {
  @ApiProperty({
    description: 'Tên của example',
    example: 'Tên example mẫu',
  })
  @IsNotEmpty({ message: 'Tên không được để trống' })
  @IsString({ message: 'Tên phải là chuỗi ký tự' })
  @MaxLength(255, { message: 'Tên không được quá 255 ký tự' })
  name: string;

  @ApiProperty({
    description: 'Mô tả chi tiết',
    example: 'Đây là mô tả chi tiết về example',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  description?: string;
}
```

### 3. Implement Service

**Add pagination method:**

```typescript
// src/example/example.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CreateExampleDto } from './dto/create-example.dto';
import { UpdateExampleDto } from './dto/update-example.dto';
import { Example } from './entities/example.entity';
import { PaginationQueryDto, PaginatedResponseDto, PaginationMetaDto } from '../common/dto/pagination.dto';
import slug from 'slug';

@Injectable()
export class ExampleService {
  constructor(
    @InjectRepository(Example)
    private readonly exampleRepository: Repository<Example>,
  ) {}

  // Tạo mới
  async create(createExampleDto: CreateExampleDto): Promise<Example> {
    const example = this.exampleRepository.create(createExampleDto);
    return await this.exampleRepository.save(example);
  }

  // Lấy tất cả với phân trang
  async findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedResponseDto<Example>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.exampleRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const meta: PaginationMetaDto = {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };

    return { data, meta };
  }

  // Tìm theo ID
  async findOne(id: string): Promise<Example> {
    const example = await this.exampleRepository.findOne({ where: { id } });
    if (!example) {
      throw new NotFoundException(`Không tìm thấy example với ID ${id}`);
    }
    return example;
  }

  // Tìm theo slug
  async findBySlug(slug: string): Promise<Example> {
    const example = await this.exampleRepository.findOne({ where: { slug } });
    if (!example) {
      throw new NotFoundException(`Không tìm thấy example với slug '${slug}'`);
    }
    return example;
  }

  // Tìm kiếm
  async search(query: string, paginationQuery: PaginationQueryDto): Promise<PaginatedResponseDto<Example>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, totalItems] = await this.exampleRepository
      .createQueryBuilder('example')
      .where('example.name ILIKE :query', { query: `%${query}%` })
      .orWhere('example.description ILIKE :query', { query: `%${query}%` })
      .orderBy('example.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const meta: PaginationMetaDto = {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };

    return { data, meta };
  }

  // Cập nhật
  async update(id: string, updateExampleDto: UpdateExampleDto): Promise<Example> {
    const example = await this.findOne(id);
    Object.assign(example, updateExampleDto);
    return await this.exampleRepository.save(example);
  }

  // Cập nhật theo slug
  async updateBySlug(slugParam: string, updateExampleDto: UpdateExampleDto): Promise<Example> {
    const example = await this.findBySlug(slugParam);
    Object.assign(example, updateExampleDto);
    return await this.exampleRepository.save(example);
  }

  // Xóa
  async remove(id: string): Promise<void> {
    const example = await this.findOne(id);
    await this.exampleRepository.remove(example);
  }

  // Xóa theo slug
  async removeBySlug(slugParam: string): Promise<void> {
    const example = await this.findBySlug(slugParam);
    await this.exampleRepository.remove(example);
  }

  // Tạo slug cho dữ liệu cũ (Migration utility)
  async populateSlugs(): Promise<void> {
    const examples = await this.exampleRepository.find({
      where: { slug: IsNull() },
    });

    for (const example of examples) {
      if (example.name) {
        example.slug = slug(example.name, { lower: true });
        await this.exampleRepository.save(example);
      }
    }
  }
}
```

### 4. Setup Controller

**Add Swagger decorators:**

```typescript
// src/example/example.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { ExampleService } from './example.service';
import { CreateExampleDto } from './dto/create-example.dto';
import { UpdateExampleDto } from './dto/update-example.dto';
import { Example } from './entities/example.entity';
import { PaginationQueryDto, PaginatedResponseDto } from '../common/dto/pagination.dto';

@ApiTags('Examples - Quản lý Example')
@Controller('examples')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo example mới' })
  @ApiBody({ type: CreateExampleDto, description: 'Thông tin example cần tạo' })
  @ApiResponse({ status: 201, description: 'Tạo example thành công.', type: Example })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createExampleDto: CreateExampleDto): Promise<Example> {
    return this.exampleService.create(createExampleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách examples với phân trang' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Số trang (mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng mỗi trang (mặc định: 10)' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách examples thành công.' })
  async findAll(@Query() paginationQuery: PaginationQueryDto): Promise<PaginatedResponseDto<Example>> {
    return this.exampleService.findAll(paginationQuery);
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm examples theo tên hoặc mô tả' })
  @ApiQuery({ name: 'q', required: true, description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Số trang (mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng mỗi trang (mặc định: 10)' })
  @ApiResponse({ status: 200, description: 'Tìm kiếm examples thành công.' })
  async search(
    @Query('q') query: string,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Example>> {
    return this.exampleService.search(query, paginationQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin example theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của example' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin example thành công.', type: Example })
  @ApiResponse({ status: 404, description: 'Không tìm thấy example.' })
  async findOne(@Param('id') id: string): Promise<Example> {
    return this.exampleService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Lấy thông tin example theo slug' })
  @ApiParam({ name: 'slug', description: 'Slug của example' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin example thành công.', type: Example })
  @ApiResponse({ status: 404, description: 'Không tìm thấy example.' })
  async findBySlug(@Param('slug') slug: string): Promise<Example> {
    return this.exampleService.findBySlug(slug);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật example theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của example' })
  @ApiBody({ type: UpdateExampleDto, description: 'Thông tin cập nhật' })
  @ApiResponse({ status: 200, description: 'Cập nhật example thành công.', type: Example })
  @ApiResponse({ status: 404, description: 'Không tìm thấy example.' })
  async update(@Param('id') id: string, @Body() updateExampleDto: UpdateExampleDto): Promise<Example> {
    return this.exampleService.update(id, updateExampleDto);
  }

  @Patch('slug/:slug')
  @ApiOperation({ summary: 'Cập nhật example theo slug' })
  @ApiParam({ name: 'slug', description: 'Slug của example' })
  @ApiBody({ type: UpdateExampleDto, description: 'Thông tin cập nhật' })
  @ApiResponse({ status: 200, description: 'Cập nhật example thành công.', type: Example })
  @ApiResponse({ status: 404, description: 'Không tìm thấy example.' })
  async updateBySlug(@Param('slug') slug: string, @Body() updateExampleDto: UpdateExampleDto): Promise<Example> {
    return this.exampleService.updateBySlug(slug, updateExampleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa example theo ID' })
  @ApiParam({ name: 'id', description: 'UUID của example' })
  @ApiResponse({ status: 204, description: 'Xóa example thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy example.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.exampleService.remove(id);
  }

  @Delete('slug/:slug')
  @ApiOperation({ summary: 'Xóa example theo slug' })
  @ApiParam({ name: 'slug', description: 'Slug của example' })
  @ApiResponse({ status: 204, description: 'Xóa example thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy example.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeBySlug(@Param('slug') slug: string): Promise<void> {
    return this.exampleService.removeBySlug(slug);
  }
}
```

### 5. Test API

**Via Swagger UI (/api):**

1. **Khởi động server:** `npm run dev`
2. **Truy cập Swagger UI:** `http://localhost:8000/api`
3. **Test các endpoint:**
   - POST /examples - Tạo example mới
   - GET /examples - Lấy danh sách với phân trang
   - GET /examples/search - Tìm kiếm
   - GET /examples/:id - Lấy theo ID
   - GET /examples/slug/:slug - Lấy theo slug
   - PATCH /examples/:id - Cập nhật theo ID
   - PATCH /examples/slug/:slug - Cập nhật theo slug
   - DELETE /examples/:id - Xóa theo ID
   - DELETE /examples/slug/:slug - Xóa theo slug

**Test pagination:**
```bash
curl "http://localhost:8000/examples?page=1&limit=5"
```

**Test slug generation:**
```bash
curl -X POST "http://localhost:8000/examples" \
  -H "Content-Type: application/json" \
  -d '{"name": "Tên có dấu tiếng Việt", "description": "Mô tả mẫu"}'
```

**Test error handling:**
```bash
curl "http://localhost:8000/examples/invalid-uuid"
```

## ⚙️ Cấu hình Dự án

### Environment Variables (.env)

```bash
# Cấu hình Database
DB_HOST=localhost
DB_PORT=5434
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=quan-ly-thu-vien-dev

# Cấu hình Application
NODE_ENV=development
PORT=8000

# Xử lý lỗi theo môi trường
# development = lỗi chi tiết với stack trace
# production = lỗi tối giản để bảo mật
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_DB: quan-ly-thu-vien-dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5434:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Scripts Package.json

```json
{
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

## 📁 Cấu trúc thư mục

```
backend-nest-template/
├── src/
│   ├── app.module.ts              # Module gốc
│   ├── main.ts                    # Điểm khởi chạy ứng dụng
│   ├── app.controller.ts          # Controller chính
│   ├── app.service.ts             # Service chính
│   ├── SYSTEM.md                  # Tài liệu hệ thống
│   ├── README.md                  # Hướng dẫn dự án
│   │
│   ├── users/                     # Module quản lý người dùng
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts     # Entity người dùng với authentication
│   │   ├── users.controller.ts    # REST endpoints + Swagger
│   │   ├── users.service.ts       # Logic xử lý + authentication
│   │   └── users.module.ts        # Module definition
│   │
│   ├── reader-types/              # Module loại độc giả
│   │   ├── dto/
│   │   │   ├── create-reader-type.dto.ts
│   │   │   └── update-reader-type.dto.ts
│   │   ├── entities/
│   │   │   └── reader-type.entity.ts
│   │   ├── reader-types.controller.ts
│   │   ├── reader-types.service.ts
│   │   └── reader-types.module.ts
│   │
│   ├── readers/                   # Module độc giả
│   │   ├── dto/
│   │   │   ├── create-reader.dto.ts
│   │   │   └── update-reader.dto.ts
│   │   ├── entities/
│   │   │   └── reader.entity.ts
│   │   ├── readers.controller.ts
│   │   ├── readers.service.ts
│   │   └── readers.module.ts
│   │
│   ├── categories/                # Module thể loại
│   │   ├── dto/
│   │   │   ├── create-category.dto.ts
│   │   │   └── update-category.dto.ts
│   │   ├── entities/
│   │   │   └── category.entity.ts
│   │   ├── categories.controller.ts
│   │   ├── categories.service.ts
│   │   └── categories.module.ts
│   │
│   ├── products/                  # Module sản phẩm
│   │   ├── dto/
│   │   │   ├── create-product.dto.ts
│   │   │   └── update-product.dto.ts
│   │   ├── entities/
│   │   │   └── product.entity.ts
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   └── products.module.ts
│   │
│   └── common/                    # Shared components
│       ├── dto/
│       │   └── pagination.dto.ts  # DTOs phân trang
│       ├── filters/
│       │   └── global-exception.filter.ts  # Xử lý lỗi tự động
│       ├── controllers/
│       │   └── migration.controller.ts     # Tiện ích migration
│       └── common.module.ts       # Common module
│
├── test/                         # Test files
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── .env                          # Cấu hình environment
├── docker-compose.yml            # Docker setup
├── Dockerfile                    # Docker configuration
├── package.json                  # Dependencies và scripts
├── tsconfig.json                 # TypeScript config
├── tsconfig.build.json           # TypeScript build config
├── nest-cli.json                 # NestJS CLI config
├── eslint.config.mjs             # ESLint configuration
├── README.md                     # Hướng dẫn chính
├── SYSTEM.md                     # Tài liệu hệ thống
├── EXCEPTION_HANDLING_GUIDE.md   # Hướng dẫn xử lý lỗi
├── SLUG_AND_PAGINATION_GUIDE.md  # Hướng dẫn slug và pagination
└── SWAGGER_GUIDE.md              # Hướng dẫn Swagger
```





## 📚 Ví dụ API Response

### Danh sách Người dùng (Paginated)
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "admin123",
      "email": "admin@thuvien.com",
      "role": "admin",
      "accountStatus": "active",
      "lastLogin": "2024-01-01T10:30:00.000Z",
      "reader": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 50,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Thông tin Độc giả với Thẻ
```json
{
  "id": "reader-uuid",
  "fullName": "Nguyễn Văn A",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "address": "123 Đường ABC, Quận 1, TP.HCM",
  "phone": "0123456789",
  "cardNumber": "LIB2024001",
  "cardIssueDate": "2024-01-01T00:00:00.000Z",
  "cardExpiryDate": "2025-01-01T00:00:00.000Z",
  "isActive": true,
  "user": {
    "id": "user-uuid",
    "username": "reader123",
    "email": "reader@email.com",
    "role": "reader"
  },
  "readerType": {
    "id": "type-uuid",
    "typeName": "student",
    "maxBorrowLimit": 5,
    "borrowDurationDays": 14
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 🔧 Khắc phục Sự cố

### 1. Lỗi Database Connection
```bash
# Kiểm tra PostgreSQL đang chạy
docker-compose ps

# Restart database
docker-compose restart db

# Kiểm tra logs
docker-compose logs db
```

### 2. Lỗi TypeORM Metadata
```bash
# Xóa dist folder và rebuild
rm -rf dist/
npm run build

# Kiểm tra entity imports
# Đảm bảo tất cả entities được import đúng trong app.module.ts
```

### 3. Lỗi Validation
```bash
# Kiểm tra DTOs có đúng decorators
# Đảm bảo class-validator được cài đặt
npm install class-validator class-transformer
```

### 4. Lỗi Swagger
```bash
# Kiểm tra Swagger config trong main.ts
# Đảm bảo tất cả decorators được import từ @nestjs/swagger
```

## 💡 Best Practices

### 1. **Đặt tên tiếng Việt**
- API descriptions trong tiếng Việt
- Error messages bằng tiếng Việt
- Swagger documentation bằng tiếng Việt

### 2. **Bảo mật**
- Hash passwords với bcrypt
- Validate input với class-validator
- Hide sensitive fields với @Exclude()

### 3. **Performance**
- Sử dụng pagination cho tất cả lists
- Index các fields thường query
- Lazy loading cho relationships

### 4. **Error Handling**
- Sử dụng Global Exception Filter
- Consistent error response format
- Meaningful error messages

### 5. **Documentation**
- Đầy đủ Swagger decorators
- Ví dụ request/response
- Mô tả chi tiết cho từng endpoint

## 📞 Hỗ trợ & Bảo trì

**Tính năng chính đã triển khai:**
1. ✅ Quản lý người dùng với authentication
2. ✅ Quản lý loại độc giả và độc giả
3. ✅ Hệ thống thẻ thư viện tự động
4. ✅ Phân trang và tìm kiếm
5. ✅ Swagger documentation tiếng Việt
6. ✅ Global exception handling

**Access Points:**
- Swagger UI: `http://localhost:8000/api`
- Database: PostgreSQL on port 5434
- App Server: `http://localhost:8000`

**Hướng dẫn chi tiết:**
- Exception Handling: `EXCEPTION_HANDLING_GUIDE.md`
- Slug & Pagination: `SLUG_AND_PAGINATION_GUIDE.md`
- Swagger Setup: `SWAGGER_GUIDE.md`

---

## 📝 Cập nhật Hệ thống

> **⚠️ LƯU Ý QUAN TRỌNG:**
>
> Mọi thay đổi, cập nhật, hoặc phát triển mới trong hệ thống sẽ được cập nhật và ghi chú chi tiết trong file README.md này.
>
> Vui lòng kiểm tra file này thường xuyên để nắm bắt các thay đổi mới nhất của hệ thống quản lý thư viện.

**Lịch sử cập nhật:**
- `2024-01-01`: Khởi tạo hệ thống quản lý thư viện cơ bản
- `2024-01-02`: Triển khai user management với authentication
- `2024-01-03`: Thêm reader types và readers management
- `2024-01-04`: Hoàn thiện Swagger documentation tiếng Việt
- `Các cập nhật tiếp theo sẽ được ghi chú tại đây...`
