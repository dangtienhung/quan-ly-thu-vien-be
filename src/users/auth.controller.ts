import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { ChangePasswordDto, LoginDto, ResetPasswordDto } from './dto/auth.dto';

@ApiTags('Authentication - Xác thực người dùng')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập hệ thống' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Đăng nhập thành công.',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          description: 'JWT token chứa id người dùng',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Tên đăng nhập hoặc mật khẩu không chính xác.',
  })
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @ApiOperation({ summary: 'Đổi mật khẩu' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Đổi mật khẩu thành công.',
  })
  @ApiResponse({
    status: 401,
    description: 'Mật khẩu hiện tại không chính xác.',
  })
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Request() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user.sub, changePasswordDto);
  }

  @Post('forgot-password')
  @ApiOperation({
    summary: 'Yêu cầu đặt lại mật khẩu',
    description:
      'Gửi email chứa link đặt lại mật khẩu đến địa chỉ email đã đăng ký. Link có hiệu lực trong 15 phút.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'nguyenvana@example.com',
          description: 'Email đăng ký tài khoản',
        },
      },
      required: ['email'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Email không tồn tại trong hệ thống hoặc không thể gửi email.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Email không tồn tại trong hệ thống',
        },
        error: {
          type: 'string',
          example: 'Bad Request',
        },
        statusCode: {
          type: 'number',
          example: 400,
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Đặt lại mật khẩu',
    description:
      'Đặt lại mật khẩu mới bằng token từ email. Token có hiệu lực trong 15 phút.',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Đặt lại mật khẩu thành công.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Đặt lại mật khẩu thành công',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token không hợp lệ hoặc đã hết hạn.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Token không hợp lệ',
        },
        error: {
          type: 'string',
          example: 'Unauthorized',
        },
        statusCode: {
          type: 'number',
          example: 401,
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
