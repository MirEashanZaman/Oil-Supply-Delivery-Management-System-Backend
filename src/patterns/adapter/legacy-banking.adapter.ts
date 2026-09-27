export interface LegacyBankPayload {
  acc_no: string;
  bank_code: string;
  trx_val: number;
  routing_id: string;
}

export interface StandardPaymentGatewayRequest {
  accountId: string;
  institutionCode: string;
  amount: number;
  referenceId: string;
  timestamp: string;
}

export interface LegacyBankingAdapter {
  adapt(legacyPayload: LegacyBankPayload): StandardPaymentGatewayRequest;
}

export class SwiftBankingAdapter implements LegacyBankingAdapter {
  adapt(legacyPayload: LegacyBankPayload): StandardPaymentGatewayRequest {
    return {
      accountId: legacyPayload.acc_no,
      institutionCode: legacyPayload.bank_code || 'SWIFT-BACS',
      amount: Number(legacyPayload.trx_val) || 0,
      referenceId: legacyPayload.routing_id || `SWIFT-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
  }
}
