import React from 'react';
import { Outlet } from 'react-router-dom';

interface MobileReportLayoutProps {
  children?: React.ReactNode;
}

export const MobileReportLayout: React.FC<MobileReportLayoutProps> = ({ children }) => {
  return (
    <div className="h-dvh bg-gray-50 overflow-hidden">
      <div className="h-full overflow-y-auto">
        {children || <Outlet />}
      </div>
    </div>
  );
};
