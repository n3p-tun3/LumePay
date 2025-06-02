import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../api/auth/auth.config";
import { PrismaClient } from "@/app/generated/prisma";
import BankSettingsForm from "./BankSettingsForm";
import NameSettingsForm from "./NameSettingsForm";

const prisma = new PrismaClient();

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      settings: true
    }
  });

  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
          <p className="text-gray-800 mb-6">
            Update your account information. Your name should match exactly with your CBE bank account for payment verification.
          </p>
          
          <NameSettingsForm initialName={user.name} />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Bank Account Details</h2>
          <p className="text-gray-800 mb-6">
            Configure your bank account details to receive payments. These details will be used to verify incoming payments.
            Currently, we only support CBE bank accounts.
          </p>
          
          <BankSettingsForm 
            initialSettings={user.settings as { bankAccount?: string; bankName?: string } | null} 
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Details</h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-700">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
} 