# Slug và Pagination Features

## Tổng quan

Dự án đã được cập nhật với:
- ✅ **Slug fields** cho Products và Categories
- ✅ **Pagination** cho tất cả list endpoints
- ✅ **Slug-based CRUD operations**
- ✅ **Auto-generated slugs** từ name field
- ✅ **Database migration support** cho existing data

## 🔗 Slug Features

### Slug Generation
Slugs được tự động generate từ `name` field khi tạo hoặc update:

```typescript
// Ví dụ:
name: "iPhone 15 Pro Max" → slug: "iphone-15-pro-max"
name: "Electronics & Gadgets" → slug: "electronics-gadgets"
```

### Unique Constraints
- ✅ Mỗi product có **unique slug**
- ✅ Mỗi category có **unique slug**
- ✅ Database constraints đảm bảo tính duy nhất
- ✅ **Nullable slugs** để support existing data

### API Endpoints với Slug

#### Products:
- `GET /products/slug/:slug` - Get product by slug
- `PATCH /products/slug/:slug` - Update product by slug
- `DELETE /products/slug/:slug` - Delete product by slug

#### Categories:
- `GET /categories/slug/:slug` - Get category by slug
- `PATCH /categories/slug/:slug` - Update category by slug
- `DELETE /categories/slug/:slug` - Delete category by slug

### Slug Usage Examples

#### Get Product by Slug:
```bash
GET /products/slug/iphone-15-pro
```

#### Update Category by Slug:
```bash
PATCH /categories/slug/electronics
{
  "description": "Updated description"
}
```

## 📄 Pagination Features

### Query Parameters
Tất cả list endpoints hỗ trợ pagination:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

### API Endpoints với Pagination

#### Products:
```bash
GET /products?page=1&limit=10
GET /products?page=2&limit=5
```

#### Categories:
```bash
GET /categories?page=1&limit=20
GET /categories?limit=5  # page defaults to 1
```

