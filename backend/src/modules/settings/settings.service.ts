import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityLogService } from '../../common/activity-log/activity-log.service';

const SETTINGS_SINGLETON_ID = 'SETTINGS-001';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async getSettings() {
    let settings = await this.prisma.settings.findUnique({
      where: { id: SETTINGS_SINGLETON_ID },
    });

    if (!settings) {
      settings = await this.prisma.settings.create({
        data: {
          id: SETTINGS_SINGLETON_ID,
          businessName: 'SubscriptionOS Business',
          assignmentStrategy: 'LowestOccupancy',
          pinRotationPolicy: 'Manual',
        },
      });
    }

    return settings;
  }

  async updateSettings(
    data: {
      businessName?: string;
      businessContactEmail?: string;
      businessContactPhone?: string;
      currency?: string;
      assignmentStrategy?: string;
      pinRotationPolicy?: string;
      preferences?: any;
    },
    

    userId: string,
    ipAddress?: string,
  ) {
    const updated = await this.prisma.settings.upsert({
      where: { id: SETTINGS_SINGLETON_ID },
      update: {
        businessName: data.businessName,
        businessContactEmail: data.businessContactEmail,
        businessContactPhone: data.businessContactPhone,
        currency: data.currency,
        assignmentStrategy: data.assignmentStrategy,
        pinRotationPolicy: data.pinRotationPolicy,
        preferences: data.preferences,
      },
      create: {
        id: SETTINGS_SINGLETON_ID,
        businessName: data.businessName || 'SubscriptionOS Business',
        businessContactEmail: data.businessContactEmail,
        businessContactPhone: data.businessContactPhone,
        currency: data.currency || 'NPR',
        assignmentStrategy: data.assignmentStrategy || 'LowestOccupancy',
        pinRotationPolicy: data.pinRotationPolicy || 'Manual',
        preferences: data.preferences,
      },
    });

    await this.activityLogService.logActivity({
      userId,
      action: 'Settings Changed',
      entity: 'Settings',
      entityId: SETTINGS_SINGLETON_ID,
      ipAddress,
      details: JSON.stringify(data),
    });

    return updated;
  }
}
