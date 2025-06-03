'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    { id: 'getting-started', label: 'Getting Started' },
    { id: 'authentication', label: 'Authentication' },
    { id: 'payment-flow', label: 'Payment Flow' },
    { id: 'api-reference', label: 'API Reference' },
    { id: 'sdk', label: 'SDK' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold text-blue-700">Lume Pay</span>
              </Link>
            </div>
            <div className="flex items-center gap-x-4">
              <Link
                href="/auth/login"
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-600"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="rounded-md bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="sticky top-8">
              <ul className="space-y-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                        activeSection === section.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {section.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {activeSection === 'getting-started' && (
              <div className="prose prose-blue max-w-none">
                <h1>Getting Started</h1>
                <p>
                  Welcome to Lume Pay! This guide will help you integrate our payment verification service into your application.
                </p>

                <h2>Prerequisites</h2>
                <ul>
                  <li>Node.js 16.x or later</li>
                  <li>npm or yarn package manager</li>
                  <li>A Lume Pay account (you can <Link href="/auth/register">sign up here</Link>)</li>
                </ul>

                <h2>Installation</h2>
                <p>Install the Lume Pay SDK using npm:</p>
                <SyntaxHighlighter language="bash" style={tomorrow}>
                  {`npm install lumepay-sdk`}
                </SyntaxHighlighter>

                <h2>Quick Start</h2>
                <p>Here's a simple example of how to use the SDK:</p>
                <SyntaxHighlighter language="javascript" style={tomorrow}>
                  {`import PaymentGateway from 'lumepay-sdk';

// Initialize the SDK with your API key
const paymentGateway = new PaymentGateway({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.lumepay.com' // or your custom base URL
});

// Create a payment intent
const intent = await paymentGateway.createIntent({
  amount: 1000, // Amount in ETB
  customerEmail: 'customer@example.com',
  metadata: { orderId: '123' }
});

// Submit a payment
const result = await paymentGateway.submitPayment({
  intentId: intent.id,
  transactionId: 'CBE_TRANSACTION_ID'
});`}
                </SyntaxHighlighter>
              </div>
            )}

            {activeSection === 'authentication' && (
              <div className="prose prose-blue max-w-none">
                <h1>Authentication</h1>
                <p>
                  All API requests to Lume Pay must be authenticated using an API key. You can find your API keys in the dashboard after signing up.
                </p>

                <h2>API Keys</h2>
                <p>
                  API keys are used to authenticate your requests. Each key has a limited number of credits that are consumed with each API call.
                  You can create multiple API keys for different environments or applications.
                </p>

                <h2>Using API Keys</h2>
                <p>Include your API key in the Authorization header of your requests:</p>
                <SyntaxHighlighter language="javascript" style={tomorrow}>
                  {`// Using fetch
const response = await fetch('https://api.lumepay.com/api/payment/intent', {
  headers: {
    'Authorization': 'Bearer your-api-key',
    'Content-Type': 'application/json'
  },
  // ... other options
});

// Using the SDK
const paymentGateway = new PaymentGateway({
  apiKey: 'your-api-key'
});`}
                </SyntaxHighlighter>

                <h2>Security Best Practices</h2>
                <ul>
                  <li>Never expose your API keys in client-side code</li>
                  <li>Rotate your API keys periodically</li>
                  <li>Use different API keys for development and production</li>
                  <li>Monitor your API key usage in the dashboard</li>
                </ul>
              </div>
            )}

            {activeSection === 'payment-flow' && (
              <div className="prose prose-blue max-w-none">
                <h1>Payment Flow</h1>
                <p>
                  The Lume Pay payment flow consists of three main steps: creating a payment intent, customer payment, and payment verification.
                </p>

                <h2>1. Create Payment Intent</h2>
                <p>First, create a payment intent with the amount and customer details:</p>
                <SyntaxHighlighter language="javascript" style={tomorrow}>
                  {`const intent = await paymentGateway.createIntent({
  amount: 1000, // Amount in ETB
  customerEmail: 'customer@example.com',
  metadata: {
    orderId: '123',
    // Add any additional metadata
  }
});`}
                </SyntaxHighlighter>

                <h2>2. Customer Payment</h2>
                <p>
                  After creating the intent, the customer should make the payment through CBE bank using the provided bank details.
                  You can get the bank details from the intent response:
                </p>
                <SyntaxHighlighter language="javascript" style={tomorrow}>
                  {`// Get bank details from the intent
const { bankAccount, bankName, accountName } = intent;

// Display these details to the customer
console.log(\`Please send payment to:
Bank: \${bankName}
Account: \${bankAccount}
Name: \${accountName}\`);`}
                </SyntaxHighlighter>

                <h2>3. Payment Verification</h2>
                <p>
                  Once the customer has made the payment, submit the transaction ID for verification:
                </p>
                <SyntaxHighlighter language="javascript" style={tomorrow}>
                  {`const result = await paymentGateway.submitPayment({
  intentId: intent.id,
  transactionId: 'CBE_TRANSACTION_ID' // Get this from the customer
});

if (result.intent.status === 'verified') {
  // Payment verified successfully
  console.log('Payment verified!');
} else {
  // Payment verification failed or pending
  console.log('Payment status:', result.intent.status);
}`}
                </SyntaxHighlighter>

                <h2>Webhooks</h2>
                <p>
                  You can also receive real-time updates about payment status changes through webhooks.
                  Configure your webhook URL in the dashboard to receive these notifications.
                </p>
              </div>
            )}

            {activeSection === 'api-reference' && (
              <div className="prose prose-blue max-w-none">
                <h1>API Reference</h1>
                <p>
                  The Lume Pay API is RESTful and uses standard HTTP methods and status codes.
                  All requests should be made to the base URL: <code>https://api.lumepay.com</code>
                </p>

                <h2>Endpoints</h2>

                <h3>Create Payment Intent</h3>
                <SyntaxHighlighter language="bash" style={tomorrow}>
                  {`POST /api/payment/intent
Content-Type: application/json
Authorization: Bearer your-api-key

{
  "amount": 1000,
  "customerEmail": "customer@example.com",
  "metadata": {
    "orderId": "123"
  }
}`}
                </SyntaxHighlighter>

                <h3>Get Payment Intent</h3>
                <SyntaxHighlighter language="bash" style={tomorrow}>
                  {`GET /api/payment/intent/{intentId}
Authorization: Bearer your-api-key`}
                </SyntaxHighlighter>

                <h3>Submit Payment</h3>
                <SyntaxHighlighter language="bash" style={tomorrow}>
                  {`POST /api/payment/intent/{intentId}/pay
Content-Type: application/json
Authorization: Bearer your-api-key

{
  "transactionId": "CBE_TRANSACTION_ID"
}`}
                </SyntaxHighlighter>

                <h2>Response Codes</h2>
                <ul>
                  <li><code>200</code> - Success</li>
                  <li><code>400</code> - Bad Request</li>
                  <li><code>401</code> - Unauthorized</li>
                  <li><code>403</code> - Forbidden (insufficient credits)</li>
                  <li><code>404</code> - Not Found</li>
                  <li><code>429</code> - Too Many Requests</li>
                  <li><code>500</code> - Internal Server Error</li>
                </ul>
              </div>
            )}

            {activeSection === 'sdk' && (
              <div className="prose prose-blue max-w-none">
                <h1>SDK Reference</h1>
                <p>
                  The Lume Pay SDK provides a simple interface to interact with our API.
                  It handles authentication, request formatting, and response parsing.
                </p>

                <h2>Installation</h2>
                <SyntaxHighlighter language="bash" style={tomorrow}>
                  {`npm install lumepay-sdk
# or
yarn add lumepay-sdk`}
                </SyntaxHighlighter>

                <h2>Configuration</h2>
                <SyntaxHighlighter language="javascript" style={tomorrow}>
                  {`import PaymentGateway from 'lumepay-sdk';

const paymentGateway = new PaymentGateway({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.lumepay.com', // optional
  timeout: 30000 // optional, in milliseconds
});`}
                </SyntaxHighlighter>

                <h2>Methods</h2>

                <h3>createIntent(options)</h3>
                <p>Creates a new payment intent.</p>
                <SyntaxHighlighter language="javascript" style={tomorrow}>
                  {`const intent = await paymentGateway.createIntent({
  amount: number, // required, amount in ETB
  customerEmail: string, // required
  metadata?: object // optional
});`}
                </SyntaxHighlighter>

                <h3>getIntent(intentId)</h3>
                <p>Retrieves a payment intent by ID.</p>
                <SyntaxHighlighter language="javascript" style={tomorrow}>
                  {`const intent = await paymentGateway.getIntent('intent-id');`}
                </SyntaxHighlighter>

                <h3>submitPayment(options)</h3>
                <p>Submits a payment for verification.</p>
                <SyntaxHighlighter language="javascript" style={tomorrow}>
                  {`const result = await paymentGateway.submitPayment({
  intentId: string, // required
  transactionId: string // required
});`}
                </SyntaxHighlighter>

                <h2>Error Handling</h2>
                <SyntaxHighlighter language="javascript" style={tomorrow}>
                  {`try {
  const intent = await paymentGateway.createIntent({
    amount: 1000,
    customerEmail: 'customer@example.com'
  });
} catch (error) {
  if (error.code === 'INSUFFICIENT_CREDITS') {
    console.error('Not enough credits to create payment intent');
  } else if (error.code === 'INVALID_API_KEY') {
    console.error('Invalid API key');
  } else {
    console.error('An error occurred:', error.message);
  }
}`}
                </SyntaxHighlighter>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 