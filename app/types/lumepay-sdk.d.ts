declare module 'lumepay-sdk' {
  export default class PaymentGateway {
    constructor(options: { apiKey: string; baseUrl?: string });
    createIntent(params: { amount: number; customerEmail: string; metadata?: any }): Promise<any>;
    getIntent(intentId: string): Promise<any>;
    submitPayment(params: { intentId: string; transactionId: string }): Promise<any>;
  }
} 