import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Cho phép các trường không có trong DTO
      transform: true,
      skipMissingProperties: true, // Bỏ qua validation cho các trường không có
    }),
  );

  // add /api prefix
  app.setGlobalPrefix('api');

  // Enable class-transformer serialization
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Enable global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Cấu hình Swagger
  const config = new DocumentBuilder()
    .setTitle('Hệ thống Quản lý Thư viện - API')
    .setDescription('API documentation for Library Management System')
    .setVersion('1.0')
    .addTag('Users', 'Quản lý người dùng')
    .addTag('Reader Types', 'Quản lý loại độc giả')
    .addTag('Readers', 'Quản lý độc giả')
    .addTag('Categories', 'Quản lý thể loại')
    .addTag('Publishers', 'Quản lý nhà xuất bản')
    .addTag('Authors', 'Quản lý tác giả')
    .addTag('Products', 'Quản lý sản phẩm')
    .addTag('Ebooks', 'Quản lý ebook')
    .addTag('Physical Copies', 'Quản lý bản in')
    .addTag('Books', 'Quản lý sách')
    .addBearerAuth() // Thêm authentication nếu cần
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Lấy port từ .env file, fallback về 3000 nếu không có
  const port = process.env.PORT || 3000;

  console.log(`🚀 Application is running on port: ${port}`);
  console.log(
    `📚 Swagger documentation is available at: http://localhost:${port}/api`,
  );
  await app.listen(port);
}
bootstrap();
