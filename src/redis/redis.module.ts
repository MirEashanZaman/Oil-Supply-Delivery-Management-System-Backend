import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisController } from './redis.controller';
import { RedisThrottlerGuard } from './redis-throttler.guard';

@Global()
@Module({
  controllers: [RedisController],
  providers: [RedisService, RedisThrottlerGuard],
  exports: [RedisService, RedisThrottlerGuard],
})
export class RedisModule {}
