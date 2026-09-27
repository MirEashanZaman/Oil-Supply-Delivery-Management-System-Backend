export interface TelemetryPayload {
  sensorId: string;
  tankerId: string;
  fuelTemperatureCelsius: number;
  flowRateLitersPerMin: number;
  pressureBar: number;
  gpsCoordinates: { lat: number; lng: number };
  timestamp: string;
}

export type TopicHandler = (topic: string, message: TelemetryPayload) => Promise<void> | void;

export class IoTMessageBroker {
  private subscribers: Map<string, Set<TopicHandler>> = new Map();

  subscribe(topic: string, handler: TopicHandler): void {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }
    this.subscribers.get(topic)!.add(handler);
  }

  unsubscribe(topic: string, handler: TopicHandler): void {
    const handlers = this.subscribers.get(topic);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  async publish(topic: string, message: TelemetryPayload): Promise<void> {
    const handlers = this.subscribers.get(topic);
    if (handlers) {
      for (const handler of handlers) {
        try {
          await handler(topic, message);
        } catch (err) {
          console.error(`[IoTBroker] Error handling event on topic ${topic}:`, err);
        }
      }
    }
  }
}
