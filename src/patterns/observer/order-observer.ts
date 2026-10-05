export interface OrderEventPayload {
  orderId: number;
  productName: string;
  quantity: number;
  totalAmount: number;
  status: string;
  customerEmail?: string;
  timestamp: Date;
}

export interface OrderObserver {
  readonly observerName: string;
  onOrderEvent(eventType: 'CREATED' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED', payload: OrderEventPayload): Promise<void>;
}

export class EmailNotificationObserver implements OrderObserver {
  readonly observerName = 'EmailNotificationObserver';

  async onOrderEvent(eventType: 'CREATED' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED', payload: OrderEventPayload): Promise<void> {
    console.log(`[Observer - Email] Sending ${eventType} receipt to ${payload.customerEmail || 'Customer'} for Order #${payload.orderId}`);
  }
}

export class AuditLogObserver implements OrderObserver {
  readonly observerName = 'AuditLogObserver';

  async onOrderEvent(eventType: 'CREATED' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED', payload: OrderEventPayload): Promise<void> {
    console.log(`[Observer - Audit] Logged event ${eventType} on Order #${payload.orderId} at ${payload.timestamp.toISOString()}`);
  }
}

export class RealtimeDispatchObserver implements OrderObserver {
  readonly observerName = 'RealtimeDispatchObserver';

  async onOrderEvent(eventType: 'CREATED' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED', payload: OrderEventPayload): Promise<void> {
    if (eventType === 'CONFIRMED' || eventType === 'DELIVERED') {
      console.log(`[Observer - Realtime Fleet Dispatch] Updated tanker logistics route for Order #${payload.orderId} (Status: ${payload.status})`);
    }
  }
}

export class RabbitMQOrderObserver implements OrderObserver {
  readonly observerName = 'RabbitMQOrderObserver';

  constructor(private rabbitService?: any) {}

  async onOrderEvent(eventType: 'CREATED' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED', payload: OrderEventPayload): Promise<void> {
    console.log(`[Observer - RabbitMQ Broker] Queuing event ${eventType} for Order #${payload.orderId}`);
    if (this.rabbitService && typeof this.rabbitService.sendMessage === 'function') {
      await this.rabbitService.sendMessage(
        'order_notifications_queue',
        `order.${eventType.toLowerCase()}`,
        payload,
        'OrderFulfillmentService',
        payload.customerEmail || 'customer'
      );
    }
  }
}

export class OrderSubject {
  private observers: OrderObserver[] = [];

  attach(observer: OrderObserver): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }

  detach(observer: OrderObserver): void {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  async notify(eventType: 'CREATED' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED', payload: OrderEventPayload): Promise<void> {
    for (const observer of this.observers) {
      try {
        await observer.onOrderEvent(eventType, payload);
      } catch (err) {
        console.error(`[OrderSubject] Observer ${observer.observerName} failed on ${eventType}:`, err);
      }
    }
  }
}
