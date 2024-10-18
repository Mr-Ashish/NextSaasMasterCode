'use client';

import SideNav from '@/app/ui/dashboard/sidenav';
import { SubscriptionProvider } from '@/app/lib/subscriptionContext';
import Footer from '../ui/dashboard/footer';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-screen flex-col md:flex-row md:overflow-hidden">
      <SubscriptionProvider>
        <div className="w-full flex-none md:w-16">
          <SideNav />
        </div>
        <div className="flex-grow p-6 pb-16 md:overflow-y-auto md:p-12 md:pb-16">
          {' '}
          {/* Added pb-16 to prevent overlap */}
          {children}
        </div>
      </SubscriptionProvider>
      <Footer /> {/* Include the Footer component */}
    </div>
  );
}
