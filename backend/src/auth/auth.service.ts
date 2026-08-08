import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogService } from '../common/activity-log/activity-log.service';
import { RedisService } from '../common/services/redis.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly activityLog: ActivityLogService,
  ) {}

  async login(loginDto: LoginDto, ipAddress?: string): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== 'Active') {
      throw new ForbiddenException('User account is inactive or suspended');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.userId,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret:
        process.env.JWT_ACCESS_SECRET ||
        'subscriptionos_default_jwt_access_secret_2026',
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret:
        process.env.JWT_REFRESH_SECRET ||
        'subscriptionos_default_jwt_refresh_secret_2026',
      expiresIn: '7d',
    });

    await this.redisService.setRefreshToken(
      user.userId,
      refreshToken,
      7 * 24 * 60 * 60,
    );

    // Audit Log: User Login
    await this.activityLog.logActivity({
      userId: user.userId,
      action: 'Login',
      entity: 'User',
      entityId: user.userId,
      details: `User ${user.email} logged in successfully`,
      ipAddress,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const storedToken = await this.redisService.getRefreshToken(payload.sub);

      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const accessToken = this.jwtService.sign(
        {
          sub: payload.sub,
          email: payload.email,
          role: payload.role,
        },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: '15m',
        },
      );

      return { accessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, ipAddress?: string): Promise<void> {

    await this.redisService.deleteRefreshToken(userId);

    await this.activityLog.logActivity({
      userId,
      action: 'Logout',
      entity: 'User',
      entityId: userId,
      details: 'User logged out',
      ipAddress,
    });
  }

  async validateUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user || user.status !== 'Active') {
      throw new UnauthorizedException('User account not found or inactive');
    }

    return user;
  }
}