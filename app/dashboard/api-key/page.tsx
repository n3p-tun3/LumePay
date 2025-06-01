import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../api/auth/[...nextauth]/route";
// import { PrismaClient } from "../../../generated/prisma";
import { PrismaClient } from "@/app/generated/prisma";
import ApiKeyManager from "./ApiKeyManager";

const prisma = new PrismaClient();

export default async function ApiKeyPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      apiKeys: {
        orderBy: { createdAt: 'desc' },
        take: 1, // Get only the most recent key for now
        select: {
          id: true,
          name: true,
          key: true,
          remainingCredits: true,
          enabled: true,
          rateLimitEnabled: true,
          rateLimitMax: true,
          lastUsedAt: true,
          createdAt: true,
          updatedAt: true
        }
      }
    }
  });

  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">API Key Management</h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your API Key</h2>
          <p className="text-gray-800 mb-6">
            Use this API key to authenticate your payment verification requests. 
            Each verification costs 1 credit. Keep your API key secure and never share it publicly.
          </p>
          
          <ApiKeyManager initialApiKey={user.apiKeys[0]} />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">API Usage Guide</h2>
          <div className="prose max-w-none">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication</h3>
            <p className="mb-4 text-gray-800">
              Include your API key in the <code className="bg-gray-100 px-2 py-1 rounded text-gray-900">x-api-key</code> header with every request:
            </p>
            <pre className="bg-gray-50 p-4 rounded-lg mb-6 overflow-x-auto text-gray-900">
              {`curl -X POST https://your-domain.com/api/payments/intent/[intentId] \\
  -H "x-api-key: your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"transactionId": "your_transaction_id"}'`}
            </pre>

            <h3 className="text-lg font-medium text-gray-900 mb-2">Rate Limits</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-800">
              <li>Default rate limit: 1,000 requests per day</li>
              <li>Each verification costs 1 credit</li>
              <li>When credits run out, you'll need to purchase more</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 mb-2">Response Codes</h3>
            <ul className="list-disc pl-6 text-gray-800">
              <li><code className="bg-gray-100 px-2 py-1 rounded text-gray-900">401</code> - Invalid or missing API key</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded text-gray-900">402</code> - Insufficient credits</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded text-gray-900">429</code> - Rate limit exceeded</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 