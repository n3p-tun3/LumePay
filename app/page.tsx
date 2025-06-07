import Link from 'next/link';

export default function HomePage() {
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

      {/* Hero section */}
      <div className="relative isolate overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
            <div className="mt-24 sm:mt-32 lg:mt-16">
              <a href="#" className="inline-flex space-x-6">
                <span className="rounded-full bg-blue-600/10 px-3 py-1 text-sm font-semibold leading-6 text-blue-600 ring-1 ring-inset ring-blue-600/10">
                  What's new
                </span>
                <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-gray-600">
                  <span>Just shipped v1.0</span>
                </span>
              </a>
            </div>
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Simplify Your Payment Verification
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Lume Pay provides a simple and secure way to verify bank payments. 
              Integrate our API into your application and start accepting payments with confidence.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Link
                href="/auth/login"
                className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Sign in
              </Link>
              <Link href="/auth/register" className="text-sm font-semibold leading-6 text-gray-900">
                Create an account <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
            <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
              <div className="rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                <img
                  src="/dashboard-preview.png"
                  alt="App screenshot"
                  width={2432}
                  height={1442}
                  className="w-[76rem] rounded-md shadow-2xl ring-1 ring-gray-900/10"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-56 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Faster Payments</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to verify payments
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Our API makes it easy to verify bank payments. Get started in minutes with our simple integration.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <feature.icon className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* How It Works section */}
      <div className="mx-auto mt-32 max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Simple Process</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            How Lume Pay Works
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Get started with Lume Pay in three simple steps. Our intuitive process makes payment verification effortless.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.name} className="relative flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5">
                <div className="absolute -top-4 -left-4 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
                  {index + 1}
                </div>
                <step.icon className="h-12 w-12 text-blue-600 mt-4" aria-hidden="true" />
                <h3 className="mt-6 text-lg font-semibold leading-8 text-gray-900">{step.name}</h3>
                <p className="mt-2 text-base leading-7 text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Beta Waitlist Benefits */}
      <div className="mx-auto mt-32 max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Exclusive Access</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Join Our Beta Waitlist
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Be among the first to experience Lume Pay with exclusive benefits and early access to new features.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <div key={benefit.name} className="flex flex-col p-6 bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5">
                <benefit.icon className="h-8 w-8 text-blue-600" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-semibold leading-8 text-gray-900">{benefit.name}</h3>
                <p className="mt-2 text-base leading-7 text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      {/*<div className="mx-auto mt-32 max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Trusted by Developers</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Built for Reliability
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.name} className="mx-auto flex max-w-xs flex-col gap-y-4">
                <dt className="text-base leading-7 text-gray-600">{stat.name}</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>*/}

      {/* FAQ Section */}
      <div className="mx-auto mt-32 max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Frequently Asked Questions</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to know
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Can't find the answer you're looking for? Reach out to our{' '}
            <Link href="/docs" className="font-semibold text-blue-600 hover:text-blue-500">
              support team
            </Link>
            .
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl divide-y divide-gray-900/10">
          {faqs.map((faq) => (
            <div key={faq.question} className="py-6">
              <h3 className="text-lg font-semibold leading-7 text-gray-900">{faq.question}</h3>
              <p className="mt-2 text-base leading-7 text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA section */}
      <div className="mt-32 sm:mt-56">
        <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Start accepting payments today
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
            Join thousands of businesses that trust Lume Pay for their payment verification needs.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/auth/register"
              className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Get started
            </Link>
            <Link href="/docs" className="text-sm font-semibold leading-6 text-white">
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
          <svg
            viewBox="0 0 1024 1024"
            className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
            aria-hidden="true"
          >
            <circle cx={512} cy={512} r={512} fill="url(#827591b1-ce8c-4110-b064-7cb85a0b1217)" fillOpacity="0.7" />
            <defs>
              <radialGradient id="827591b1-ce8c-4110-b064-7cb85a0b1217">
                <stop stopColor="#7775D6" />
                <stop offset={1} stopColor="#E935C1" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    name: 'Simple Integration',
    description: 'Integrate our API into your application with just a few lines of code.',
    icon: function CodeBracketIcon(props: any) {
      return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      );
    },
  },
  {
    name: 'Secure Verification',
    description: 'Our system verifies payments directly with banks, ensuring the highest level of security and accuracy.',
    icon: function ShieldCheckIcon(props: any) {
      return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      );
    },
  },
  {
    name: 'Real-time Updates',
    description: 'Get instant notifications when payments are verified. Our webhook system keeps you updated in real-time.',
    icon: function BoltIcon(props: any) {
      return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      );
    },
  },
];

const steps = [
  {
    name: 'Sign Up',
    description: 'Create your account and get your API keys. Our simple onboarding process takes just minutes.',
    icon: function UserPlusIcon(props: any) {
      return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
        </svg>
      );
    },
  },
  {
    name: 'Integrate',
    description: 'Add our SDK to your application with just a few lines of code.',
    icon: function CodeBracketIcon(props: any) {
      return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      );
    },
  },
  {
    name: 'Start Verifying',
    description: 'Begin accepting and verifying payments instantly. Our real-time system keeps you updated on every transaction.',
    icon: function CheckCircleIcon(props: any) {
      return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    },
  },
];

const benefits = [
  {
    name: 'Early Access',
    description: 'Be the first to try new features and provide feedback that shapes the future of Lume Pay.',
    icon: function RocketLaunchIcon(props: any) {
      return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
        </svg>
      );
    },
  },
  {
    name: 'Priority Support',
    description: 'Get dedicated support from our team and help shape the product with your feedback.',
    icon: function ChatBubbleLeftRightIcon(props: any) {
      return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
        </svg>
      );
    },
  },
  {
    name: 'Special Pricing',
    description: 'Enjoy exclusive beta pricing and be grandfathered into our best rates as we grow.',
    icon: function CurrencyDollarIcon(props: any) {
      return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    },
  },
];

const stats = [
  { name: 'API Response Time', value: '< 200ms' },
  { name: 'Uptime', value: '99.9%' },
  { name: 'Active Users', value: '1000+' },
];

const faqs = [
  {
    question: 'What is Lume Pay?',
    answer: 'Lume Pay is a payment verification service that helps businesses securely verify bank payments. Our API makes it easy to integrate payment verification into your application. Currently, we support CBE bank, with more banks coming soon.',
  },
  {
    question: 'How does the beta waitlist work?',
    answer: 'Join our waitlist to get early access to Lume Pay. We\'re gradually rolling out access to ensure the best experience for our users. You\'ll receive an email when it\'s your turn to join.',
  },
  {
    question: 'What programming languages do you support?',
    answer: 'Currently, we provide an npm package for JavaScript/TypeScript applications. While our REST API can be used with any language that supports HTTP requests, we recommend using our official npm package for the best developer experience. More language SDKs are coming soon!',
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes, we take security seriously. All data is encrypted in transit and at rest. We use industry-standard security practices and comply with relevant regulations.',
  },
  {
    question: 'How much does it cost?',
    answer: 'During the beta period, we offer special pricing for early adopters. Contact our sales team for detailed pricing information.',
  },
];
