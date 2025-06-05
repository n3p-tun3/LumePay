'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface WaitlistConfig {
  enabled: boolean;
  message: string;
}

export default function WaitlistConfig() {
  const [config, setConfig] = useState<WaitlistConfig>({
    enabled: true,
    message: 'We are currently in private beta. Join our waitlist to get early access!'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/waitlist/config');
      if (!response.ok) {
        throw new Error('Failed to fetch waitlist config');
      }
      const data = await response.json();
      setConfig(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch('/api/admin/waitlist/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Failed to update waitlist config');
      }

      toast.success('Waitlist configuration updated successfully');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Waitlist Configuration</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Enable Waitlist</span>
          </label>
          <p className="mt-1 text-sm text-gray-500">
            When enabled, users will be redirected to the waitlist page instead of registration.
          </p>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
            Waitlist Message
          </label>
          <textarea
            id="message"
            rows={4}
            value={config.message}
            onChange={(e) => setConfig({ ...config, message: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Enter the message shown to users on the waitlist page"
          />
          <p className="mt-1 text-sm text-gray-500">
            This message will be displayed to users on the waitlist page.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
} 