# Exception Handling Guide

## Tổng quan
Hệ thống exception handling tự động bắt và format tất cả lỗi mà không cần viết try-catch ở service layer.

## Cách hoạt động

### 1. **Automatic Error Catching**
Global Exception Filter tự động bắt tất cả lỗi trong ứng dụng:

#### ✅ NestJS Built-in Exceptions (Được handle tự động)
```typescript
// Trong service - không cần try-catch
async findOne(id: string): Promise<Product> {
  const product = await this.productRepository.findOne({ where: { id } });
  if (!product) {
    throw new NotFoundException(`Product with ID ${id} not found`);
  }
  return product;
}
```

#### ✅ Database Errors (Được handle tự động)
```typescript
// Trong service - không cần try-catch
async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
  const category = this.categoryRepository.create(createCategoryDto);
  return await this.categoryRepository.save(category); // Tự động catch unique constraint violations
}
```

### 2. **Error Response Format**

Response format thay đổi dựa trên environment:

#### Development Environment (`NODE_ENV=development`):
```json
{
  "statusCode": 409,
  "message": "Resource already exists with this unique field",
  "error": "ConflictError",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/categories",
  "method": "POST"
}
```

#### Production Environment (`NODE_ENV=production`):
```json
{
  "statusCode": 409,
  "message": "Resource already exists with this unique field"
}
```

#### Not Found Errors:

**Development:**
```json
{
  "statusCode": 404,
  "message": "Product with ID 123 not found",
  "error": "NotFoundException",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/products/123",
  "method": "GET"
}
```

**Production:**
```json
{
  "statusCode": 404,
  "message": "Product with ID 123 not found"
}
```

#### Validation Errors:

**Development:**
```json
{
  "statusCode": 400,
  "message": ["name should not be empty", "price must be a positive number"],
  "error": "BadRequestException",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/products",
  "method": "POST"
}
```

**Production:**
```json
{
  "statusCode": 400,
  "message": ["name should not be empty", "price must be a positive number"]
}
```

### 3. **Supported Error Types**

#### NestJS Built-in Exceptions:
- `NotFoundException` (404)
- `BadRequestException` (400)
- `ConflictException` (409)
- `UnauthorizedException` (401)
- `ForbiddenException` (403)
- `InternalServerErrorException` (500)

#### Database Constraint Errors (Auto-handled):
- **Unique Constraint** (`23505`) → 409 Conflict
- **Foreign Key** (`23503`) → 400 Bad Request
- **Not Null** (`23502`) → 400 Bad Request
- **Other DB errors** → 400 Bad Request

#### Unexpected Errors:
- **Any unhandled error** → 500 Internal Server Error (with logging)

### 4. **Best Practices**

#### ✅ DO - Simple service methods:
```typescript
async update(id: string, updateDto: UpdateProductDto): Promise<Product> {
  const product = await this.findOne(id); // Auto-throws NotFoundException
  Object.assign(product, updateDto);
  return await this.productRepository.save(product); // Auto-handles DB errors
}
```

#### ❌ DON'T - Unnecessary try-catch:
```typescript
async update(id: string, updateDto: UpdateProductDto): Promise<Product> {
  try { // ❌ Không cần thiết
    const product = await this.findOne(id);
    Object.assign(product, updateDto);
    return await this.productRepository.save(product);
  } catch (error) {
    throw error; // ❌ Global filter sẽ handle tự động
  }
}
```

### 5. **When to use try-catch**

Chỉ sử dụng try-catch khi cần **business logic** đặc biệt:

```typescript
async transferProduct(fromCategoryId: string, toCategoryId: string, productId: string) {
  try {
    await this.removeFromCategory(productId, fromCategoryId);
    await this.addToCategory(productId, toCategoryId);
  } catch (error) {
    // Rollback logic hoặc custom error handling
    await this.rollbackTransfer(productId, fromCategoryId);
    throw new BadRequestException('Failed to transfer product between categories');
  }
}
```

### 6. **Logging**

Tất cả errors được log tự động với context:
```
[ERROR] GET /products/invalid-uuid - 404 - Product with ID invalid-uuid not found
[ERROR] POST /categories - 409 - Resource already exists with this unique field
```

### 7. **Custom Error Messages**

Để custom error message, chỉ cần throw exception với message mong muốn:

```typescript
if (product.price < 0) {
  throw new BadRequestException('Product price cannot be negative');
}

if (!category.isActive) {
  throw new ConflictException('Cannot add products to inactive category');
}
```

### 8. **Environment Configuration**

Cấu hình error response format thông qua environment variable:

#### .env file:
```bash
# Development
NODE_ENV=development

# Production
NODE_ENV=production
```

#### Hoặc khi deploy:
```bash
# Development
npm run dev

# Production
NODE_ENV=production npm run start:prod
```

#### Environment Differences:

**Development (`NODE_ENV=development`):**
- ✅ Full error details (error type, timestamp, path, method)
- ✅ Detailed logging với stack traces
- ✅ Helpful debugging information

**Production (`NODE_ENV=production`):**
- ✅ Minimal error response (chỉ statusCode và message)
- ✅ Security-focused (không expose sensitive info)
- ✅ Clean user-facing error messages

## Kết luận

- ✅ **No try-catch** cần thiết cho most operations
- ✅ **Automatic error formatting** và logging
- ✅ **Database constraints** được handle tự động
- ✅ **Environment-aware** error responses
- ✅ **Production-ready** error handling với proper security
- ✅ **Development-friendly** với detailed error info