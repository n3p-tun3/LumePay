import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../auth/auth.config";
import DashboardLayoutClient from "./DashboardLayoutClient";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  return (
    <DashboardLayoutClient userEmail={session.user.email}>
      {children}
    </DashboardLayoutClient>
  );
} 