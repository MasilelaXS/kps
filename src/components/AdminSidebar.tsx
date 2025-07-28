import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Building2, 
  FlaskConical, 
  FileText, 
  Settings, 
  LogOut,
  User
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export const AdminSidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: Building2, label: 'Clients', path: '/admin/clients' },
    { icon: FlaskConical, label: 'Chemicals', path: '/admin/chemicals' },
    { icon: FileText, label: 'Reports', path: '/admin/reports' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="w-64 bg-purple-600 shadow-lg flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-purple-500">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <span className="text-purple-600 font-bold text-lg">KPS</span>
          </div>
          <div>
            <h2 className="font-bold text-white">KPS Admin</h2>
            <p className="text-sm text-purple-200">Control Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 pt-6">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path || 
                         (item.path === '/admin' && location.pathname === '/admin/');
          
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center space-x-3 px-6 py-3 mx-3 rounded-lg text-white hover:bg-purple-500 transition-colors ${
                isActive ? 'bg-purple-500 shadow-md' : ''
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Menu */}
      <div className="p-6 border-t border-purple-500">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-purple-200">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center space-x-2 text-purple-200 hover:text-white transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};
