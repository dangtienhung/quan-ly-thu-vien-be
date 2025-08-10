import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthorsModule } from './authors/authors.module';
import { BookAuthorsModule } from './book-authors/book-authors.module';
import { BookCategoriesModule } from './book-categories/book-categories.module';
import { BookGradeLevelsModule } from './book-grade-levels/book-grade-levels.module';
import { BooksModule } from './books/books.module';
import { BorrowRecordsModule } from './borrow-records/borrow-records.module';
import { CategoriesModule } from './categories/categories.module';
import { CommonModule } from './common/common.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { EbooksModule } from './ebooks/ebooks.module';
import { FinesModule } from './fines/fines.module';
import { GradeLevelsModule } from './grade-levels/grade-levels.module';
import { ImagesModule } from './images/images.module';
import { PhysicalCopyModule } from './physical-copy/physical-copy.module';
import { ProductsModule } from './products/products.module';
import { PublishersModule } from './publishers/publishers.module';
import { ReaderTypesModule } from './reader-types/reader-types.module';
import { ReadersModule } from './readers/readers.module';
import { RenewalsModule } from './renewals/renewals.module';
import { ReservationsModule } from './reservations/reservations.module';
import { UploadsModule } from './uploads/uploads.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST') || 'localhost',
        port: +(configService.get<number>('DB_PORT') || 5432),
        username: configService.get('DB_USERNAME') || 'postgres',
        password: configService.get('DB_PASSWORD') || 'postgres',
        database: configService.get('DB_NAME') || 'quan-ly-thu-vien',
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    ProductsModule,
    CategoriesModule,
    CommonModule,
    // User Management Modules
    UsersModule,
    ReaderTypesModule,
    ReadersModule,
    PublishersModule,
    AuthorsModule,
    BooksModule,
    PhysicalCopyModule,
    EbooksModule,
    BookAuthorsModule,
    BorrowRecordsModule,
    RenewalsModule,
    FinesModule,
    ReservationsModule,
    UploadsModule,
    ImagesModule,
    GradeLevelsModule,
    BookCategoriesModule,
    BookGradeLevelsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
