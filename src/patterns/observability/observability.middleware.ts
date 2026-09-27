import {
  Injectable,
  NestMiddleware,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export interface TraceContext {
  traceId: string;
  spanId: string;
  path: string;
  method: string;
  startTime: number;
}

@Injectable()
export class ObservabilityMiddleware implements NestMiddleware {
  private readonly logger = new Logger('ObservabilityTracer');
  private static activeMetrics = {
    totalRequests: 0,
    activeRequests: 0,
    statusCodes: {} as Record<number, number>,
  };

  use(req: Request, res: Response, next: NextFunction): void {
    const traceId = (req.headers['x-trace-id'] as string) || randomUUID();
    const spanId = randomUUID();
    const startTime = Date.now();

    res.setHeader('X-Trace-Id', traceId);
    res.setHeader('X-Span-Id', spanId);

    ObservabilityMiddleware.activeMetrics.totalRequests++;
    ObservabilityMiddleware.activeMetrics.activeRequests++;

    res.on('finish', () => {
      const durationMs = Date.now() - startTime;
      const statusCode = res.statusCode;

      ObservabilityMiddleware.activeMetrics.activeRequests--;
      ObservabilityMiddleware.activeMetrics.statusCodes[statusCode] =
        (ObservabilityMiddleware.activeMetrics.statusCodes[statusCode] || 0) + 1;

      this.logger.log(
        JSON.stringify({
          type: 'TRACE_METRIC',
          traceId,
          spanId,
          method: req.method,
          path: req.originalUrl || req.url,
          statusCode,
          durationMs,
          timestamp: new Date().toISOString(),
        }),
      );
    });

    next();
  }

  public static getMetrics() {
    return {
      ...ObservabilityMiddleware.activeMetrics,
      timestamp: new Date().toISOString(),
      uptimeSeconds: process.uptime(),
      memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    };
  }
}
