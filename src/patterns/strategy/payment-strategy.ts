export interface PaymentStrategy {
  readonly name: string;
  pay(amount: number, details: PaymentContextDetails): Promise<PaymentResult>;
}

export interface PaymentContextDetails {
  paymentMethod: string;
  cardType?: string;
  paymentReference?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  gatewayStatus: string;
  message: string;
}

export class CardPaymentStrategy implements PaymentStrategy {
  readonly name = 'card';

  async pay(amount: number, details: PaymentContextDetails): Promise<PaymentResult> {
    const ref = details.paymentReference || `CARD-TXN-${Date.now()}`;
    return {
      success: true,
      transactionId: ref,
      gatewayStatus: 'completed',
      message: `Card payment of $${amount.toFixed(2)} (${details.cardType || 'Visa'}) processed successfully.`,
    };
  }
}

export class MobileWalletPaymentStrategy implements PaymentStrategy {
  readonly name = 'mobile';

  async pay(amount: number, details: PaymentContextDetails): Promise<PaymentResult> {
    const ref = details.paymentReference || `MFS-TXN-${Date.now()}`;
    return {
      success: true,
      transactionId: ref,
      gatewayStatus: 'completed',
      message: `Mobile wallet payment of $${amount.toFixed(2)} processed successfully.`,
    };
  }
}

export class BankTransferPaymentStrategy implements PaymentStrategy {
  readonly name = 'bank';

  async pay(amount: number, details: PaymentContextDetails): Promise<PaymentResult> {
    const ref = details.paymentReference || `BANK-TXN-${Date.now()}`;
    return {
      success: true,
      transactionId: ref,
      gatewayStatus: 'completed',
      message: `Bank electronic wire transfer of $${amount.toFixed(2)} authorized successfully.`,
    };
  }
}

export class PaymentStrategyResolver {
  private strategies: Map<string, PaymentStrategy> = new Map();

  constructor() {
    this.register(new CardPaymentStrategy());
    this.register(new MobileWalletPaymentStrategy());
    this.register(new BankTransferPaymentStrategy());
  }

  register(strategy: PaymentStrategy): void {
    this.strategies.set(strategy.name.toLowerCase(), strategy);
  }

  resolve(method?: string): PaymentStrategy {
    const key = (method || 'card').toLowerCase();
    const strategy = this.strategies.get(key) || this.strategies.get('card');
    if (!strategy) {
      throw new Error(`Unsupported payment method: ${method}`);
    }
    return strategy;
  }
}
