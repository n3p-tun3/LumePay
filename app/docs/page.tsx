'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    { id: 'getting-started', label: 'Getting Started' },
    { id: 'payment-flow', label: 'Payment Flow' },
    { id: 'sdk', label: 'SDK Reference' },
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
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - now responsive */}
          <div className="w-full lg:w-64 flex-shrink-0">
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

          {/* Main content - updated and polished */}
          <div className="flex-1 min-w-0">
            <div className="prose prose-blue max-w-none prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-gray-600 prose-li:text-gray-600 prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
              {activeSection === 'getting-started' && (
                <>
                  <h1>Getting Started with Lume Pay</h1>
                  <p className="text-lg text-gray-700">
                    Welcome to Lume Pay! This guide will help you integrate our payment verification service into your application quickly and securely.
                  </p>

                  <h2>Prerequisites</h2>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <span className="mr-2">•</span>
                      <span>Node.js 16.x or later</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">•</span>
                      <span>npm or yarn package manager</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">•</span>
                      <span>A Lume Pay account (you can <Link href="/auth/register" className="text-blue-600 hover:text-blue-500">sign up here</Link>)</span>
                    </li>
                  </ul>

                  <h2>Installation</h2>
                  <p>Install the Lume Pay SDK using npm or yarn:</p>
                  <SyntaxHighlighter language="bash" style={tomorrow} className="rounded-lg">
                    {`npm install lumepay-sdk
# or
yarn add lumepay-sdk`}
                  </SyntaxHighlighter>

                  <h2>Quick Start</h2>
                  <p>Here's a simple example of how to use the SDK in your application:</p>
                  <SyntaxHighlighter language="javascript" style={tomorrow} className="rounded-lg">
                    {`import PaymentGateway from 'lumepay-sdk';

// Initialize the SDK with your API key
const paymentGateway = new PaymentGateway({
  apiKey: 'your-api-key', // Get this from your dashboard
  baseUrl: 'https://lumepay.pyrrho.dev' // Optional, defaults to this URL
});

// Create a payment intent
const intent = await paymentGateway.createIntent({
  amount: 1000, // Amount in ETB
  customerEmail: 'customer@example.com', // Required for payment tracking
  metadata: { orderId: '123' } // Optional, for your reference
});

// Get your bank details to share with the customer
const { bankAccount, bankName, accountName } = await paymentGateway.getAccountDetails();

// After customer makes the payment, submit for verification
const result = await paymentGateway.submitPayment({
  intentId: intent.id,
  transactionId: 'TRANSACTION_ID' // Get this from the customer
});`}
                  </SyntaxHighlighter>
                </>
              )}

              {activeSection === 'payment-flow' && (
                <>
                  <h1>Payment Flow</h1>
                  <p className="text-lg text-gray-700">
                    The Lume Pay payment flow is designed to be simple and secure. Here's how it works:
                  </p>

                  <div className="space-y-8">
                    <div>
                      <h2>1. Create Payment Intent</h2>
                      <p>Start by creating a payment intent with the amount and customer details:</p>
                      <SyntaxHighlighter language="javascript" style={tomorrow} className="rounded-lg">
                        {`const intent = await paymentGateway.createIntent({
  amount: 1000, // Required: Amount in ETB
  customerEmail: 'customer@example.com', // Required: For payment tracking
  metadata: { // Optional: For your reference
    orderId: '123',
    customerName: 'John Doe'
  }
});`}
                      </SyntaxHighlighter>
                      <div className="mt-2 text-sm text-gray-500">
                        The intent will expire after 24 hours if not paid.
                      </div>
                    </div>

                    <div>
                      <h2>2. Customer Payment</h2>
                      <p>
                        Share your bank details with the customer. They can make the payment through their bank:
                      </p>
                      <SyntaxHighlighter language="javascript" style={tomorrow} className="rounded-lg">
                        {`// Get your bank details from your dashboard settings
const { bankAccount, bankName, accountName } = await paymentGateway.getAccountDetails();

// Display these details to the customer
console.log(\`Please send payment to:
Bank: \${bankName}
Account: \${bankAccount}
Name: \${accountName}
Amount: \${intent.amount} ETB
Reference: \${intent.id}\`);`}
                      </SyntaxHighlighter>
                      <div className="mt-2 text-sm text-gray-500">
                        Make sure to include the intent ID as the payment reference for easier tracking.
                      </div>
                    </div>

                    <div>
                      <h2>3. Payment Verification</h2>
                      <p>
                        Once the customer has made the payment, submit the transaction ID for verification:
                      </p>
                      <SyntaxHighlighter language="javascript" style={tomorrow} className="rounded-lg">
                        {`const result = await paymentGateway.submitPayment({
  intentId: intent.id,
  transactionId: 'TRANSACTION_ID' // Get this from the customer
});

// Check the payment status
if (result.intent.status === 'verified') {
  // Payment verified successfully
  console.log('Payment verified!');
} else if (result.intent.status === 'pending') {
  // Payment is being verified
  console.log('Payment verification in progress...');
} else {
  // Payment verification failed
  console.log('Payment verification failed:', result.intent.status);
}`}
                      </SyntaxHighlighter>
                    </div>

                    <div>
                      <h2>Webhooks</h2>
                      <p>
                        For real-time updates, configure webhooks in your dashboard. You'll receive notifications for:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Payment verification status changes</li>
                        <li>Intent expiration</li>
                        <li>Error notifications</li>
                      </ul>
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                          💡 Tip: Always verify webhook signatures to ensure they're coming from Lume Pay.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeSection === 'sdk' && (
                <>
                  <h1>SDK Reference</h1>
                  <p className="text-lg text-gray-700">
                    The Lume Pay SDK provides a simple and secure way to integrate payment verification into your application.
                  </p>

                  <h2>Installation</h2>
                  <SyntaxHighlighter language="bash" style={tomorrow} className="rounded-lg">
                    {`npm install lumepay-sdk
# or
yarn add lumepay-sdk`}
                  </SyntaxHighlighter>

                  <h2>Configuration</h2>
                  <p>Initialize the SDK with your API key:</p>
                  <SyntaxHighlighter language="javascript" style={tomorrow} className="rounded-lg">
                    {`import PaymentGateway from 'lumepay-sdk';

const paymentGateway = new PaymentGateway({
  apiKey: 'your-api-key', // Required: Get this from your dashboard
  baseUrl: 'https://lumepay.pyrrho.dev' // Optional: Defaults to this URL
});`}
                  </SyntaxHighlighter>

                  <h2>Available Methods</h2>
                  
                  <div className="space-y-8">
                    <div>
                      <h3>createIntent(options)</h3>
                      <p>Creates a new payment intent.</p>
                      <SyntaxHighlighter language="javascript" style={tomorrow} className="rounded-lg">
                        {`const intent = await paymentGateway.createIntent({
  amount: number,      // Required: Amount in ETB
  customerEmail: string, // Required: For payment tracking
  metadata?: object    // Optional: For your reference
});`}
                      </SyntaxHighlighter>
                      <div className="mt-2 text-sm text-gray-500">
                        Returns a payment intent object with a unique ID and status.
                      </div>
                    </div>

                    <div>
                      <h3>getIntent(intentId)</h3>
                      <p>Retrieves a payment intent by ID.</p>
                      <SyntaxHighlighter language="javascript" style={tomorrow} className="rounded-lg">
                        {`const intent = await paymentGateway.getIntent('intent-id');`}
                      </SyntaxHighlighter>
                      <div className="mt-2 text-sm text-gray-500">
                        Use this to check the status of a payment intent.
                      </div>
                    </div>

                    <div>
                      <h3>submitPayment(options)</h3>
                      <p>Submits a payment for verification.</p>
                      <SyntaxHighlighter language="javascript" style={tomorrow} className="rounded-lg">
                        {`const result = await paymentGateway.submitPayment({
  intentId: string,      // Required: The payment intent ID
  transactionId: string  // Required: The bank transaction ID
});`}
                      </SyntaxHighlighter>
                      <div className="mt-2 text-sm text-gray-500">
                        Returns the updated payment intent with verification status.
                      </div>
                    </div>

                    <div>
                      <h3>getAccountDetails()</h3>
                      <p>Retrieves your bank account details.</p>
                      <SyntaxHighlighter language="javascript" style={tomorrow} className="rounded-lg">
                        {`const { bankAccount, bankName, accountName } = await paymentGateway.getAccountDetails();`}
                      </SyntaxHighlighter>
                      <div className="mt-2 text-sm text-gray-500">
                        Use this to get your bank details to share with customers.
                      </div>
                    </div>
                  </div>

                  <h2>Error Handling</h2>
                  <p>All methods throw a <code>PaymentGatewayError</code> when something goes wrong:</p>
                  <SyntaxHighlighter language="javascript" style={tomorrow} className="rounded-lg">
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
  } else if (error.code === 'BANK_DETAILS_NOT_FOUND') {
    console.error('Please set up your bank details in the dashboard');
  } else {
    console.error('An error occurred:', error.message);
  }
}`}
                  </SyntaxHighlighter>

                  <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900">Best Practices</h3>
                    <ul className="mt-2 space-y-2 text-sm text-blue-700">
                      <li>• Always handle errors appropriately in your application</li>
                      <li>• Store API keys securely and never expose them in client-side code</li>
                      <li>• Use webhooks for real-time payment status updates</li>
                      <li>• Include the intent ID as payment reference for easier tracking</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 