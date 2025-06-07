async submitPayment({ intentId, transactionId }) {
  if (!intentId || !transactionId) {
    throw new PaymentGatewayError('Intent ID and Transaction ID are required.');
  }

  const response = await this.http.post(`api/payment/intent/${intentId}/pay`, {
    transactionId,
  });
  return response;
}

async getAccountDetails() {
  const response = await this.http.get('api/user/settings');
  if (!response.settings?.bankDetails) {
    throw new PaymentGatewayError('Bank details not found. Please set up your bank details in the dashboard.');
  }
  return response.settings.bankDetails;
}

module.exports = PaymentGateway; 