import { Module } from '@nestjs/common';
import { ActivityLogModule } from '../../common/activity-log/activity-log.module';
import { CommonModule } from '../../common/common.module';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { CredentialTemplatesController } from './credential-templates.controller';
import { CredentialTemplatesService } from './credential-templates.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [ActivityLogModule, CommonModule],
  controllers: [
    SettingsController,
    CredentialTemplatesController,
    UsersController,
  ],
  providers: [
    SettingsService,
    CredentialTemplatesService,
    UsersService,
  ],
  exports: [SettingsService],
})
export class SettingsModule {}
