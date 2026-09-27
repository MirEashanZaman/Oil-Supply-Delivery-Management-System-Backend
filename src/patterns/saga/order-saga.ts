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
}

export interface SagaStep {
  readonly stepName: string;
  execute(ctx: SagaContext): Promise<void>;
  compensate(ctx: SagaContext): Promise<void>;
}

export class OrderFulfillmentSagaOrchestrator {
  private steps: SagaStep[] = [];

  addStep(step: SagaStep): OrderFulfillmentSagaOrchestrator {
    this.steps.push(step);
    return this;
  }

  async execute(ctx: SagaContext): Promise<SagaContext> {
    const executedSteps: SagaStep[] = [];

    for (const step of this.steps) {
      try {
        console.log(`[SAGA Orchestrator] Executing step: ${step.stepName}`);
        await step.execute(ctx);
        executedSteps.push(step);
      } catch (error: any) {
        console.error(`[SAGA Orchestrator] Step ${step.stepName} failed: ${error.message}. Initiating rollback compensations...`);
        ctx.status = 'FAILED';
        ctx.failureReason = error.message || 'Unknown failure';

        // Rollback executed steps in reverse order (Compensating Transactions)
        for (const executedStep of executedSteps.reverse()) {
          try {
            console.log(`[SAGA Orchestrator] Compensating rollback on: ${executedStep.stepName}`);
            await executedStep.compensate(ctx);
          } catch (compensateError) {
            console.error(`[SAGA Orchestrator] Critical error compensating ${executedStep.stepName}:`, compensateError);
          }
        }

        ctx.status = 'COMPENSATED';
        throw error;
      }
    }

    ctx.status = 'SUCCESS';
    return ctx;
  }
}
