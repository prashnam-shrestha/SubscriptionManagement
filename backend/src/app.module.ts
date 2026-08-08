import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { ActivityLogModule } from './common/activity-log/activity-log.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { SettingsModule } from './modules/settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CommonModule,
    ActivityLogModule,
    HealthModule,
    AuthModule,
  SettingsModule,
  ],
})
export class AppModule {}