import { Repository, DeepPartial } from 'typeorm';
import { CustomerEntity } from '../../customer/customer.entity';
import { Product } from '../../product/product.entity';
import { Dealer } from '../../dealer/dealer.entity';
import { SupplierEntity } from '../../supplier/supplier.entity';
import { OrderEntity } from '../../order/order.entity';
import { OrderDetailsEntity } from '../../order/order-details.entity';
import { PaymentEntity } from '../../payment/payment.entity';
import { DeliveryEntity } from '../../delivery/delivery.entity';
import { OrderAggregateBuilder } from '../builder/order-builder';
import { OrderFulfillmentSagaOrchestrator, SagaContext } from '../saga/order-saga';
import { PaymentStrategyResolver } from '../strategy/payment-strategy';
import { OrderSubject } from '../observer/order-observer';
import { BadRequestException, NotFoundException } from '@nestjs/common';

export interface PlaceOrderInput {
  customerId: number;
  productId?: number;
  dealerId?: number;
  supplierId?: number;
  quantity: number;
  paymentMethod?: string;
  cardType?: string;
  paymentReference?: string;
  amount?: number;
  discount?: number;
  deliveryAddress?: string;
  sourceType?: string;
}

export class OrderFulfillmentFacade {
  constructor(
    private customerRepo: Repository<CustomerEntity>,
    private productRepo: Repository<Product>,
    private dealerRepo: Repository<Dealer>,
    private supplierRepo: Repository<SupplierEntity>,
    private orderRepo: Repository<OrderEntity>,
    private orderDetailsRepo: Repository<OrderDetailsEntity>,
    private paymentRepo: Repository<PaymentEntity>,
    private deliveryRepo: Repository<DeliveryEntity>,
    private paymentStrategyResolver: PaymentStrategyResolver,
    private orderSubject: OrderSubject,
  ) {}

  async placeOrder(input: PlaceOrderInput): Promise<OrderEntity> {
    const customer = await this.customerRepo.findOneBy({ id: input.customerId });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    let product: Product | null = null;
    if (input.productId) {
      product = await this.productRepo.findOneBy({ id: input.productId });
      if (!product || !product.quantity || product.quantity <= 0) {
        throw new BadRequestException('Not enough stock');
      }
      const requestedQty = input.quantity || 1;
      if (product.quantity < requestedQty) {
        throw new BadRequestException('Not enough stock');
      }
      product.quantity = product.quantity - requestedQty;
      await this.productRepo.save(product);
    }

    let dealer: Dealer | null = null;
    if (input.dealerId) {
      dealer = await this.dealerRepo.findOneBy({ id: input.dealerId });
    }

    let supplier: SupplierEntity | null = null;
    if (input.supplierId) {
      supplier = await this.supplierRepo.findOneBy({ id: input.supplierId });
    }

    const resolvedSupplierId = supplier?.id ?? (input.supplierId ? Number(input.supplierId) : undefined);
    const resolvedDealerId = dealer?.id ?? (input.dealerId ? Number(input.dealerId) : undefined);

    const builder = new OrderAggregateBuilder();
    const orderRequest = builder
      .setCustomer(customer)
      .setProduct(product)
      .setSourcing(dealer, supplier, resolvedSupplierId, resolvedDealerId, input.sourceType)
      .setQuantity(input.quantity)
      .setDiscount(input.discount || 0)
      .setDeliveryAddress(input.deliveryAddress)
      .setPayment({
        amount: input.amount,
        paymentMethod: input.paymentMethod,
        cardType: input.cardType,
        paymentReference: input.paymentReference,
      })
      .build();

    const newOrder = this.orderRepo.create({
      quantity: orderRequest.quantity,
      sourceType: orderRequest.sourceType || (resolvedSupplierId ? 'supplier' : resolvedDealerId ? 'dealer' : 'customer'),
      supplierId: resolvedSupplierId,
      dealerId: resolvedDealerId,
      customer: customer,
      dealer: dealer || undefined,
      supplier: supplier || undefined,
      product: product || undefined,
      status: 'pending',
    } as DeepPartial<OrderEntity>);
    const savedOrder = await this.orderRepo.save(newOrder);

    const saga = new OrderFulfillmentSagaOrchestrator();
    saga.addStep({
      stepName: 'ProcessPaymentStrategyStep',
      execute: async (ctx: SagaContext) => {
        const strategy = this.paymentStrategyResolver.resolve(ctx.paymentMethod);
        const paymentResult = await strategy.pay(ctx.totalAmount, {
          paymentMethod: ctx.paymentMethod,
          cardType: ctx.cardType,
          paymentReference: ctx.paymentReference,
        });
        const payment = this.paymentRepo.create({
          amount: ctx.totalAmount,
          cardType: ctx.cardType,
          paymentMethod: strategy.name,
          paymentReference: ctx.paymentReference || paymentResult.transactionId,
          status: paymentResult.gatewayStatus || 'completed',
        });
        const savedPayment = await this.paymentRepo.save(payment);
        ctx.paymentId = savedPayment.id;
      },
      compensate: async (ctx: SagaContext) => {
        if (ctx.paymentId) {
          await this.paymentRepo.update(ctx.paymentId, { status: 'refunded' });
        }
      },
    });

    const sagaContext: SagaContext = {
      customerId: customer.id as number,
      productId: product ? (product.id as number) : 0,
      quantity: orderRequest.quantity,
      unitPrice: product ? Number(product.price) || 0 : 0,
      totalAmount: input.amount || (product ? Number(product.price) * orderRequest.quantity : 0),
      deliveryAddress: orderRequest.deliveryAddress || 'Default Address',
      paymentMethod: input.paymentMethod || 'card',
      cardType: input.cardType,
      paymentReference: input.paymentReference,
      status: 'PENDING',
    };

    try {
      await saga.execute(sagaContext);
    } catch (sagaErr) {
      if (product && input.quantity) {
        product.quantity = (product.quantity || 0) + input.quantity;
        await this.productRepo.save(product);
      }
      throw sagaErr;
    }

    const savedPayment = sagaContext.paymentId
      ? await this.paymentRepo.findOneBy({ id: sagaContext.paymentId })
      : null;

    const orderDetails = this.orderDetailsRepo.create({
      quantity: orderRequest.quantity,
      unitPrice: product ? product.price : 0,
      order: savedOrder,
      product: product || undefined,
      payment: savedPayment || undefined,
      discount: orderRequest.discount,
    } as DeepPartial<OrderDetailsEntity>);
    const savedOrderDetails = await this.orderDetailsRepo.save(orderDetails);

    const delivery = this.deliveryRepo.create({
      address: orderRequest.deliveryAddress,
      deliveryStatus: 'pending',
      orderDetails: savedOrderDetails,
    } as DeepPartial<DeliveryEntity>);
    await this.deliveryRepo.save(delivery);

    await this.orderSubject.notify('CREATED', {
      orderId: savedOrder.id as number,
      productName: product?.name || 'Petroleum Product',
      quantity: savedOrder.quantity || 1,
      totalAmount: sagaContext.totalAmount,
      status: savedOrder.status || 'pending',
      customerEmail: customer.email,
      timestamp: new Date(),
    });

    return savedOrder;
  }
}
