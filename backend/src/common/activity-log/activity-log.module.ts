import { Global, Module } from "@nestjs/common";

import { CommonModule } from "../common.module";
import { ActivityLogService } from "./activity-log.service";

@Global()
@Module({
  imports: [CommonModule],
  providers: [ActivityLogService],
  exports: [ActivityLogService],
})
export class ActivityLogModule {}