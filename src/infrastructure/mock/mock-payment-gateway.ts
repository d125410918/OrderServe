export type PaymentRequest = {
  orderId: string;
  amount: number;
  idempotencyKey: string;
};

export type PaymentResult = {
  paymentId: string;
  orderId: string;
  amount: number;
  status: "paid";
  provider: "LINE Pay";
};

export class MockPaymentGateway {
  private readonly processed = new Map<string, PaymentResult>();

  get processedCount(): number {
    return this.processed.size;
  }

  async pay(request: PaymentRequest): Promise<PaymentResult> {
    const existing = this.processed.get(request.idempotencyKey);
    if (existing) return existing;
    await new Promise((resolve) => setTimeout(resolve, 120));
    const result: PaymentResult = {
      paymentId: `pay_${request.orderId}`,
      orderId: request.orderId,
      amount: request.amount,
      status: "paid",
      provider: "LINE Pay",
    };
    this.processed.set(request.idempotencyKey, result);
    return result;
  }
}
