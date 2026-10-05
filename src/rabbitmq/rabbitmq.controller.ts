import { Controller, Post, Get, Body, Query, BadRequestException } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';

export class SendRabbitMessageDto {
  queue?: string;
  pattern: string;
  data: any;
  sender?: string;
  recipient?: string;
}

@Controller('rabbitmq')
export class RabbitMQController {
  constructor(private readonly rabbitService: RabbitMQService) {}

  @Post('send')
  async sendMessage(@Body() body: SendRabbitMessageDto) {
    if (!body.pattern) {
      throw new BadRequestException('Message pattern/topic is required.');
    }
    const targetQueue = body.queue || 'petroleum_messages_queue';
    const success = await this.rabbitService.sendMessage(
      targetQueue,
      body.pattern,
      body.data || {},
      body.sender || 'system',
      body.recipient || 'broadcast'
    );
    return {
      success,
      message: `Message dispatched successfully to RabbitMQ queue: ${targetQueue}`,
      timestamp: new Date().toISOString(),
      pattern: body.pattern,
    };
  }

  @Get('status')
  getStatus() {
    return this.rabbitService.getQueueStatus();
  }
}
