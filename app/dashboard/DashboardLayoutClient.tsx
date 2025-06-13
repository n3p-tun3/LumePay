'use client';

import { HomeIcon, CreditCardIcon, KeyIcon, Cog6ToothIcon, Bars3Icon, XMarkIcon, UserGroupIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  userEmail: string;
}

export default function DashboardLayoutClient({
  children,
  userEmail,
}: DashboardLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/admin/check');
        const data = await response.json();
        setIsAdmin(data.isAdmin);
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };
    checkAdminStatus();
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Payments', href: '/dashboard/payments', icon: CreditCardIcon },
    { name: 'API Key', href: '/dashboard/api-key', icon: KeyIcon },
    { name: "Webhooks", href: "/dashboard/webhooks", icon: ArrowPathIcon },
    { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
    ...(isAdmin ? [{ name: 'Waitlist', href: '/dashboard/admin/waitlist', icon: UserGroupIcon }] : []),
  ];

  const UserSection = () => (
    <div className="p-4 border-t border-gray-200">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-sm font-medium text-blue-700">
              {userEmail[0].toUpperCase()}
            </span>
          </div>
        </div>
        <div className="ml-3 min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 truncate">
            {userEmail}
          </p>
          <button
            onClick={() => signOut()}
            className="text-xs text-gray-600 hover:text-gray-900"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-200 ease-in-out lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Mobile sidebar header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link href="/dashboard" className="text-xl font-bold text-blue-700">
              Lume Pay
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`w-5 h-5 mr-3 ${
                    isActive ? 'text-blue-700' : 'text-gray-600'
                  }`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Mobile user section */}
          <UserSection />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          {/* Desktop sidebar header */}
          <div className="flex items-center justify-center h-16 border-b border-gray-200">
            <Link href="/dashboard" className="text-xl font-bold text-blue-700">
              Lume Pay
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${
                    isActive ? 'text-blue-700' : 'text-gray-600'
                  }`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop user section */}
          <UserSection />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="sticky top-0 z-10 flex h-16 bg-white border-b border-gray-200 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 text-gray-500 hover:text-gray-600 hover:bg-gray-100"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <div className="flex items-center justify-center flex-1">
            <Link href="/dashboard" className="text-xl font-bold text-blue-700">
              Lume Pay
            </Link>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 