import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, User } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      key: 'home',
      path: '/mobile/dashboard',
      icon: Home,
      label: 'Home',
      badge: undefined,
    },
    {
      key: 'schedule',
      path: '/mobile/schedule',
      icon: Calendar,
      label: 'Schedule',
      badge: undefined,
    },
    {
      key: 'profile',
      path: '/mobile/profile',
      icon: User,
      label: 'Profile',
      badge: undefined,
    },
  ];

  const isActive = (path: string) => {
    if (path === '/mobile/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Don't show navigation during report creation workflow
  const hideNavigation = location.pathname.includes('/reports/new') || 
                         location.pathname.includes('/reports/edit') ||
                         location.pathname.includes('/change-password');

  if (hideNavigation) {
    return null;
  }

  return (
    <div className="flex-shrink-0 bg-white/80 backdrop-blur-md border-t border-gray-200/50 px-2 py-1 safe-area-inset-bottom">
      <div className="flex justify-around items-center max-w-sm mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.key}
              className={`relative flex flex-col items-center justify-center h-14 w-20 rounded-xl transition-all duration-200 ${
                active 
                  ? 'text-blue-600 bg-blue-50/80 shadow-sm scale-95' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50/50 active:scale-95'
              }`}
              onClick={() => navigate(item.path)}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.5} className="mb-1" />
              <span className={`text-xs leading-none ${active ? 'font-semibold' : 'font-normal'}`}>
                {item.label}
              </span>
              {active && (
                <div className="absolute bottom-1 w-6 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
