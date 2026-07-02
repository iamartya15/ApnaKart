export interface PaymentProvider {
  createSession(
    orderId: string,
    amount: number,
  ): Promise<{ sessionId: string; paymentUrl?: string; orderReference?: string }>;
  verifyWebhookSignature(rawBody: string, signature: string): Promise<boolean>;
  getName(): string;
}
export default PaymentProvider;
