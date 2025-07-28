import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, FileText, Calendar, User } from 'lucide-react';

export function PCOBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { icon: Home, path: '/pco/dashboard', label: 'Home' },
    { icon: Users, path: '/pco/clients', label: 'Clients' },
    { icon: FileText, path: '/pco/reports', label: 'Reports' },
    { icon: Calendar, path: '/pco/schedule', label: 'Schedule' },
    { icon: User, path: '/pco/profile', label: 'Profile' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-bottom">
      <div className="flex items-center justify-around">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          
          return (
            <button
              key={index}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center p-2 min-w-0 flex-1 ${
                active ? 'text-purple-600' : 'text-gray-400'
              }`}
            >
              <div className={`p-2 rounded-xl ${active ? 'bg-purple-100' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs mt-1 font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
