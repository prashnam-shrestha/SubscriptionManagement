import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogService } from '../common/activity-log/activity-log.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
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

    const accessToken = this.jwtService.sign(payload);

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
      user: {
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  }

  async logout(userId: string, ipAddress?: string): Promise<void> {
    // Audit Log: User Logout
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