import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { ChangePasswordDto, LoginDto, ResetPasswordDto } from './dto/auth.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    let user = await this.userRepository.findOne({ where: { username } });

    // Nếu không tìm thấy theo username, thử tìm theo email
    if (!user) {
      user = await this.userRepository.findOne({ where: { email: username } });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);

    if (!user) {
      throw new UnauthorizedException(
        'Tên đăng nhập hoặc mật khẩu không chính xác',
      );
    }

    // Cập nhật thời gian đăng nhập cuối cùng
    await this.usersService.updateLastLogin(user.id);

    // Chỉ mã hóa id trong payload
    const payload = {
      sub: user.id,
    };

    // Chỉ trả về token
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Mật khẩu hiện tại không chính xác');
    }

    if (changePasswordDto.currentPassword === changePasswordDto.newPassword) {
      throw new BadRequestException(
        'Mật khẩu mới không được trùng với mật khẩu hiện tại',
      );
    }

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    user.password = hashedPassword;

    await this.userRepository.save(user);

    return {
      message: 'Đổi mật khẩu thành công',
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException('Email không tồn tại trong hệ thống');
    }

    // Tạo token đặt lại mật khẩu
    const resetToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email },
      { expiresIn: '15m' }, // Token hết hạn sau 15 phút
    );

    // TODO: Gửi email chứa link đặt lại mật khẩu
    // Link có dạng: frontend-url/reset-password?token=resetToken

    return {
      message: 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      // Verify token
      const payload = await this.jwtService.verifyAsync(
        resetPasswordDto.resetToken,
      );

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Token không hợp lệ');
      }

      // Hash và lưu mật khẩu mới
      const hashedPassword = await bcrypt.hash(
        resetPasswordDto.newPassword,
        10,
      );
      user.password = hashedPassword;

      await this.userRepository.save(user);

      return {
        message: 'Đặt lại mật khẩu thành công',
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token đã hết hạn');
      }
      throw new UnauthorizedException('Token không hợp lệ');
    }
  }
}
