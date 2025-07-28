import React, { useState, useEffect, useCallback } from 'react';
import { Button, Avatar, Chip } from '@heroui/react';
import { 
  MapPin, 
  FileText,
  Clock,
  CheckCircle,
  Users,
  Bell,
  Search,
  Activity,
  Home
} from 'lucide-react';
import { pcoService } from '../../services/pcoService';
import type { PcoDashboardData } from '../../services/pcoService';
import { usePcoAuthStore } from '../../stores/pcoAuthStore';

const PcoDashboard: React.FC = () => {
  const { pcoUser, isAuthenticated } = usePcoAuthStore();
  const [dashboardData, setDashboardData] = useState<PcoDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug logging
  useEffect(() => {
    console.log('PCO Dashboard mounted - Auth state:', { pcoUser, isAuthenticated });
  }, [pcoUser, isAuthenticated]);

  const fetchDashboardData = useCallback(async () => {
    if (!pcoUser?.id) {
      window.location.href = '/login';
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await pcoService.getDashboard(pcoUser.id);
      if (response.data) {
        setDashboardData(response.data);
      } else {
        setError('No dashboard data received');
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [pcoUser]);

  useEffect(() => {
    if (!pcoUser) {
      window.location.href = '/login';
      return;
    }
    fetchDashboardData();
  }, [fetchDashboardData, pcoUser]);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'declined': return 'danger';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
        {/* Header Skeleton */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div>
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Welcome Card Skeleton */}
          <div className="bg-gray-200 rounded-xl h-32 animate-pulse"></div>
          
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-8 w-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!pcoUser) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-md mx-auto flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-500 mb-4">Please log in to access the dashboard</p>
          <Button 
            color="primary" 
            onClick={() => window.location.href = '/login'}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-md mx-auto flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load dashboard</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button 
            color="primary" 
            onClick={fetchDashboardData}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar
              src="/logo2.png"
              size="sm"
              className="ring-2 ring-purple-100"
            />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {dashboardData.profile.name}
              </h1>
              <p className="text-sm text-gray-500">PCO #{dashboardData.profile.pco_number}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              isIconOnly
              variant="light"
              className="text-gray-600"
            >
              <Search className="w-5 h-5" />
            </Button>
            <Button
              isIconOnly
              variant="light"
              className="text-gray-600"
            >
              <Bell className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Welcome Card - Freshdesk Style */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Welcome back,</p>
              <h2 className="text-xl font-bold">{dashboardData.profile.name.split(' ')[0]}</h2>
              <p className="text-purple-100 text-sm">{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
            <div className="text-right">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <Home className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - Freshdesk Style */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Reports</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{dashboardData.statistics.total_reports}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Clients</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{dashboardData.statistics.assigned_clients}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">This Week</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{dashboardData.statistics.reports_this_week}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">This Month</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{dashboardData.statistics.reports_this_month}</p>
          </div>
        </div>

        {/* Report Status Overview - Freshdesk Style */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Status</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <FileText className="w-4 h-4 text-gray-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">{dashboardData.statistics.draft_reports}</p>
              <p className="text-xs text-gray-500">Draft</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-xl">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
              <p className="text-lg font-bold text-orange-600">{dashboardData.statistics.pending_reports}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-lg font-bold text-green-600">{dashboardData.statistics.approved_reports}</p>
              <p className="text-xs text-gray-500">Approved</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-xl">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Activity className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-lg font-bold text-red-600">{dashboardData.statistics.declined_reports}</p>
              <p className="text-xs text-gray-500">Declined</p>
            </div>
          </div>
        </div>

        {/* Recent Reports - Freshdesk Style */}
        {dashboardData.recent_reports && dashboardData.recent_reports.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
              <Button variant="light" size="sm" className="text-purple-600 hover:text-purple-700">
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {dashboardData.recent_reports.slice(0, 3).map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{report.client_name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Chip
                        size="sm"
                        color={report.report_type === 'inspection' ? 'primary' : 'secondary'}
                        variant="flat"
                        className="text-xs"
                      >
                        {report.report_type}
                      </Chip>
                      <span className="text-xs text-gray-500">{formatDateTime(report.created_at)}</span>
                    </div>
                  </div>
                  <Chip
                    size="sm"
                    color={getStatusColor(report.status)}
                    variant="flat"
                    className="text-xs"
                  >
                    {report.status}
                  </Chip>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assigned Clients - Freshdesk Style */}
        {dashboardData.assigned_clients && dashboardData.assigned_clients.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Assigned Clients</h2>
              <Button variant="light" size="sm" className="text-purple-600 hover:text-purple-700">
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {dashboardData.assigned_clients.slice(0, 3).map((client) => (
                <div key={client.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {client.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{client.name}</p>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{client.address}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Reports</p>
                    <p className="font-semibold text-gray-900">{client.total_reports}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PcoDashboard;
