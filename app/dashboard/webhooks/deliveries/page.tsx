 'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface WebhookDelivery {
  id: string;
  status: 'success' | 'failed';
  statusCode?: number;
  error?: string;
  attempts: number;
  createdAt: string;
  payment?: {
    amount: number;
    status: string;
    transactionId: string;
  };
}

export default function WebhookDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState<string | null>(null);

  // Fetch webhook deliveries
  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const response = await fetch('/api/webhooks/deliveries');
      if (!response.ok) throw new Error('Failed to fetch deliveries');
      
      const data = await response.json();
      setDeliveries(data.deliveries);
    } catch (error) {
      console.error('Error fetching webhook deliveries:', error);
      toast.error('Failed to load webhook deliveries');
    } finally {
      setIsLoading(false);
    }
  };

  // Retry failed webhook
  const handleRetry = async (deliveryId: string) => {
    setIsRetrying(deliveryId);
    try {
      const response = await fetch(`/api/webhooks/deliveries/${deliveryId}/retry`, {
        method: 'POST'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to retry webhook');
      }

      toast.success('Webhook retry initiated');
      // Refresh deliveries after a short delay
      setTimeout(fetchDeliveries, 1000);
    } catch (error: any) {
      console.error('Error retrying webhook:', error);
      toast.error(error.message || 'Failed to retry webhook');
    } finally {
      setIsRetrying(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Webhook Deliveries</h1>
        <p className="text-gray-600">
          View the history of webhook deliveries and their status.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attempts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Error
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(delivery.createdAt), 'MMM d, yyyy HH:mm:ss')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      delivery.status === 'success'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {delivery.status}
                      {delivery.statusCode && ` (${delivery.statusCode})`}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {delivery.payment ? (
                      <div>
                        <div className="font-medium">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'ETB'
                          }).format(delivery.payment.amount)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {delivery.payment.transactionId}
                        </div>
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {delivery.attempts}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {delivery.error || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {delivery.status === 'failed' && (
                      <button
                        onClick={() => handleRetry(delivery.id)}
                        disabled={isRetrying === delivery.id}
                        className={`text-blue-600 hover:text-blue-900 ${
                          isRetrying === delivery.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isRetrying === delivery.id ? 'Retrying...' : 'Retry'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {deliveries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No webhook deliveries found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Total Deliveries</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {deliveries.length}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Success Rate</h3>
          <p className="mt-2 text-3xl font-semibold text-green-600">
            {deliveries.length > 0
              ? `${Math.round(
                  (deliveries.filter(d => d.status === 'success').length / deliveries.length) * 100
                )}%`
              : '0%'}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Failed Deliveries</h3>
          <p className="mt-2 text-3xl font-semibold text-red-600">
            {deliveries.filter(d => d.status === 'failed').length}
          </p>
        </div>
      </div>
    </div>
  );
}