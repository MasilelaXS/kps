import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  FlaskConical, 
  FileText, 
  UserPlus,
  AlertTriangle,
  CheckCircle,
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
        setDashboardData(response.data);
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
              {/* Total Clients */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Clients</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {formatNumber(dashboardData.summary.total_clients)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Active PCOs */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active PCOs</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {formatNumber(dashboardData.summary.active_pcos)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Pending Reports */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Reports</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {formatNumber(dashboardData.summary.pending_reports)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </div>

              {/* Completed Reports */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed Reports</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {formatNumber(dashboardData.summary.completed_reports)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
          </div>            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Reports */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Recent Reports</h3>
                    <FileText className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
                <div className="p-6">
                  {!dashboardData.recent_reports || dashboardData.recent_reports.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No recent reports</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-gray-600">Recent report activity will be displayed here</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
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
