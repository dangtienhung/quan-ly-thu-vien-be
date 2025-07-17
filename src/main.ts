import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestFactory, Reflector } from '@nestjs/core';

import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
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
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Cấu hình Swagger
  const config = new DocumentBuilder()
    .setTitle('Hệ thống Quản lý Thư viện - API')
    .setDescription('API documentation for Library Management System')
    .setVersion('1.0')
    .addTag('Users', 'Quản lý người dùng')
    .addTag('Reader Types', 'Quản lý loại độc giả')
    .addTag('Readers', 'Quản lý độc giả')
    .addBearerAuth() // Thêm authentication nếu cần
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Lấy ConfigService từ container
  const configService = app.get(ConfigService);

  // Lấy port từ .env file, fallback về 3000 nếu không có
  const port = configService.get('PORT', 3000);

  console.log(`🚀 Application is running on port: ${port}`);
  console.log(
    `📚 Swagger documentation is available at: http://localhost:${port}/api`,
  );
  await app.listen(port);
}
bootstrap();
