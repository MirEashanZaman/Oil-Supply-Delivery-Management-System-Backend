import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from '../customer/customer.service';
import { DealerService } from '../dealer/dealer.service';
import { SupplierService } from '../supplier/supplier.service';
import { DeliverymanService } from '../deliveryman/deliveryman.service';
import { OrderFulfillmentSagaOrchestrator, SagaContext } from '../patterns/saga/order-saga';
import { PaymentStrategyResolver } from '../patterns/strategy/payment-strategy';
import { GeoProximityService } from '../patterns/geo/geo-proximity.service';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { RedisService } from '../redis/redis.service';

describe('Multi-Party Order Fulfillment End-to-End Workflow Test', () => {
  let sagaOrchestrator: OrderFulfillmentSagaOrchestrator;
  let paymentResolver: PaymentStrategyResolver;
  let geoService: GeoProximityService;

  beforeEach(() => {
    sagaOrchestrator = new OrderFulfillmentSagaOrchestrator();
    paymentResolver = new PaymentStrategyResolver();
    geoService = new GeoProximityService();
  });

  it('should complete the entire multi-party customer order, payment, reservation, and delivery pipeline', async () => {
    const lifecycleEvents: string[] = [];

    // 1. Customer initiates bulk order
    const orderContext: SagaContext = {
      orderId: 9001,
      customerId: 10,
      productId: 1,
      quantity: 50,
      unitPrice: 94.20,
      totalAmount: 4710.00,
      deliveryAddress: 'Commercial Logistics Terminal 3, Chittagong',
      paymentMethod: 'card',
      status: 'PENDING',
    };
    lifecycleEvents.push('ORDER_CREATED');

    // 2. Payment authorization via Card strategy
    const cardStrategy = paymentResolver.resolve('card');
    const paymentResult = await cardStrategy.processPayment({
      amount: orderContext.totalAmount,
      currency: 'USD',
      customerEmail: 'buyer@energycorp.com',
      metadata: { orderId: orderContext.orderId },
    });
    expect(paymentResult.status).toBe('SUCCESS');
    lifecycleEvents.push('PAYMENT_AUTHORIZED');

    // 3. Register inventory and depot routing steps in SAGA
    sagaOrchestrator.addStep({
      stepName: 'InventoryReservation',
      execute: async (ctx) => {
        lifecycleEvents.push('INVENTORY_RESERVED');
        ctx.status = 'INVENTORY_RESERVED';
      },
      compensate: async () => {
        lifecycleEvents.push('INVENTORY_RELEASED');
      },
    });

    sagaOrchestrator.addStep({
      stepName: 'SupplierDepotAssignment',
      execute: async (ctx) => {
        lifecycleEvents.push('SUPPLIER_ASSIGNED');
        ctx.status = 'PROCESSING';
      },
      compensate: async () => {
        lifecycleEvents.push('SUPPLIER_UNASSIGNED');
      },
    });

    sagaOrchestrator.addStep({
      stepName: 'DeliverymanDispatch',
      execute: async (ctx) => {
        // Geolocation calculation for nearest delivery tanker
        const tankerLocations = [
          { id: 1, name: 'Tanker Lorry A', role: 'deliveryman' as const, latitude: 22.3350, longitude: 91.8320 },
          { id: 2, name: 'Tanker Lorry B', role: 'deliveryman' as const, latitude: 23.8103, longitude: 90.4125 },
        ];
        const target = { latitude: 22.3360, longitude: 91.8330 };
        const nearest = geoService.findNearestPartners(target, tankerLocations, 100);

        expect(nearest.length).toBeGreaterThan(0);
        expect(nearest[0].partner.id).toBe(1);
        lifecycleEvents.push(`DELIVERY_DISPATCHED_TANKER_${nearest[0].partner.id}`);
        ctx.status = 'OUT_FOR_DELIVERY';
      },
      compensate: async () => {
        lifecycleEvents.push('DISPATCH_CANCELLED');
      },
    });

    // 4. Execute Saga pipeline
    const finalContext = await sagaOrchestrator.execute(orderContext);
    expect(finalContext.status).toBe('SUCCESS');

    // 5. Verify full event chain
    expect(lifecycleEvents).toEqual([
      'ORDER_CREATED',
      'PAYMENT_AUTHORIZED',
      'INVENTORY_RESERVED',
      'SUPPLIER_ASSIGNED',
      'DELIVERY_DISPATCHED_TANKER_1',
    ]);
  });
});
