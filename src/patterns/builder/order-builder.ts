import { Product } from '../../product/product.entity';
import { CustomerEntity } from '../../customer/customer.entity';
import { Dealer } from '../../dealer/dealer.entity';
import { SupplierEntity } from '../../supplier/supplier.entity';
import { OrderEntity } from '../../order/order.entity';
import { OrderDetailsEntity } from '../../order/order-details.entity';
import { PaymentEntity } from '../../payment/payment.entity';
import { DeliveryEntity } from '../../delivery/delivery.entity';

export interface OrderCreationRequest {
  customer: CustomerEntity;
  product?: Product | null;
  dealer?: Dealer | null;
  supplier?: SupplierEntity | null;
  quantity: number;
  paymentDetails?: {
    amount?: number;
    paymentMethod?: string;
    cardType?: string;
    paymentReference?: string;
    status?: string;
  };
  discount?: number;
  deliveryAddress?: string;
  sourceType?: string;
  supplierId?: number;
  dealerId?: number;
}

export class OrderAggregateBuilder {
  private request: Partial<OrderCreationRequest> = {};

  setCustomer(customer: CustomerEntity): this {
    this.request.customer = customer;
    return this;
  }

  setProduct(product: Product | null): this {
    this.request.product = product;
    return this;
  }

  setSourcing(dealer: Dealer | null, supplier: SupplierEntity | null, supplierId?: number, dealerId?: number, sourceType?: string): this {
    this.request.dealer = dealer;
    this.request.supplier = supplier;
    this.request.supplierId = supplierId;
    this.request.dealerId = dealerId;
    this.request.sourceType = sourceType;
    return this;
  }

  setQuantity(qty: number): this {
    this.request.quantity = qty > 0 ? qty : 1;
    return this;
  }

  setPayment(paymentDetails?: OrderCreationRequest['paymentDetails']): this {
    this.request.paymentDetails = paymentDetails;
    return this;
  }

  setDiscount(discount: number): this {
    this.request.discount = discount >= 0 ? discount : 0;
    return this;
  }

  setDeliveryAddress(address?: string): this {
    this.request.deliveryAddress = address;
    return this;
  }

  build(): OrderCreationRequest {
    if (!this.request.customer) {
      throw new Error('Order creation requires a valid customer entity.');
    }
    return {
      customer: this.request.customer,
      product: this.request.product,
      dealer: this.request.dealer,
      supplier: this.request.supplier,
      quantity: this.request.quantity || 1,
      paymentDetails: this.request.paymentDetails,
      discount: this.request.discount || 0,
      deliveryAddress: this.request.deliveryAddress || this.request.customer.address || 'Standard Hub Depot',
      sourceType: this.request.sourceType,
      supplierId: this.request.supplierId,
      dealerId: this.request.dealerId,
    };
  }
}
