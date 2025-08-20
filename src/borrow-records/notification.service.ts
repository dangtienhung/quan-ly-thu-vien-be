import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reader } from '../readers/entities/reader.entity';
import {
  Notification,
  NotificationStatus,
  NotificationType,
} from './entities/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(Reader)
    private readonly readerRepository: Repository<Reader>,
  ) {}

  // Tạo thông báo mới
  async createNotification(
    readerId: string,
    title: string,
    message: string,
    type: NotificationType = NotificationType.GENERAL,
    metadata?: any,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      reader_id: readerId,
      title,
      message,
      type,
      status: NotificationStatus.PENDING,
      metadata,
    });

    return await this.notificationRepository.save(notification);
  }

  // Gửi thông báo qua email (mock implementation)
  // async sendEmailNotification(
  //   readerId: string,
  //   subject: string,
  //   message: string,
  // ): Promise<boolean> {
  //   try {
  //     // Lấy thông tin độc giả
  //     const reader = await this.readerRepository.findOne({
  //       where: { id: readerId },
  //     });

  //     if (!reader || !reader.email) {
  //       console.log(`Không tìm thấy email cho độc giả ${readerId}`);
  //       return false;
  //     }

  //     // TODO: Tích hợp với Nodemailer hoặc SendGrid
  //     console.log('=== GỬI EMAIL ===');
  //     console.log(`To: ${reader.email}`);
  //     console.log(`Subject: ${subject}`);
  //     console.log(`Message: ${message}`);
  //     console.log('==================');

  //     return true;
  //   } catch (error) {
  //     console.error('Lỗi gửi email:', error);
  //     return false;
  //   }
  // }

  // Gửi thông báo qua SMS (mock implementation)
  async sendSMSNotification(
    readerId: string,
    message: string,
  ): Promise<boolean> {
    try {
      // Lấy thông tin độc giả
      const reader = await this.readerRepository.findOne({
        where: { id: readerId },
      });

      if (!reader || !reader.phone) {
        console.log(`Không tìm thấy số điện thoại cho độc giả ${readerId}`);
        return false;
      }

      // TODO: Tích hợp với Twilio hoặc Viettel SMS API
      console.log('=== GỬI SMS ===');
      console.log(`To: ${reader.phone}`);
      console.log(`Message: ${message}`);
      console.log('================');

      return true;
    } catch (error) {
      console.error('Lỗi gửi SMS:', error);
      return false;
    }
  }

  // Gửi thông báo đa kênh
  async sendMultiChannelNotification(
    readerId: string,
    title: string,
    message: string,
    type: NotificationType = NotificationType.GENERAL,
    metadata?: any,
    channels: ('email' | 'sms' | 'in_app')[] = ['in_app'],
  ): Promise<{
    success: boolean;
    emailSent: boolean;
    smsSent: boolean;
    inAppCreated: boolean;
    error?: string;
  }> {
    try {
      let emailSent = false;
      let smsSent = false;
      let inAppCreated = false;

      // Tạo thông báo trong app
      if (channels.includes('in_app')) {
        await this.createNotification(readerId, title, message, type, metadata);
        inAppCreated = true;
      }

      // Gửi email (tạm thời bỏ qua)
      if (channels.includes('email')) {
        console.log(`[EMAIL] Gửi email cho độc giả ${readerId}: ${title}`);
        emailSent = true; // Mock success
      }

      // Gửi SMS (tạm thời bỏ qua)
      if (channels.includes('sms')) {
        console.log(`[SMS] Gửi SMS cho độc giả ${readerId}: ${message}`);
        smsSent = true; // Mock success
      }

      return {
        success: true,
        emailSent,
        smsSent,
        inAppCreated,
      };
    } catch (error) {
      return {
        success: false,
        emailSent: false,
        smsSent: false,
        inAppCreated: false,
        error: error.message,
      };
    }
  }

  // Lấy thông báo của độc giả
  async getReaderNotifications(
    readerId: string,
    page: number = 1,
    limit: number = 10,
    status?: NotificationStatus,
  ): Promise<{
    data: Notification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const whereConditions: any = { reader_id: readerId };

    if (status) {
      whereConditions.status = status;
    }

    const [data, total] = await this.notificationRepository.findAndCount({
      where: whereConditions,
      relations: ['reader'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Đánh dấu thông báo đã đọc
  async markAsRead(notificationId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Không tìm thấy thông báo');
    }

    notification.status = NotificationStatus.READ;
    notification.read_at = new Date();

    return await this.notificationRepository.save(notification);
  }

  // Đánh dấu tất cả thông báo của độc giả đã đọc
  async markAllAsRead(readerId: string): Promise<{ updatedCount: number }> {
    const result = await this.notificationRepository.update(
      {
        reader_id: readerId,
        status: NotificationStatus.SENT,
      },
      {
        status: NotificationStatus.READ,
        read_at: new Date(),
      },
    );

    return { updatedCount: result.affected || 0 };
  }

  // Đếm số thông báo chưa đọc
  async getUnreadCount(readerId: string): Promise<number> {
    return await this.notificationRepository.count({
      where: {
        reader_id: readerId,
        status: NotificationStatus.SENT,
      },
    });
  }

  // Xóa thông báo cũ (tự động dọn dẹp)
  async cleanupOldNotifications(
    daysOld: number = 30,
  ): Promise<{ deletedCount: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.notificationRepository.delete({
      created_at: { $lt: cutoffDate } as any,
      status: NotificationStatus.READ,
    });

    return { deletedCount: result.affected || 0 };
  }

  // ========== ADMIN METHODS ==========

  // Lấy tất cả thông báo với bộ lọc
  async getAllNotifications(
    page: number = 1,
    limit: number = 10,
    status?: NotificationStatus,
    type?: string,
    readerId?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{
    data: Notification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    // Xây dựng điều kiện where
    const whereConditions: any = {};

    if (status) {
      whereConditions.status = status;
    }

    if (type) {
      whereConditions.type = type;
    }

    if (readerId) {
      whereConditions.reader_id = readerId;
    }

    // Xử lý filter theo ngày
    if (startDate || endDate) {
      const dateFilter: any = {};
      if (startDate) {
        dateFilter.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.$lte = new Date(endDate + 'T23:59:59.999Z');
      }
      whereConditions.created_at = dateFilter;
    }

    const [data, total] = await this.notificationRepository.findAndCount({
      where: whereConditions,
      relations: ['reader'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Lấy thống kê thông báo
  async getNotificationStats(): Promise<{
    total: number;
    byStatus: { status: string; count: number }[];
    byType: { type: string; count: number }[];
    byDate: { date: string; count: number }[];
  }> {
    // Tổng số thông báo
    const total = await this.notificationRepository.count();

    // Thống kê theo trạng thái
    let byStatus: { status: string; count: number }[] = [];
    try {
      const statusStats = await this.notificationRepository
        .createQueryBuilder('notification')
        .select('notification.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('notification.status')
        .getRawMany();

      byStatus = statusStats.map((stat) => ({
        status: stat.status,
        count: parseInt(stat.count),
      }));
    } catch (error) {
      console.error('Error getting notification status stats:', error);
      byStatus = [];
    }

    // Thống kê theo loại
    let byType: { type: string; count: number }[] = [];
    try {
      const typeStats = await this.notificationRepository
        .createQueryBuilder('notification')
        .select('notification.type', 'type')
        .addSelect('COUNT(*)', 'count')
        .groupBy('notification.type')
        .getRawMany();

      byType = typeStats.map((stat) => ({
        type: stat.type,
        count: parseInt(stat.count),
      }));
    } catch (error) {
      console.error('Error getting notification type stats:', error);
      byType = [];
    }

    // Thống kê theo ngày (7 ngày gần nhất)
    let byDate: { date: string; count: number }[] = [];
    try {
      const dateStats = await this.notificationRepository
        .createQueryBuilder('notification')
        .select('DATE(notification.created_at)', 'date')
        .addSelect('COUNT(*)', 'count')
        .where('notification.created_at >= :sevenDaysAgo', {
          sevenDaysAgo: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        })
        .groupBy('date')
        .orderBy('date', 'DESC')
        .getRawMany();

      byDate = dateStats.map((stat) => ({
        date: stat.date,
        count: parseInt(stat.count),
      }));
    } catch (error) {
      console.error('Error getting notification date stats:', error);
      byDate = [];
    }

    return {
      total,
      byStatus,
      byType,
      byDate,
    };
  }

  // Lấy thống kê thông báo của độc giả
  async getReaderNotificationStats(readerId: string): Promise<{
    total: number;
    unread: number;
    byStatus: { status: string; count: number }[];
    byType: { type: string; count: number }[];
  }> {
    // Tổng số thông báo
    const total = await this.notificationRepository.count({
      where: { reader_id: readerId },
    });

    // Số thông báo chưa đọc
    const unread = await this.notificationRepository.count({
      where: { reader_id: readerId, status: NotificationStatus.SENT },
    });

    // Thống kê theo trạng thái
    let byStatus: { status: string; count: number }[] = [];
    try {
      const statusStats = await this.notificationRepository
        .createQueryBuilder('notification')
        .select('notification.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .where('notification.reader_id = :readerId', { readerId })
        .groupBy('notification.status')
        .getRawMany();

      byStatus = statusStats.map((stat) => ({
        status: stat.status,
        count: parseInt(stat.count),
      }));
    } catch (error) {
      console.error('Error getting reader notification status stats:', error);
      byStatus = [];
    }

    // Thống kê theo loại
    let byType: { type: string; count: number }[] = [];
    try {
      const typeStats = await this.notificationRepository
        .createQueryBuilder('notification')
        .select('notification.type', 'type')
        .addSelect('COUNT(*)', 'count')
        .where('notification.reader_id = :readerId', { readerId })
        .groupBy('notification.type')
        .getRawMany();

      byType = typeStats.map((stat) => ({
        type: stat.type,
        count: parseInt(stat.count),
      }));
    } catch (error) {
      console.error('Error getting reader notification type stats:', error);
      byType = [];
    }

    return {
      total,
      unread,
      byStatus,
      byType,
    };
  }

  // Xóa thông báo
  async deleteNotification(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const notification = await this.notificationRepository.findOne({
        where: { id },
      });

      if (!notification) {
        return {
          success: false,
          message: 'Không tìm thấy thông báo',
        };
      }

      await this.notificationRepository.remove(notification);

      return {
        success: true,
        message: 'Xóa thông báo thành công',
      };
    } catch (error) {
      console.error('Error deleting notification:', error);
      return {
        success: false,
        message: 'Lỗi khi xóa thông báo',
      };
    }
  }

  // Xóa tất cả thông báo của độc giả
  async clearAllReaderNotifications(readerId: string): Promise<{
    success: boolean;
    message: string;
    deletedCount: number;
  }> {
    try {
      const result = await this.notificationRepository.delete({
        reader_id: readerId,
      });

      return {
        success: true,
        message: 'Xóa tất cả thông báo của độc giả thành công',
        deletedCount: result.affected || 0,
      };
    } catch (error) {
      console.error('Error clearing reader notifications:', error);
      return {
        success: false,
        message: 'Lỗi khi xóa thông báo',
        deletedCount: 0,
      };
    }
  }
}
