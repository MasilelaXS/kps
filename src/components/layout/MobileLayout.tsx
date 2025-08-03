import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, NavbarBrand, NavbarContent, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { Settings, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { MobileBottomNav } from './MobileBottomNav';

interface MobileLayoutProps {
  children?: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  // Hide bottom nav during report creation flow
  const hideBottomNav = location.pathname.includes('/mobile/reports/create');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="h-dvh bg-gray-50 flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <Navbar 
        className="bg-white/70 backdrop-blur-sm border-b border-gray-100 shadow-sm flex-shrink-0"
        classNames={{
          wrapper: "max-w-full px-4 h-14"
        }}
      >
        <NavbarBrand className="justify-start">
          <div className="flex items-center gap-2">
            <img 
              src="/512.svg" 
              alt="KPS Logo" 
              className="w-8 h-8"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="font-semibold text-gray-900 text-sm">Portal</span>
          </div>
        </NavbarBrand>
        
        <NavbarContent justify="end">
          <Dropdown placement="bottom-end">
            <DropdownTrigger className='p-2'>
              <User className="w-8 h-8 text-gray-600" />
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="Profile Actions" 
              variant="flat"
            >
              <DropdownItem 
                key="profile" 
                className="h-12 gap-2 mb-1"
                textValue="Profile info"
              >
                <div className="flex flex-col">
                  <p className="text-xs text-gray-500">Signed in as</p>
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'PCO'}</p>
                </div>
              </DropdownItem>
              <DropdownItem 
                key="settings" 
                onClick={() => navigate('/mobile/profile')}
                className="rounded-lg"
                startContent={<Settings className="w-4 h-4 text-gray-600" />}
              >
                <span className="text-sm text-gray-700">Settings</span>
              </DropdownItem>
              <DropdownItem 
                key="logout" 
                color="danger" 
                onClick={handleLogout}
                className="rounded-lg"
                startContent={<LogOut className="w-4 h-4" />}
              >
                <span className="text-sm">Log Out</span>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
      </Navbar>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {children || <Outlet />}
        </div>
      </main>

      {/* Bottom Navigation - Hidden during report creation */}
      {!hideBottomNav && <MobileBottomNav />}
    </div>
  );
};
