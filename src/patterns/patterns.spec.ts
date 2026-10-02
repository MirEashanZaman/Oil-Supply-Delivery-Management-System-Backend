import { OrderFulfillmentSagaOrchestrator, SagaStep, SagaContext } from './saga/order-saga';
import { PaymentStrategyResolver, CardPaymentStrategy, MobileWalletPaymentStrategy, BankTransferPaymentStrategy } from './strategy/payment-strategy';
import { OrderAggregateBuilder } from './builder/order-builder';
import { SwiftBankingAdapter } from './adapter/legacy-banking.adapter';
import { SystemConfigurationManager } from './singleton/system-config.manager';
import { ConcreteUserFactory } from './factory/user-factory';
import { CacheAsideManager, MemoryCacheStore } from './caching/cache-aside.manager';
import { OrderSubject, OrderObserver } from './observer/order-observer';
import { IoTMessageBroker, TelemetryPayload } from './iot/iot-pubsub.broker';
import { PetroleumRAGPipeline } from './ai/rag-agent.pipeline';
import { GeoProximityService, PartnerLocation } from './geo/geo-proximity.service';
import { EnterpriseLoadBalancer } from './load-balancer/load-balancer';

describe('Enterprise Software Architecture & Design Patterns Suite', () => {
  describe('SAGA Pattern Orchestrator', () => {
    it('should successfully execute all forward steps in an order saga', async () => {
      const orchestrator = new OrderFulfillmentSagaOrchestrator();
      const executionLog: string[] = [];

      orchestrator.addStep({
        stepName: 'InventoryReservation',
        execute: async () => { executionLog.push('reserved'); },
        compensate: async () => { executionLog.push('unreserved'); },
      });

      orchestrator.addStep({
        stepName: 'PaymentAuthorization',
        execute: async () => { executionLog.push('paid'); },
        compensate: async () => { executionLog.push('refunded'); },
      });

      const initialContext: SagaContext = {
        orderId: 101,
        customerId: 1,
        productId: 5,
        quantity: 10,
        unitPrice: 120,
        totalAmount: 1200,
        deliveryAddress: 'Terminal 4, Port',
        paymentMethod: 'card',
        status: 'PENDING',
      };

      const result = await orchestrator.execute(initialContext);
      expect(result.status).toBe('SUCCESS');
      expect(executionLog).toEqual(['reserved', 'paid']);
    });

    it('should trigger compensating rollback steps in reverse order when a step fails', async () => {
      const orchestrator = new OrderFulfillmentSagaOrchestrator();
      const executionLog: string[] = [];

      orchestrator.addStep({
        stepName: 'InventoryReservation',
        execute: async () => { executionLog.push('reserved'); },
        compensate: async () => { executionLog.push('unreserved'); },
      });

      orchestrator.addStep({
        stepName: 'DepotAssignment',
        execute: async () => {
          executionLog.push('depot_failed');
          throw new Error('Depot capacity exhausted');
        },
        compensate: async () => { executionLog.push('depot_released'); },
      });

      const initialContext: SagaContext = {
        orderId: 102,
        customerId: 2,
        productId: 3,
        quantity: 50,
        unitPrice: 100,
        totalAmount: 5000,
        deliveryAddress: 'Sector 7, Depot',
        paymentMethod: 'bank',
        status: 'PENDING',
      };

      await expect(orchestrator.execute(initialContext)).rejects.toThrow('Depot capacity exhausted');
      expect(executionLog).toContain('unreserved');
    });
  });

  describe('Strategy Pattern (Payment Resolution)', () => {
    let resolver: PaymentStrategyResolver;

    beforeEach(() => {
      resolver = new PaymentStrategyResolver();
    });

    it('should resolve CardPaymentStrategy and process successfully', async () => {
      const strategy = resolver.resolve('card');
      expect(strategy).toBeInstanceOf(CardPaymentStrategy);
      const res = await strategy.pay(5000, { paymentMethod: 'card', cardType: 'Visa' });
      expect(res.success).toBe(true);
      expect(res.transactionId).toBeDefined();
    });

    it('should resolve MobileWalletPaymentStrategy and process successfully', async () => {
      const strategy = resolver.resolve('mobile');
      expect(strategy).toBeInstanceOf(MobileWalletPaymentStrategy);
      const res = await strategy.pay(2500, { paymentMethod: 'mobile' });
      expect(res.success).toBe(true);
      expect(res.message).toContain('Mobile wallet');
    });

    it('should resolve BankTransferPaymentStrategy and process successfully', async () => {
      const strategy = resolver.resolve('bank');
      expect(strategy).toBeInstanceOf(BankTransferPaymentStrategy);
      const res = await strategy.pay(15000, { paymentMethod: 'bank' });
      expect(res.success).toBe(true);
      expect(res.message).toContain('Bank electronic wire transfer');
    });

    it('should fallback to default card strategy on unknown method', () => {
      const strategy = resolver.resolve('crypto');
      expect(strategy).toBeInstanceOf(CardPaymentStrategy);
    });
  });

  describe('Builder Pattern (Order Aggregate Builder)', () => {
    it('should build a validated order aggregate request', () => {
      const builder = new OrderAggregateBuilder();
      const order = builder
        .setCustomer({ id: 42, email: 'client@petroleum.com', username: 'client' } as any)
        .setProduct({ id: 10, name: 'Octane 95', price: 130 } as any)
        .setQuantity(2500)
        .setPayment({ amount: 325000, paymentMethod: 'card' })
        .setDeliveryAddress('Chittagong Central Terminal')
        .build();

      expect(order.customer.id).toBe(42);
      expect(order.product?.name).toBe('Octane 95');
      expect(order.quantity).toBe(2500);
      expect(order.deliveryAddress).toBe('Chittagong Central Terminal');
    });

    it('should throw validation error when required customer is missing', () => {
      const builder = new OrderAggregateBuilder();
      expect(() => builder.build()).toThrow('Order creation requires a valid customer entity.');
    });
  });

  describe('Adapter Pattern (Swift Banking Adapter)', () => {
    it('should adapt modern payment requests to legacy ISO-20022 swift payload', () => {
      const adapter = new SwiftBankingAdapter();
      const result = adapter.adapt({
        acc_no: 'ACC-998877',
        bank_code: 'SWIFT-BGD-DHAKA',
        trx_val: 50000,
        routing_id: 'ROUT-12345',
      });
      expect(result.accountId).toBe('ACC-998877');
      expect(result.institutionCode).toBe('SWIFT-BGD-DHAKA');
      expect(result.amount).toBe(50000);
      expect(result.referenceId).toBe('ROUT-12345');
    });
  });

  describe('Singleton Pattern (System Configuration Manager)', () => {
    it('should maintain a single global instance across multiple calls', () => {
      const instance1 = SystemConfigurationManager.getInstance();
      const instance2 = SystemConfigurationManager.getInstance();
      expect(instance1).toBe(instance2);
      expect(instance1.getConfig().defaultCurrency).toBe('USD');
      expect(instance1.getConfig().vatRate).toBe(0.05);
    });
  });

  describe('Factory Method Pattern (Concrete User Factory)', () => {
    it('should manufacture customer profiles with default Customer roles', () => {
      const factory = new ConcreteUserFactory();
      const customer = factory.createUser({
        role: 'customer',
        email: 'customer@test.com',
        userName: 'eashan_cust',
      });
      expect(customer.role).toBe('customer');
      expect(customer.isActive).toBe(true);
    });

    it('should manufacture supplier profiles', () => {
      const factory = new ConcreteUserFactory();
      const supplier = factory.createUser({
        role: 'supplier',
        email: 'supplier@refinery.com',
        userName: 'refinery_corp',
      });
      expect(supplier.role).toBe('supplier');
      expect(supplier.isActive).toBe(true);
    });
  });

  describe('Cache-Aside Performance Manager', () => {
    it('should fetch from source on cache miss and serve from memory on hit', async () => {
      const store = new MemoryCacheStore<{ fuelPrice: number }>();
      const cache = new CacheAsideManager(store, 10);
      let dbFetchCount = 0;

      const fetchFn = async () => {
        dbFetchCount++;
        return { fuelPrice: 130 };
      };

      const firstCall = await cache.getOrFetch('fuel:octane:price', fetchFn, 10);
      expect(firstCall.fuelPrice).toBe(130);
      expect(dbFetchCount).toBe(1);

      const secondCall = await cache.getOrFetch('fuel:octane:price', fetchFn, 10);
      expect(secondCall.fuelPrice).toBe(130);
      expect(dbFetchCount).toBe(1);
    });
  });

  describe('Observer Pattern (Order Dispatch & Events)', () => {
    it('should notify all attached observers on order event broadcast', async () => {
      const subject = new OrderSubject();
      const eventsReceived: string[] = [];

      const mockObserver: OrderObserver = {
        observerName: 'MockTracker',
        onOrderEvent: async (event, payload) => {
          eventsReceived.push(`${event}:${payload.orderId}`);
        },
      };

      subject.attach(mockObserver);
      await subject.notify('CONFIRMED', {
        orderId: 777,
        productName: 'Diesel',
        quantity: 1000,
        totalAmount: 110000,
        status: 'confirmed',
        timestamp: new Date(),
      });

      expect(eventsReceived).toContain('CONFIRMED:777');
    });
  });

  describe('IoT Pub/Sub Broker', () => {
    it('should stream tanker telemetry metrics and publish to subscribed channels', async () => {
      const broker = new IoTMessageBroker();
      const topic = 'tanker/telemetry/TRK-001';
      let receivedPayload: TelemetryPayload | null = null;

      broker.subscribe(topic, (_topic, telemetry) => {
        receivedPayload = telemetry;
      });

      await broker.publish(topic, {
        sensorId: 'SNS-99',
        tankerId: 'TRK-001',
        fuelTemperatureCelsius: 24.5,
        pressureBar: 2.2,
        flowRateLitersPerMin: 150,
        gpsCoordinates: { lat: 23.8103, lng: 90.4125 },
        timestamp: new Date().toISOString(),
      });

      expect(receivedPayload).not.toBeNull();
      expect((receivedPayload as any).tankerId).toBe('TRK-001');
      expect((receivedPayload as any).pressureBar).toBe(2.2);
    });
  });

  describe('Petroleum RAG Agent Pipeline', () => {
    it('should retrieve accurate technical petroleum guidelines for domain queries', async () => {
      const ragAgent = new PetroleumRAGPipeline();
      const docs = await ragAgent.retrieveRelevantContext('What is the flash point and cetane of diesel?');
      expect(docs.length).toBeGreaterThan(0);
      expect(docs[0].category).toBe('Fuel Specification');

      const response = await ragAgent.runAgenticInference('What is the flash point of diesel?');
      expect(response.answer).toBeDefined();
      expect(response.retrievedDocs.length).toBeGreaterThan(0);
    });
  });

  describe('Geo-Proximity Supplier & Dealer Detection Algorithm', () => {
    it('should accurately calculate Haversine distance between two coordinates', () => {
      const customer = { latitude: 23.8103, longitude: 90.4125 };
      const supplier = { latitude: 23.8214, longitude: 90.4273 };
      const distance = GeoProximityService.calculateHaversineDistanceKm(customer, supplier);
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(5);
    });

    it('should find and sort nearby suppliers and dealers within radius in ascending distance', () => {
      const customer = { latitude: 23.8103, longitude: 90.4125 };
      const partners: PartnerLocation[] = [
        {
          id: 1,
          name: 'Chittagong Deep-Sea Depot',
          role: 'Supplier',
          email: 'ctg@refinery.com',
          address: 'Chittagong Port',
          coordinates: { latitude: 22.3569, longitude: 91.7832 },
        },
        {
          id: 2,
          name: 'Kuratoli Regional Dealer',
          role: 'Dealer',
          email: 'dealer@dhaka.com',
          address: 'Kuratoli, Dhaka',
          coordinates: { latitude: 23.8214, longitude: 90.4273 },
        },
        {
          id: 3,
          name: 'Gulshan Distribution Hub',
          role: 'Dealer',
          email: 'gulshan@hub.com',
          address: 'Gulshan 2, Dhaka',
          coordinates: { latitude: 23.7925, longitude: 90.4078 },
        },
      ];

      const nearby = GeoProximityService.findNearbyPartners(customer, partners, 50);
      expect(nearby.length).toBe(2);
      expect(nearby[0].name).toBe('Kuratoli Regional Dealer');
      expect(nearby[0].distanceKm).toBeLessThan(nearby[1].distanceKm!);
      expect(nearby[0].estimatedTransitMinutes).toBeDefined();
    });

    it('should detect and rank nearby refinery suppliers for wholesale dealer procurement', () => {
      const dealerDepot = { latitude: 23.8214, longitude: 90.4273 };
      const suppliers: PartnerLocation[] = [
        {
          id: 1,
          name: 'Ashuganj Energy Port Supplier',
          role: 'Supplier',
          email: 'ashuganj@refinery.com',
          address: 'Ashuganj Port',
          coordinates: { latitude: 24.0321, longitude: 91.0021 },
        },
        {
          id: 2,
          name: 'Kuratoli Central Supplier',
          role: 'Supplier',
          email: 'kuratoli@refinery.com',
          address: 'Kuratoli, Dhaka',
          coordinates: { latitude: 23.8210, longitude: 90.4270 },
        },
      ];

      const nearbySuppliers = GeoProximityService.findNearbyPartners(dealerDepot, suppliers, 100);
      expect(nearbySuppliers.length).toBe(2);
      expect(nearbySuppliers[0].name).toBe('Kuratoli Central Supplier');
      expect(nearbySuppliers[0].distanceKm).toBeLessThan(1);
    });
  });

  describe('Enterprise Load Balancer Pattern', () => {
    it('should balance requests evenly using Round Robin strategy', () => {
      const balancer = new EnterpriseLoadBalancer('ROUND_ROBIN', [
        { id: 'node-1', url: 'https://backend-1.oilsupply.internal', weight: 1, healthy: true, activeConnections: 5, latencyMs: 20 },
        { id: 'node-2', url: 'https://backend-2.oilsupply.internal', weight: 1, healthy: true, activeConnections: 10, latencyMs: 30 },
      ]);

      const first = balancer.selectNode();
      const second = balancer.selectNode();
      const third = balancer.selectNode();

      expect(first.id).toBe('node-1');
      expect(second.id).toBe('node-2');
      expect(third.id).toBe('node-1');
    });

    it('should route requests to the node with Least Connections', () => {
      const balancer = new EnterpriseLoadBalancer('LEAST_CONNECTIONS', [
        { id: 'node-busy', url: 'https://backend-busy.oilsupply.internal', weight: 1, healthy: true, activeConnections: 45, latencyMs: 40 },
        { id: 'node-idle', url: 'https://backend-idle.oilsupply.internal', weight: 1, healthy: true, activeConnections: 2, latencyMs: 15 },
      ]);

      const selected = balancer.selectNode();
      expect(selected.id).toBe('node-idle');
    });

    it('should dynamically exclude unhealthy nodes from pool', () => {
      const balancer = new EnterpriseLoadBalancer('ROUND_ROBIN', [
        { id: 'node-1', url: 'https://backend-1.oilsupply.internal', weight: 1, healthy: true, activeConnections: 0, latencyMs: 20 },
        { id: 'node-2', url: 'https://backend-2.oilsupply.internal', weight: 1, healthy: true, activeConnections: 0, latencyMs: 20 },
      ]);

      balancer.setNodeHealth('node-1', false);
      const selected = balancer.selectNode();
      expect(selected.id).toBe('node-2');
    });

    it('should route same client IP deterministically using IP Hash', () => {
      const balancer = new EnterpriseLoadBalancer('IP_HASH', [
        { id: 'node-1', url: 'https://backend-1.oilsupply.internal', weight: 1, healthy: true, activeConnections: 0, latencyMs: 20 },
        { id: 'node-2', url: 'https://backend-2.oilsupply.internal', weight: 1, healthy: true, activeConnections: 0, latencyMs: 20 },
      ]);

      const firstPick = balancer.selectNode('192.168.1.100');
      const secondPick = balancer.selectNode('192.168.1.100');
      expect(firstPick.id).toBe(secondPick.id);
    });
  });
});
