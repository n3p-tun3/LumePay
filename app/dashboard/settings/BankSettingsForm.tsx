'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface BankSettings {
  bankAccount?: string;
  bankName?: string;
}

interface BankSettingsFormProps {
  initialSettings: BankSettings | null;
}

export default function BankSettingsForm({ initialSettings }: BankSettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState<BankSettings>({
    bankAccount: initialSettings?.bankAccount || '',
    bankName: initialSettings?.bankName || 'CBE' // Default to CBE since it's the only supported bank
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate bank account number (CBE account numbers are typically 13 digits)
      if (!settings.bankAccount || !/^\d{13}$/.test(settings.bankAccount)) {
        throw new Error('Please enter a valid 13-digit CBE account number');
      }

      const response = await fetch('/api/settings/bank', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update bank settings');
      }

      toast.success('Bank settings updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update bank settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="bankAccount" className="block text-sm font-medium text-gray-900">
          Bank Account Number
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="bankAccount"
            name="bankAccount"
            value={settings.bankAccount}
            onChange={(e) => setSettings({ ...settings, bankAccount: e.target.value })}
            placeholder="Enter your 13-digit CBE account number"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            required
            pattern="\d{13}"
            title="Please enter a valid 13-digit account number"
          />
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Enter your 13-digit CBE account number. This will be used to verify incoming payments.
        </p>
      </div>

      <div>
        <label htmlFor="bankName" className="block text-sm font-medium text-gray-900">
          Bank Name
        </label>
        <div className="mt-1">
          <select
            id="bankName"
            name="bankName"
            value={settings.bankName}
            onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            disabled
          >
            <option value="CBE">Commercial Bank of Ethiopia (CBE)</option>
          </select>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Currently, we only support CBE bank accounts. More banks will be added soon.
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
} 