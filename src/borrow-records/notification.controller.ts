import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  Notification,
  NotificationStatus,
} from './entities/notification.entity';
import { NotificationService } from './notification.service';

@ApiTags('Notifications - Quản lý Thông báo')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('reader/:readerId')
  @ApiOperation({ summary: 'Lấy danh sách thông báo của độc giả' })
  @ApiParam({ name: 'readerId', description: 'UUID của độc giả' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Số trang (mặc định: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số lượng mỗi trang (mặc định: 10)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: NotificationStatus,
    description: 'Lọc theo trạng thái thông báo',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thông báo thành công.',
  })
  async getReaderNotifications(
    @Param('readerId') readerId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: NotificationStatus,
  ): Promise<{
    data: Notification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.notificationService.getReaderNotifications(
      readerId,
      page,
      limit,
      status,
    );
  }

  @Get('reader/:readerId/unread-count')
  @ApiOperation({ summary: 'Lấy số lượng thông báo chưa đọc của độc giả' })
  @ApiParam({ name: 'readerId', description: 'UUID của độc giả' })
  @ApiResponse({
    status: 200,
    description: 'Lấy số lượng thông báo chưa đọc thành công.',
    schema: {
      type: 'object',
      properties: {
        unreadCount: { type: 'number', description: 'Số thông báo chưa đọc' },
      },
    },
  })
  async getUnreadCount(@Param('readerId') readerId: string): Promise<{
    unreadCount: number;
  }> {
    const count = await this.notificationService.getUnreadCount(readerId);
    return { unreadCount: count };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Đánh dấu thông báo đã đọc' })
  @ApiParam({ name: 'id', description: 'UUID của thông báo' })
  @ApiResponse({
    status: 200,
    description: 'Đánh dấu thông báo đã đọc thành công.',
    type: Notification,
  })
  async markAsRead(@Param('id') id: string): Promise<Notification> {
    return this.notificationService.markAsRead(id);
  }

  @Patch('reader/:readerId/read-all')
  @ApiOperation({ summary: 'Đánh dấu tất cả thông báo của độc giả đã đọc' })
  @ApiParam({ name: 'readerId', description: 'UUID của độc giả' })
  @ApiResponse({
    status: 200,
    description: 'Đánh dấu tất cả thông báo đã đọc thành công.',
    schema: {
      type: 'object',
      properties: {
        updatedCount: {
          type: 'number',
          description: 'Số lượng thông báo đã được cập nhật',
        },
      },
    },
  })
  async markAllAsRead(@Param('readerId') readerId: string): Promise<{
    updatedCount: number;
  }> {
    return this.notificationService.markAllAsRead(readerId);
  }

  // ========== ADMIN APIs ==========

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả thông báo (Admin)' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Số trang (mặc định: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số lượng mỗi trang (mặc định: 10)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: NotificationStatus,
    description: 'Lọc theo trạng thái thông báo',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Lọc theo loại thông báo',
  })
  @ApiQuery({
    name: 'readerId',
    required: false,
    description: 'Lọc theo ID độc giả',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Lọc từ ngày (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Lọc đến ngày (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thông báo thành công.',
  })
  async getAllNotifications(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: NotificationStatus,
    @Query('type') type?: string,
    @Query('readerId') readerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<{
    data: Notification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.notificationService.getAllNotifications(
      page,
      limit,
      status,
      type,
      readerId,
      startDate,
      endDate,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Lấy thống kê thông báo (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê thông báo thành công.',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: 'Tổng số thông báo' },
        byStatus: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              count: { type: 'number' },
            },
          },
        },
        byType: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              count: { type: 'number' },
            },
          },
        },
        byDate: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string' },
              count: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async getNotificationStats(): Promise<{
    total: number;
    byStatus: { status: string; count: number }[];
    byType: { type: string; count: number }[];
    byDate: { date: string; count: number }[];
  }> {
    return this.notificationService.getNotificationStats();
  }

  @Get('reader/:readerId/stats')
  @ApiOperation({ summary: 'Lấy thống kê thông báo của độc giả (Admin)' })
  @ApiParam({ name: 'readerId', description: 'UUID của độc giả' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê thông báo của độc giả thành công.',
  })
  async getReaderNotificationStats(
    @Param('readerId') readerId: string,
  ): Promise<{
    total: number;
    unread: number;
    byStatus: { status: string; count: number }[];
    byType: { type: string; count: number }[];
  }> {
    return this.notificationService.getReaderNotificationStats(readerId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa thông báo (Admin)' })
  @ApiParam({ name: 'id', description: 'UUID của thông báo' })
  @ApiResponse({
    status: 200,
    description: 'Xóa thông báo thành công.',
  })
  async deleteNotification(@Param('id') id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.notificationService.deleteNotification(id);
  }

  @Delete('reader/:readerId/clear-all')
  @ApiOperation({ summary: 'Xóa tất cả thông báo của độc giả (Admin)' })
  @ApiParam({ name: 'readerId', description: 'UUID của độc giả' })
  @ApiResponse({
    status: 200,
    description: 'Xóa tất cả thông báo của độc giả thành công.',
  })
  async clearAllReaderNotifications(
    @Param('readerId') readerId: string,
  ): Promise<{
    success: boolean;
    message: string;
    deletedCount: number;
  }> {
    return this.notificationService.clearAllReaderNotifications(readerId);
  }
}
