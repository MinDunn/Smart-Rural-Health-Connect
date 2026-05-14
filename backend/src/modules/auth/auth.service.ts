import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  private otpStore = new Map<string, { otp: string; expires: number }>();

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email không tồn tại trong hệ thống');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

    this.otpStore.set(email, { otp, expires });

    // Gửi email thật
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: '[Smart Rural Health] Mã xác thực khôi phục mật khẩu',
        template: './forgot-password', // Tên file template (không có đuôi)
        context: {
          otp: otp,
          email: email,
        },
        // Fallback text if template fails
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #00704a;">Khôi phục mật khẩu</h2>
            <p>Xin chào,</p>
            <p>Bạn đã yêu cầu khôi phục mật khẩu. Mã OTP của bạn là:</p>
            <h1 style="color: #00704a; letter-spacing: 5px;">${otp}</h1>
            <p>Mã này sẽ hết hạn sau 5 phút.</p>
            <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
          </div>
        `,
      });
      console.log(`[SUCCESS] Đã gửi mã OTP đến ${email}`);
    } catch (error) {
      console.error(`[ERROR] Lỗi gửi mail đến ${email}:`, error);
      // Vẫn log ra console để test nếu gửi mail thất bại
      console.log(`[FALLBACK] Mã OTP của bạn là: ${otp}`);
    }

    return { message: 'Mã OTP đã được gửi đến email của bạn' };
  }

  async resetPassword(resetDto: any) {
    const { email, otp, newPassword } = resetDto;
    const record = this.otpStore.get(email);

    if (!record || record.otp !== otp || Date.now() > record.expires) {
      throw new UnauthorizedException('Mã OTP không chính xác hoặc đã hết hạn');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePasswordByEmail(email, hashedPassword);

    this.otpStore.delete(email);

    return { message: 'Mật khẩu đã được thay đổi thành công' };
  }

  async validateGoogleUser(googleUser: any) {
    const { email, firstName, lastName } = googleUser;

    let user = await this.usersService.findByEmail(email);

    if (!user) {
      // Create new user if not exists
      console.log(`[AUTH] Creating new user from Google: ${email}`);
      // Using a random password since they login with Google
      const randomPassword = await bcrypt.hash(
        Math.random().toString(36).slice(-10),
        10,
      );
      user = await this.usersService.create({
        email,
        password: randomPassword,
        firstName,
        lastName,
        roleName: 'citizen',
      });
    }

    return this.login(user);
  }

  async register(registerDto: any) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    return this.login(user);
  }

  async validateUser(identifier: string, pass: string): Promise<any> {
    const user = await this.usersService.findByIdentifier(identifier);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role?.name,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile,
        role: user.role,
        patientId: user.patient?.id,
      },
    };
  }
}
