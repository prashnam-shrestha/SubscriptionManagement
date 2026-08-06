import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IdGeneratorService, EntityPrefix } from '../services/id-generator.service';

export interface LogActivityParams {
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  details?: string;
  ipAddress?: string;
}

export interface ActivityLogFilters {
  userId?: string;
  entity?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  pageSize?: number;
}

@Injectable()
export class ActivityLogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly idGenerator: IdGeneratorService,
  ) {}

  /**
   * Writes an immutable audit entry to ActivityLog.
   * NO update or delete methods exist in this service (BR-076).
   */
async logActivity(params: LogActivityParams): Promise<void> {
  await this.prisma.activityLog.create({
    data: {
      logId: this.idGenerator.generateId(EntityPrefix.ACTIVITY_LOG),
      userId: params.userId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      details: params.details || null,
      ipAddress: params.ipAddress || null,
      createdAt: new Date(), // <--- Add this line
    },
  });
}

  async findActivity(filters: ActivityLogFilters) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.entity) where.entity = filters.entity;
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }

    const [items, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { userId: true, fullName: true, email: true, role: true },
          },
        },
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}