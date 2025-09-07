import * as nodemailer from 'nodemailer';

import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('NODEMAILER_USER'),
        pass: this.configService.get<string>('NODEMAILER_PASSWORD'),
      },
    });
  }

  async sendResetPasswordEmail(
    email: string,
    resetToken: string,
    userName: string,
  ) {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: this.configService.get<string>('NODEMAILER_USER'),
      to: email,
      subject: 'Đặt lại mật khẩu - Hệ thống Quản lý Thư viện',
      html: this.getResetPasswordEmailTemplate(userName, resetUrl),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Reset password email sent to ${email}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Không thể gửi email đặt lại mật khẩu');
    }
  }

  private getResetPasswordEmailTemplate(
    userName: string,
    resetUrl: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Đặt lại mật khẩu</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .title {
            color: #1f2937;
            font-size: 20px;
            margin-bottom: 20px;
          }
          .content {
            margin-bottom: 30px;
          }
          .button {
            display: inline-block;
            background-color: #2563eb;
            color: white !important;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #1d4ed8;
          }
          .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            color: #92400e;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">📚 Hệ thống Quản lý Thư viện</div>
          </div>

          <h1 class="title">Đặt lại mật khẩu</h1>

          <div class="content">
            <p>Xin chào <strong>${userName}</strong>,</p>

            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn trong hệ thống Quản lý Thư viện.</p>

            <p>Để đặt lại mật khẩu, vui lòng nhấp vào nút bên dưới:</p>

            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Đặt lại mật khẩu</a>
            </div>

            <p>Hoặc bạn có thể sao chép và dán liên kết sau vào trình duyệt:</p>
            <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 5px;">
              ${resetUrl}
            </p>

            <div class="warning">
              <strong>⚠️ Lưu ý quan trọng:</strong>
              <ul>
                <li>Liên kết này chỉ có hiệu lực trong <strong>15 phút</strong></li>
                <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
                <li>Để bảo mật tài khoản, không chia sẻ liên kết này với bất kỳ ai</li>
              </ul>
            </div>
          </div>

          <div class="footer">
            <p>Email này được gửi tự động từ hệ thống. Vui lòng không trả lời email này.</p>
            <p>© 2024 Hệ thống Quản lý Thư viện. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendWelcomeEmail(
    email: string,
    userName: string,
    tempPassword: string,
  ) {
    const loginUrl = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/login`;

    const mailOptions = {
      from: this.configService.get<string>('NODEMAILER_USER'),
      to: email,
      subject: 'Chào mừng đến với Hệ thống Quản lý Thư viện',
      html: this.getWelcomeEmailTemplate(userName, tempPassword, loginUrl),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${email}`);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw new Error('Không thể gửi email chào mừng');
    }
  }

  private getWelcomeEmailTemplate(
    userName: string,
    tempPassword: string,
    loginUrl: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Chào mừng</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .title {
            color: #1f2937;
            font-size: 20px;
            margin-bottom: 20px;
          }
          .content {
            margin-bottom: 30px;
          }
          .button {
            display: inline-block;
            background-color: #10b981;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
          }
          .credentials {
            background-color: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">📚 Hệ thống Quản lý Thư viện</div>
          </div>

          <h1 class="title">Chào mừng bạn!</h1>

          <div class="content">
            <p>Xin chào <strong>${userName}</strong>,</p>

            <p>Chào mừng bạn đến với Hệ thống Quản lý Thư viện! Tài khoản của bạn đã được tạo thành công.</p>

            <div class="credentials">
              <h3>Thông tin đăng nhập:</h3>
              <p><strong>Mật khẩu tạm thời:</strong> <code>${tempPassword}</code></p>
              <p><em>Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu.</em></p>
            </div>

            <div style="text-align: center;">
              <a href="${loginUrl}" class="button">Đăng nhập ngay</a>
            </div>

            <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với quản trị viên hệ thống.</p>
          </div>

          <div class="footer">
            <p>Email này được gửi tự động từ hệ thống. Vui lòng không trả lời email này.</p>
            <p>© 2024 Hệ thống Quản lý Thư viện. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
