"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { CreditCardIcon, KeyIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface DashboardStats {
  totalPayments: number;
  successfulPayments: number;
  pendingPayments: number;
  apiKeyCredits: number;
}

interface RecentPayment {
  id: string;
  amount: number;
  status: string;
  customerEmail: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch stats
        const statsResponse = await fetch('/api/dashboard/stats');
        if (!statsResponse.ok) throw new Error('Failed to fetch stats');
        const statsData = await statsResponse.json();
        setStats(statsData);

        // Fetch recent payments
        const paymentsResponse = await fetch('/api/payments/intents?limit=5');
        if (!paymentsResponse.ok) throw new Error('Failed to fetch recent payments');
        const paymentsData = await paymentsResponse.json();
        setRecentPayments(paymentsData.intents);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back! Here's an overview of your payment activity.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Payments */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-50">
              <CreditCardIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Payments</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.totalPayments || 0}</p>
            </div>
          </div>
        </div>

        {/* Successful Payments */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-50">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Successful</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.successfulPayments || 0}</p>
            </div>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-50">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.pendingPayments || 0}</p>
            </div>
          </div>
        </div>

        {/* API Credits */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-50">
              <KeyIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">API Credits</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.apiKeyCredits || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Payments</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentPayments.length > 0 ? (
            recentPayments.map((payment) => (
              <div key={payment.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      ETB {payment.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">{payment.customerEmail}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                    <span className="text-sm text-gray-600">
                      {format(new Date(payment.createdAt), 'MMM d, HH:mm')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-4 text-center text-gray-600">
              No recent payments
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-200">
          <a
            href="/dashboard/payments"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            View all payments →
          </a>
        </div>
      </div>
    </div>
  );
} 