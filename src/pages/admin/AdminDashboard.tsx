import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  FlaskConical, 
  FileText, 
  UserPlus,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { adminService } from '../../services/adminService';
import type { AdminDashboardData } from '../../services/adminService';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.getDashboard();
      
      if (response.success && response.data) {
        // Ensure arrays have default values
        const data = {
          ...response.data,
          recent_activity: response.data.recent_activity || [],
          top_pcos: response.data.top_pcos || [],
          assigned_clients: response.data.assigned_clients || [],
          upcoming_service_clients: response.data.upcoming_service_clients || []
        };
        setDashboardData(data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (value: string | number): string => {
    const num = typeof value === 'string' ? parseInt(value) : value;
    return isNaN(num) ? '0' : num.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">
          Welcome back, {user?.name}! Here's what's happening with your pest control operations.
        </p>
      </div>

      {dashboardData && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Users */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {formatNumber(dashboardData.summary.users.total_users)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {dashboardData.summary.users.pco_count} PCOs, {dashboardData.summary.users.admin_count} Admins
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Total Clients */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Clients</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {formatNumber(dashboardData.summary.clients.total_clients)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {dashboardData.summary.clients.new_clients_30days} new this month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Total Reports */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Reports</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {formatNumber(dashboardData.summary.reports.total_reports)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {dashboardData.summary.reports.reports_this_month} this month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Pending Reports */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Reports Status</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {formatNumber(dashboardData.summary.reports.pending_reports)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {dashboardData.summary.reports.approved_reports} approved, {dashboardData.summary.reports.declined_reports} declined
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </div>
          </div>            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
                    <FileText className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
                <div className="p-6">
                  {!dashboardData.recent_activity || dashboardData.recent_activity.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No recent activity</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {dashboardData.recent_activity.slice(0, 5).map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            activity.status === 'approved' ? 'bg-green-500' :
                            activity.status === 'declined' ? 'bg-red-500' :
                            'bg-yellow-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.report_type === 'fumigation' ? '🔬' : '🔍'} {activity.report_type.charAt(0).toUpperCase() + activity.report_type.slice(1)} Report
                            </p>
                            <p className="text-sm text-gray-600">
                              {activity.client_name} • {activity.pco_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(activity.created_at).toLocaleDateString()} • 
                              <span className={`ml-1 capitalize ${
                                activity.status === 'approved' ? 'text-green-600' :
                                activity.status === 'declined' ? 'text-red-600' :
                                'text-yellow-600'
                              }`}>
                                {activity.status}
                              </span>
                            </p>
                          </div>
                        </div>
                      ))}
                      {dashboardData.recent_activity.length > 5 && (
                        <div className="text-center">
                          <Link 
                            to="/admin/reports" 
                            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                          >
                            View all reports →
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Top PCOs */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Top PCOs</h3>
                    <Users className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
                <div className="p-6">
                  {!dashboardData.top_pcos || dashboardData.top_pcos.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No PCO data available</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {dashboardData.top_pcos.map((pco, index) => (
                        <div key={pco.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold text-sm">
                            #{index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{pco.name}</p>
                            <p className="text-sm text-gray-600">{pco.pco_number}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">{pco.total_reports} reports</p>
                            <p className="text-xs text-green-600">{pco.approval_rate}% approval</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link
                      to="/admin/users"
                      className="flex flex-col items-center p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
                    >
                      <UserPlus className="h-8 w-8 text-purple-600 mb-2" />
                      <span className="text-sm font-medium text-purple-800">Add User</span>
                    </Link>
                    <Link
                      to="/admin/clients"
                      className="flex flex-col items-center p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                    >
                      <Building2 className="h-8 w-8 text-green-600 mb-2" />
                      <span className="text-sm font-medium text-green-800">Manage Clients</span>
                    </Link>
                    <Link
                      to="/admin/reports"
                      className="flex flex-col items-center p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
                    >
                      <FileText className="h-8 w-8 text-purple-600 mb-2" />
                      <span className="text-sm font-medium text-purple-800">View Reports</span>
                    </Link>
                    <Link
                      to="/admin/chemicals"
                      className="flex flex-col items-center p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors"
                    >
                      <FlaskConical className="h-8 w-8 text-orange-600 mb-2" />
                      <span className="text-sm font-medium text-orange-800">Chemicals</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
  );
};
