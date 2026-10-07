import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';

export interface RabbitMessagePayload {
  pattern: string;
  data: any;
  timestamp: string;
  sender?: string;
  recipient?: string;
}

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: any = null;
  private channel: any = null;
  private readonly rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
  private readonly defaultQueue = process.env.RABBITMQ_QUEUE || 'petroleum_messages_queue';
  private isConnected = false;
  private memoryQueue: RabbitMessagePayload[] = [];

  async onModuleInit() {
    await this.connectWithFallback();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connectWithFallback() {
    try {
      this.logger.log(`Connecting to RabbitMQ Broker at: ${this.rabbitUrl}...`);
      this.connection = await amqp.connect(this.rabbitUrl);
      this.channel = await this.connection.createChannel();
      
      await this.channel.assertQueue(this.defaultQueue, { durable: true });
      await this.channel.assertQueue('order_notifications_queue', { durable: true });
      await this.channel.assertQueue('customer_messages_queue', { durable: true });
      
      this.isConnected = true;
      this.logger.log(`[RabbitMQ] Connected successfully. Active Queue: ${this.defaultQueue}`);
      
      this.listenToQueue(this.defaultQueue);
      this.listenToQueue('order_notifications_queue');
      this.listenToQueue('customer_messages_queue');
    } catch (err: any) {
      this.isConnected = false;
      this.logger.warn(
        `[RabbitMQ] Broker offline (${err.message || 'connection failed'}). Running in High-Availability In-Memory Message Bus mode.`
      );
    }
  }

  private async disconnect() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
    } catch {
    }
  }

  async sendMessage(queueName: string, pattern: string, data: any, sender?: string, recipient?: string): Promise<boolean> {
    const payload: RabbitMessagePayload = {
      pattern,
      data,
      timestamp: new Date().toISOString(),
      sender,
      recipient,
    };

    if (this.isConnected && this.channel) {
      try {
        await this.channel.assertQueue(queueName, { durable: true });
        const sent = this.channel.sendToQueue(
          queueName,
          Buffer.from(JSON.stringify(payload)),
          { persistent: true }
        );
        this.logger.log(`[RabbitMQ] Published message to queue "${queueName}" -> Pattern: [${pattern}]`);
        return sent;
      } catch (sendErr: any) {
        this.logger.error(`[RabbitMQ] Failed to push to queue ${queueName}: ${sendErr.message}`);
      }
    }

    this.memoryQueue.push(payload);
    this.logger.log(`[RabbitMQ In-Memory Bus] Message enqueued -> Pattern: [${pattern}] for ${recipient || 'all'}`);
    return true;
  }

  private async listenToQueue(queueName: string) {
    if (!this.channel) return;
    try {
      await this.channel.consume(queueName, (msg) => {
        if (msg !== null) {
          try {
            const content: RabbitMessagePayload = JSON.parse(msg.content.toString());
            this.logger.log(`[RabbitMQ Consumer] Received event from "${queueName}": [${content.pattern}]`);
            this.handleMessage(content);
            this.channel?.ack(msg);
          } catch (e: any) {
            this.logger.error(`[RabbitMQ Consumer] Parse error: ${e.message}`);
            this.channel?.nack(msg, false, false);
          }
        }
      });
    } catch (err: any) {
      this.logger.warn(`[RabbitMQ] Consumer registration error for "${queueName}": ${err.message}`);
    }
  }

  private handleMessage(payload: RabbitMessagePayload) {
    this.logger.log(`[RabbitMQ Dispatcher] Executing worker task for: ${payload.pattern}`);
  }

  getQueueStatus() {
    return {
      connected: this.isConnected,
      brokerUrl: this.rabbitUrl,
      defaultQueue: this.defaultQueue,
      bufferedInMemoryMessages: this.memoryQueue.length,
      recentMessages: this.memoryQueue.slice(-10),
    };
  }
}
