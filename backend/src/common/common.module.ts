import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";

import { TransformInterceptor } from "./interceptors/transform.interceptor";
import { RedisService } from "./services/redis.service";
import { IdGeneratorService } from "./services/id-generator.service";

@Module({
  providers: [
    RedisService,
    IdGeneratorService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
  exports: [
    RedisService,
    IdGeneratorService,
  ],
})
export class CommonModule {}