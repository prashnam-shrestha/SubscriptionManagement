import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import {
  IdGeneratorService,
  EntityPrefix,
} from '../../common/services/id-generator.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly idGenerator: IdGeneratorService,
  ) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        userId: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    fullName: string;
    email: string;
    password: string;
    role: 'Owner' | 'Admin';
  }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new ConflictException(
        'User with this email already exists',
      );
    }

    const userId = await this.idGenerator.generateId(EntityPrefix.USER);
    const passwordHash = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        userId,
        fullName: data.fullName,
        email: data.email,
        passwordHash,
        role: data.role,
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      select: {
        userId: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
      },
    });
  }

  async update(
    userId: string,
    data: {
      fullName?: string;
      email?: string;
      status?: string;
      role?: 'Owner' | 'Admin';
    },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      select: {
        userId: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
      },
    });
  }

  async disableUser(userId: string) {
    return this.update(userId, {
      status: 'Disabled',
    });
  }
}
