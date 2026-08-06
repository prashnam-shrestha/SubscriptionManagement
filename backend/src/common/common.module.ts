import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { IdGeneratorService } from './services/id-generator.service';
import { CryptoService } from './services/crypto.service';
import { TransformInterceptor } from './interceptors/transform.interceptor';

@Global()
@Module({
  providers: [
    IdGeneratorService,
    CryptoService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
  exports: [IdGeneratorService, CryptoService],
})
export class CommonModule {}