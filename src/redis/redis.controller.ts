import { Controller, Get, Post, Body, Query, Delete } from '@nestjs/common';
import { RedisService } from './redis.service';

@Controller('redis')
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @Get('status')
  getStatus() {
    return this.redisService.getStatus();
  }

  @Post('set')
  async setCache(@Body() body: { key: string; value: any; ttl?: number }) {
    if (!body.key) return { success: false, message: 'Key is required' };
    const success = await this.redisService.set(body.key, body.value, body.ttl);
    return { success, key: body.key, message: 'Value cached in Redis' };
  }

  @Get('get')
  async getCache(@Query('key') key: string) {
    if (!key) return { success: false, message: 'Key query parameter is required' };
    const value = await this.redisService.get(key);
    return { key, value, exists: value !== null };
  }

  @Delete('del')
  async deleteCache(@Query('key') key: string) {
    if (!key) return { success: false, message: 'Key query parameter is required' };
    const success = await this.redisService.del(key);
    return { success, key, message: 'Key evicted from cache' };
  }
}
