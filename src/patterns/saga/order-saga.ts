import { RedisService } from '../../redis/redis.service';

export interface SagaContext {
  orderId?: number;
  customerId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  deliveryAddress: string;
  paymentMethod: string;
  cardType?: string;
  paymentReference?: string;
  paymentId?: number;
  deliveryId?: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'COMPENSATED';
  failureReason?: string;
  stepExecutionLog?: string[];
}

export interface SagaStep {
  readonly stepName: string;
  execute(ctx: SagaContext): Promise<void>;
  compensate(ctx: SagaContext): Promise<void>;
}

export class OrderFulfillmentSagaOrchestrator {
  private steps: SagaStep[] = [];
  private redisService?: RedisService;

  constructor(redisService?: RedisService) {
    this.redisService = redisService;
  }

  addStep(step: SagaStep): OrderFulfillmentSagaOrchestrator {
    this.steps.push(step);
    return this;
  }

  private async persistState(ctx: SagaContext): Promise<void> {
    if (!this.redisService || !ctx.orderId) return;
    try {
      const key = `saga:order:${ctx.orderId}`;
      await this.redisService.set(key, JSON.stringify(ctx), 86400);
    } catch (err) {
      console.warn('[SAGA Orchestrator] Warning: Could not persist state to Redis:', err);
    }
  }

  async execute(ctx: SagaContext): Promise<SagaContext> {
    const executedSteps: SagaStep[] = [];
    ctx.stepExecutionLog = ctx.stepExecutionLog || [];

    await this.persistState(ctx);

    for (const step of this.steps) {
      try {
        console.log(`[SAGA Orchestrator] Executing step: ${step.stepName}`);
        await step.execute(ctx);
        executedSteps.push(step);
        ctx.stepExecutionLog.push(`EXEC:${step.stepName}`);
        await this.persistState(ctx);
      } catch (error: any) {
        console.error(`[SAGA Orchestrator] Step ${step.stepName} failed: ${error.message}. Initiating rollback compensations...`);
        ctx.status = 'FAILED';
        ctx.failureReason = error.message || 'Unknown failure';
        ctx.stepExecutionLog.push(`FAIL:${step.stepName}`);
        await this.persistState(ctx);

        for (const executedStep of executedSteps.reverse()) {
          try {
            console.log(`[SAGA Orchestrator] Compensating rollback on: ${executedStep.stepName}`);
            await executedStep.compensate(ctx);
            ctx.stepExecutionLog.push(`COMP:${executedStep.stepName}`);
          } catch (compensateError) {
            console.error(`[SAGA Orchestrator] Critical error compensating ${executedStep.stepName}:`, compensateError);
          }
        }

        ctx.status = 'COMPENSATED';
        await this.persistState(ctx);
        throw error;
      }
    }

    ctx.status = 'SUCCESS';
    await this.persistState(ctx);
    return ctx;
  }
}
