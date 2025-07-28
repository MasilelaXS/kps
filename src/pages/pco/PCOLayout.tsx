import React from 'react';
import { PCOBottomNav } from '../../components/pco/PCOBottomNav';

interface PCOLayoutProps {
  children: React.ReactNode;
}

export function PCOLayout({ children }: PCOLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content with bottom padding for navigation */}
      <main className="pb-20">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      <PCOBottomNav />
    </div>
  );
}
