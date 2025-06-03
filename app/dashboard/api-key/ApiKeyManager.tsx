'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  remainingCredits: number;
  enabled: boolean;
  rateLimitEnabled: boolean;
  rateLimitMax: number;
  lastUsedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ApiKeyManagerProps {
  initialApiKey: ApiKey | undefined;
}

export default function ApiKeyManager({ initialApiKey }: ApiKeyManagerProps) {
  const [apiKey, setApiKey] = useState<ApiKey | undefined>(initialApiKey);
  const [isCreating, setIsCreating] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const createApiKey = async () => {
    try {
      setIsCreating(true);
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Default Key' })
      });

      if (!response.ok) {
        throw new Error('Failed to create API key');
      }

      const data = await response.json();
      setApiKey(data.apiKey);
      toast.success('API key created successfully');
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('Failed to create API key');
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!apiKey?.key) return;
    
    try {
      await navigator.clipboard.writeText(apiKey.key);
      toast.success('API key copied to clipboard');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Failed to copy API key');
    }
  };

  const toggleKeyVisibility = () => {
    setShowKey(!showKey);
  };

  if (!apiKey) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-800 mb-4">You don't have an API key yet.</p>
        <button
          onClick={createApiKey}
          disabled={isCreating}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? 'Creating...' : 'Create API Key'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">API Key</h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleKeyVisibility}
              className="text-sm font-medium text-gray-900 hover:text-gray-700"
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
            <button
              onClick={copyToClipboard}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Copy
            </button>
          </div>
        </div>
        <div className="font-mono text-sm bg-gray-50 p-4 rounded-lg border border-gray-200 break-all text-gray-900">
          {showKey ? apiKey.key : '•'.repeat(apiKey.key.length)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Credits</h3>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">{apiKey.remainingCredits}</span>
            <span className="text-base font-medium text-gray-700 ml-2">remaining</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Rate Limit</h3>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">{apiKey.rateLimitMax}</span>
            <span className="text-base font-medium text-gray-700 ml-2">requests/day</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Status</h3>
          <div className="flex items-center">
            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${apiKey.enabled ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-base font-medium text-gray-900">
              {apiKey.enabled ? 'Active' : 'Disabled'}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Last Used</h3>
          <div className="text-base font-medium text-gray-900">
            {apiKey.lastUsedAt 
              ? new Date(apiKey.lastUsedAt).toLocaleString()
              : 'Never'}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => setApiKey({ ...apiKey, enabled: !apiKey.enabled })}
          className={`flex-1 px-6 py-3 rounded-lg font-medium ${
            apiKey.enabled
              ? 'bg-red-50 text-red-800 hover:bg-red-100'
              : 'bg-green-50 text-green-800 hover:bg-green-100'
          }`}
        >
          {apiKey.enabled ? 'Disable Key' : 'Enable Key'}
        </button>
        <button
          onClick={createApiKey}
          disabled={isCreating}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? 'Creating...' : 'Regenerate Key'}
        </button>
      </div>
    </div>
  );
} 