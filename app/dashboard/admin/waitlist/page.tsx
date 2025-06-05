import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../../auth/auth.config';
import { PrismaClient } from '@/app/generated/prisma';
import WaitlistAdminClient from './WaitlistAdminClient';

const prisma = new PrismaClient();

export default async function WaitlistAdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/auth/login');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isAdmin: true },
  });

  if (!user?.isAdmin) {
    console.log('User is not an admin');
    redirect('/dashboard');
  }

  return <WaitlistAdminClient />;
} 