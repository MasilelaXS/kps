import React from 'react';
import { Card, CardBody, Button, Avatar, Divider } from '@heroui/react';
import { Settings, Lock, FileText, LogOut, User, Phone, Mail, Calendar, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const profileActions = [
    {
      key: 'change-password',
      label: 'Change Password',
      description: 'Update your account password',
      icon: Lock,
      action: () => navigate('/mobile/profile/change-password'),
      color: 'primary' as const,
    },
    {
      key: 'settings',
      label: 'App Settings',
      description: 'Manage your app preferences',
      icon: Settings,
      action: () => navigate('/mobile/profile/settings'),
      color: 'secondary' as const,
    },
    {
      key: 'reports',
      label: 'View My Reports',
      description: 'See all your submitted reports',
      icon: FileText,
      action: () => navigate('/mobile/reports'),
      color: 'success' as const,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        {/* Profile Info Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200">
          <CardBody className="p-6">
            <div className="flex items-center gap-4">
              <Avatar
                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600"
                name={user?.name?.charAt(0) || 'P'}
                classNames={{
                  name: "text-white font-bold text-xl"
                }}
              />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{user?.name || 'PCO User'}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <p className="text-blue-700 font-medium">PCO #{user?.pco_number || 'N/A'}</p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-600 text-sm">{user?.email || 'No email'}</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Account Details */}
        <Card className="bg-white/80 backdrop-blur-xl border border-gray-200">
          <CardBody className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Full Name</p>
                  <p className="text-gray-900">{user?.name || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">PCO Number</p>
                  <p className="text-gray-900">{user?.pco_number || 'Not assigned'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Email Address</p>
                  <p className="text-gray-900">{user?.email || 'Not provided'}</p>
                </div>
              </div>

              {user?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Phone Number</p>
                    <p className="text-gray-900">{user.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Account Type</p>
                  <p className="text-gray-900">Pest Control Officer</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Account Settings */}
        <Card className="bg-white/80 backdrop-blur-xl border border-gray-200">
          <CardBody className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
            
            <div className="space-y-3">
              {profileActions.map((action, index) => (
                <div key={action.key}>
                  <Button
                    variant="light"
                    className="w-full justify-start p-4 h-auto"
                    onClick={action.action}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        action.color === 'primary' ? 'bg-blue-100' :
                        action.color === 'secondary' ? 'bg-purple-100' :
                        action.color === 'success' ? 'bg-green-100' :
                        'bg-gray-100'
                      }`}>
                        <action.icon className={`w-5 h-5 ${
                          action.color === 'primary' ? 'text-blue-600' :
                          action.color === 'secondary' ? 'text-purple-600' :
                          action.color === 'success' ? 'text-green-600' :
                          'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900">{action.label}</p>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                      <div className="text-gray-400">
                        ›
                      </div>
                    </div>
                  </Button>
                  {index < profileActions.length - 1 && <Divider className="my-1" />}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Logout Section */}
        <Card className="bg-white/80 backdrop-blur-xl border border-red-200">
          <CardBody className="p-6">
            <div className="text-center">
              <Button
                color="danger"
                variant="light"
                size="lg"
                className="w-full"
                startContent={<LogOut className="w-5 h-5" />}
                onClick={handleLogout}
              >
                Log Out
              </Button>
              <p className="text-xs text-gray-500 mt-3">
                You will be logged out of the application and returned to the login screen.
              </p>
            </div>
          </CardBody>
        </Card>

        {/* App Info */}
        <div className="text-center py-6">
          <p className="text-sm text-gray-500">
            KPS Mobile App • Version 2.0
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Powered by KPS Technology Solutions
          </p>
        </div>
      </div>
    </div>
  );
};
