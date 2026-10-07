import { OrderFulfillmentSagaOrchestrator, SagaContext } from '../patterns/saga/order-saga';
import { PaymentStrategyResolver } from '../patterns/strategy/payment-strategy';
import { GeoProximityService, PartnerLocation } from '../patterns/geo/geo-proximity.service';

describe('Multi-Party Order Fulfillment End-to-End Workflow Test', () => {
  let sagaOrchestrator: OrderFulfillmentSagaOrchestrator;
  let paymentResolver: PaymentStrategyResolver;

  beforeEach(() => {
    sagaOrchestrator = new OrderFulfillmentSagaOrchestrator();
    paymentResolver = new PaymentStrategyResolver();
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
    const paymentResult = await cardStrategy.pay(orderContext.totalAmount, {
      paymentMethod: 'card',
      cardType: 'Visa Enterprise Corporate',
      paymentReference: `CARD-TXN-${orderContext.orderId}`,
      metadata: { orderId: orderContext.orderId, customerId: orderContext.customerId },
    });
    expect(paymentResult.success).toBe(true);
    lifecycleEvents.push('PAYMENT_AUTHORIZED');

    // 3. Register inventory and depot routing steps in SAGA
    sagaOrchestrator.addStep({
      stepName: 'InventoryReservation',
      execute: async (_ctx) => {
        lifecycleEvents.push('INVENTORY_RESERVED');
      },
      compensate: async (_ctx) => {
        lifecycleEvents.push('INVENTORY_RELEASED');
      },
    });

    sagaOrchestrator.addStep({
      stepName: 'SupplierDepotAssignment',
      execute: async (_ctx) => {
        lifecycleEvents.push('SUPPLIER_ASSIGNED');
      },
      compensate: async (_ctx) => {
        lifecycleEvents.push('SUPPLIER_UNASSIGNED');
      },
    });

    sagaOrchestrator.addStep({
      stepName: 'DeliverymanDispatch',
      execute: async (_ctx) => {
        // Geolocation calculation for nearest supplier/dealer depot
        const tankerPartners: PartnerLocation[] = [
          {
            id: 1,
            name: 'Chittagong Port Refinery Terminal',
            role: 'Supplier',
            email: 'refinery@chittagong.gov',
            address: 'Port Zone, Chittagong',
            coordinates: { latitude: 22.3560, longitude: 91.7830 },
          },
          {
            id: 2,
            name: 'Dhaka Central Fuel Depot',
            role: 'Dealer',
            email: 'central@dhakaoil.com',
            address: 'Kuril, Dhaka',
            coordinates: { latitude: 23.8103, longitude: 90.4125 },
          },
        ];

        const target = GeoProximityService.geocodeAddress(orderContext.deliveryAddress);
        const nearby = GeoProximityService.findNearbyPartners(target, tankerPartners, 100);

        expect(nearby.length).toBeGreaterThan(0);
        expect(nearby[0].id).toBe(1);
        lifecycleEvents.push(`DELIVERY_DISPATCHED_DEPOT_${nearby[0].id}`);
      },
      compensate: async (_ctx) => {
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
      'DELIVERY_DISPATCHED_DEPOT_1',
    ]);
  });

  it('should trigger compensating rollback transactions when a saga step fails', async () => {
    const compensationEvents: string[] = [];

    const failedOrderContext: SagaContext = {
      orderId: 9002,
      customerId: 11,
      productId: 2,
      quantity: 100,
      unitPrice: 85.00,
      totalAmount: 8500.00,
      deliveryAddress: 'Mirpur Logistics Hub',
      paymentMethod: 'bank',
      status: 'PENDING',
    };

    sagaOrchestrator.addStep({
      stepName: 'ReserveRefineryTank',
      execute: async () => {
        compensationEvents.push('TANK_RESERVED');
      },
      compensate: async () => {
        compensationEvents.push('TANK_RELEASED');
      },
    });

    sagaOrchestrator.addStep({
      stepName: 'AssignDeliveryFleet',
      execute: async () => {
        throw new Error('Fleet unavailable due to route maintenance');
      },
      compensate: async () => {
        compensationEvents.push('FLEET_NOTIFICATION_CANCELLED');
      },
    });

    await expect(sagaOrchestrator.execute(failedOrderContext)).rejects.toThrow(
      'Fleet unavailable due to route maintenance',
    );

    expect(failedOrderContext.status).toBe('COMPENSATED');
    expect(compensationEvents).toContain('TANK_RESERVED');
    expect(compensationEvents).toContain('TANK_RELEASED');
  });
});