### Pagination Response Format

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Product Name",
      "slug": "product-name",
      "price": 99.99,
      "category": {
        "id": "category-uuid",
        "name": "Category Name"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Pagination Metadata

- `page` - Current page number
- `limit` - Items per page
- `totalItems` - Total number of items
- `totalPages` - Total number of pages
- `hasNextPage` - Whether next page exists
- `hasPreviousPage` - Whether previous page exists

## 🚀 Database Migration

### ⚠️ Existing Data Issue
Nếu database đã có data cũ, bạn cần populate slugs cho existing records.

### Migration Endpoint
```bash
POST /migration/populate-slugs
```

**Response:**
```json
{
  "message": "Slugs populated successfully for all existing products and categories"
}
```

### Manual Migration Steps

1. **Start server** (slugs sẽ null cho existing data)
2. **Call migration endpoint**:
   ```bash
   curl -X POST http://localhost:3000/migration/populate-slugs
   ```
3. **Verify slugs** đã được tạo thành công

### What the Migration Does

- ✅ **Tìm all records** có slug = null
- ✅ **Generate unique slugs** từ name field
- ✅ **Update database** với slugs mới
- ✅ **Handle both Products và Categories**

## 🛠️ Technical Implementation

### Entity Changes

#### Product Entity:
```typescript
@Column({ type: 'varchar', length: 300, unique: true, nullable: true })
slug?: string;

@BeforeInsert()
@BeforeUpdate()
generateSlug() {
  if (this.name) {
    this.slug = slugify(this.name, { lower: true });
  }
}
```

#### Category Entity:
```typescript
@Column({ type: 'varchar', length: 300, unique: true, nullable: true })
slug?: string;

@BeforeInsert()
@BeforeUpdate()
generateSlug() {
  if (this.name) {
    this.slug = slugify(this.name, { lower: true });
  }
}
```

### Service Layer

#### Pagination Implementation:
```typescript
async findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedResponseDto<Product>> {
  const { page = 1, limit = 10 } = paginationQuery;
  const skip = (page - 1) * limit;

  const [data, totalItems] = await this.repository.findAndCount({
    relations: ['category'],
    order: { createdAt: 'DESC' },
    skip,
    take: limit,
  });

  return {
    data,
    meta: {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      hasNextPage: page < Math.ceil(totalItems / limit),
      hasPreviousPage: page > 1,
    }
  };
}
```

#### Slug Methods:
```typescript
async findBySlug(slug: string): Promise<Product> {
  const product = await this.repository.findOne({
    where: { slug },
    relations: ['category'],
  });
  if (!product) {
    throw new NotFoundException(`Product with slug '${slug}' not found`);
  }
  return product;
}
```

#### Migration Utility:
```typescript
async populateSlugs(): Promise<void> {
  const products = await this.repository.find({
    where: { slug: IsNull() },
  });

  for (const product of products) {
    if (product.name) {
      product.slug = slug(product.name, { lower: true });
      await this.repository.save(product);
    }
  }
}
```

## 📚 Swagger Documentation

### Pagination Queries:
```typescript
@ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
@ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
```

### Slug Parameters:
```typescript
@ApiParam({ name: 'slug', description: 'Product slug', example: 'iphone-15-pro' })
```

### Migration Endpoint:
- ✅ **Swagger UI** có full documentation cho migration endpoint
- ✅ **ApiTags** để group migration operations
- ✅ **Response examples** với success messages

## 🎯 Usage Examples

### Create Product (Auto-generates slug):
```bash
POST /products
{
  "name": "iPhone 15 Pro Max",
  "price": 1199.99,
  "desc": "Latest iPhone model"
}

# Response includes: slug: "iphone-15-pro-max"
```

### Get Products with Pagination:
```bash
GET /products?page=2&limit=5

# Returns 5 products from page 2 with pagination metadata
```

### Access by Slug:
```bash
GET /products/slug/iphone-15-pro-max
GET /categories/slug/electronics

# SEO-friendly URLs for frontend applications
```

### Update using Slug:
```bash
PATCH /products/slug/iphone-15-pro-max
{
  "price": 1099.99
}
```

### Migrate Existing Data:
```bash
POST /migration/populate-slugs

# Response: { "message": "Slugs populated successfully..." }
```

## 🔍 Benefits

### SEO Benefits:
- ✅ **SEO-friendly URLs** với slugs
- ✅ **Readable URLs** thay vì UUIDs
- ✅ **Better user experience**

### Performance Benefits:
- ✅ **Efficient pagination** với database limits
- ✅ **Indexed slug fields** cho fast lookups
- ✅ **Controlled data loading**

### Developer Experience:
- ✅ **Intuitive API endpoints**
- ✅ **Consistent pagination** across all endpoints
- ✅ **Auto-generated slugs** không cần manual input
- ✅ **Full Swagger documentation**
- ✅ **Safe migration** cho existing data

## ⚡ Migration Notes

### Database Migration
- ✅ **Nullable slugs** để support existing data
- ✅ **Auto-migration endpoint** để populate slugs
- ✅ **No data loss** during migration
- ✅ **Unique constraints** maintained

### Existing Data
- ✅ **Graceful handling** của null slugs
- ✅ **One-time migration** process
- ✅ **Automatic slug generation** từ names

### Frontend Integration
Frontend có thể sử dụng slugs cho:
- SEO-friendly routing
- Shareable URLs
- Better UX with readable URLs
- Gradual migration từ ID-based URLs

## 🐛 Troubleshooting

### Common Issues:

1. **"column slug contains null values"**
   - ✅ **Solved**: Slugs are now nullable
   - ✅ **Solution**: Run migration endpoint

2. **Duplicate slug errors**
   - ✅ **Prevention**: Unique constraints in database
   - ✅ **Handling**: Exception filters return appropriate errors

3. **Migration not working**
   - ✅ **Check**: Server running successfully
   - ✅ **Verify**: Migration endpoint accessible at `/migration/populate-slugs`

### Verification Steps:

1. ✅ **Check server logs** cho startup messages
2. ✅ **Test endpoints** tại Swagger UI (`/api`)
3. ✅ **Run migration** nếu có existing data
4. ✅ **Verify slugs** trong database hoặc API responses