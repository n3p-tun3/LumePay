'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import { Switch } from '@headlessui/react';
import { toast } from 'sonner';

interface WebhookSettings {
    enabled: boolean;
    url: string | null;
    secret: string | null;
    subscriptions: string[];
}

interface AvailableEvents {
    payment: string[];
    intent: string[];
    apiKey: string[];
    account: string[];
    system: string[];
}

function Switch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`${checked ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        >
            <span
                className={`${checked ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
        </button>
    );
}

export default function WebhookSettingsPage() {
    const router = useRouter();
    const [settings, setSettings] = useState<WebhookSettings | null>(null);
    const [availableEvents, setAvailableEvents] = useState<AvailableEvents | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [formData, setFormData] = useState({
        url: '',
        enabled: false,
        subscriptions: [] as string[]
    });

    // Fetch webhook settings
    useEffect(() => {
        async function fetchSettings() {
            try {
                const response = await fetch('/api/webhooks/config');
                if (!response.ok) throw new Error('Failed to fetch settings');

                const data = await response.json();
                setSettings(data.webhookSettings);
                setAvailableEvents(data.availableEvents);
                setFormData({
                    url: data.webhookSettings?.url || '',
                    enabled: data.webhookSettings?.enabled || false,
                    subscriptions: data.webhookSettings?.subscriptions || []
                });
            } catch (error) {
                console.error('Error fetching webhook settings:', error);
                toast.error('Failed to load webhook settings');
            } finally {
                setIsLoading(false);
            }
        }

        fetchSettings();
    }, []);

    // Save webhook settings
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/webhooks/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to save settings');
            }

            const data = await response.json();
            setSettings(data.webhookSettings);
            toast.success(data.message || 'Webhook settings saved');
            router.refresh();
        } catch (error: any) {
            console.error('Error saving webhook settings:', error);
            toast.error(error.message || 'Failed to save webhook settings');
        } finally {
            setIsSaving(false);
        }
    };

    // Test webhook
    const handleTest = async () => {
        setIsTesting(true);
        try {
            const response = await fetch('/api/webhooks/test', {
                method: 'POST'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to send test webhook');
            }

            const data = await response.json();
            toast.success(data.message || 'Test webhook sent successfully');
        } catch (error: any) {
            console.error('Error testing webhook:', error);
            toast.error(error.message || 'Failed to send test webhook');
        } finally {
            setIsTesting(false);
        }
    };

    // Toggle event subscription
    const toggleSubscription = (event: string) => {
        setFormData(prev => ({
            ...prev,
            subscriptions: prev.subscriptions.includes(event)
                ? prev.subscriptions.filter(e => e !== event)
                : [...prev.subscriptions, event]
        }));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">Webhook Settings</h1>
                <p className="text-gray-600">
                    Configure webhooks to receive real-time notifications about events in your account.
                </p>
            </div>

            <div className="bg-white shadow rounded-lg p-6 mb-8">
                {/* Enable/Disable Switch */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-medium">Enable Webhooks</h2>
                        <p className="text-sm text-gray-500">
                            Turn on webhooks to start receiving notifications
                        </p>
                    </div>
                    <Switch
                        checked={formData.enabled}
                        onChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
                    />
                   
            </div>

            {/* Webhook URL */}
            <div className="mb-6">
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                    Webhook URL
                </label>
                <input
                    type="url"
                    id="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://your-domain.com/webhook"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-600"
                    disabled={!formData.enabled}
                />
                <p className="mt-1 text-sm text-gray-500">
                    The URL where we'll send webhook notifications. Must be HTTPS in production.
                </p>
            </div>

            {/* Event Subscriptions */}
            {availableEvents && (
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-4">Event Subscriptions</h3>
                    <div className="space-y-4">
                        {Object.entries(availableEvents).map(([category, events]) => (
                            <div key={category} className="border rounded-lg p-4">
                                <h4 className="font-medium mb-2 capitalize">{category} Events</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {events.map((event) => (
                                        <label
                                            key={event}
                                            className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={formData.subscriptions.includes(event)}
                                                onChange={() => toggleSubscription(event)}
                                                disabled={!formData.enabled}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm">{event}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Secret Key */}
            {settings?.secret && (
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Webhook Secret
                    </label>
                    <div className="flex items-center space-x-2">
                        <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm font-mono">
                            {settings.secret}
                        </code>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(settings.secret!);
                                toast.success('Secret copied to clipboard');
                            }}
                            className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                            Copy
                        </button>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                        Use this secret to verify webhook signatures. Keep it secure!
                    </p>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4">
                <button
                    onClick={handleTest}
                    disabled={!formData.enabled || !formData.url || isTesting}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${!formData.enabled || !formData.url
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                        }`}
                >
                    {isTesting ? 'Testing...' : 'Test Webhook'}
                </button>
                <button
                    onClick={handleSave}
                    disabled={!formData.enabled || !formData.url || isSaving}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${!formData.enabled || !formData.url
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                >
                    {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </div>

      {/* Documentation Link */ }
    <div className="text-center">
        <a
            href="/docs/webhooks"
            className="text-blue-600 hover:text-blue-800 text-sm"
            target="_blank"
            rel="noopener noreferrer"
        >
            View Webhook Documentation →
        </a>
    </div>
    </div >
  );
}