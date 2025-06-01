'use client';

import { useState } from 'react';
import PaymentGateway from 'lumepay-sdk';
import { toast } from 'sonner';

export default function TestSDKPage() {
  const [apiKey, setApiKey] = useState('default');
  const [amount, setAmount] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [intentId, setIntentId] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentIntent, setCurrentIntent] = useState<any>(null);

  // Initialize SDK with custom baseUrl
  const paymentGateway = new PaymentGateway({
    apiKey,
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  });

  const handleCreateIntent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!apiKey) throw new Error('API key is required');
      if (!amount) throw new Error('Amount is required');
      if (!customerEmail) throw new Error('Customer email is required');

      const intent = await paymentGateway.createIntent({
        amount: parseFloat(amount),
        customerEmail,
        metadata: { test: true }
      });

      setCurrentIntent(intent);
      setIntentId(intent.id);
      toast.success('Payment intent created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create payment intent');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetIntent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!apiKey) throw new Error('API key is required');
      if (!intentId) throw new Error('Intent ID is required');

      const intent = await paymentGateway.getIntent(intentId);
      setCurrentIntent(intent);
      toast.success('Intent details retrieved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to get intent details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!apiKey) throw new Error('API key is required');
      if (!intentId) throw new Error('Intent ID is required');
      if (!transactionId) throw new Error('Transaction ID is required');

      const result = await paymentGateway.submitPayment({
        intentId,
        transactionId
      });

      setCurrentIntent(result.intent);
      toast.success('Payment submitted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">SDK Test Page</h1>

        {/* API Key Input */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">API Key</h2>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        {/* Create Intent Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Payment Intent</h2>
          <form onSubmit={handleCreateIntent} className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-900">
                Amount (ETB)
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-900">
                Customer Email
              </label>
              <input
                type="email"
                id="customerEmail"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Enter customer email"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Intent'}
            </button>
          </form>
        </div>

        {/* Get Intent Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Get Intent Details</h2>
          <form onSubmit={handleGetIntent} className="space-y-4">
            <div>
              <label htmlFor="intentId" className="block text-sm font-medium text-gray-900">
                Intent ID
              </label>
              <input
                type="text"
                id="intentId"
                value={intentId}
                onChange={(e) => setIntentId(e.target.value)}
                placeholder="Enter intent ID"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Fetching...' : 'Get Intent'}
            </button>
          </form>
        </div>

        {/* Submit Payment Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Submit Payment</h2>
          <form onSubmit={handleSubmitPayment} className="space-y-4">
            <div>
              <label htmlFor="transactionId" className="block text-sm font-medium text-gray-900">
                Transaction ID
              </label>
              <input
                type="text"
                id="transactionId"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter transaction ID"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Submitting...' : 'Submit Payment'}
            </button>
          </form>
        </div>

        {/* Current Intent Details */}
        {currentIntent && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Intent Details</h2>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm text-gray-900">
              {JSON.stringify(currentIntent, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 