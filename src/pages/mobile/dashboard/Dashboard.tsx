import React, { useEffect, useState } from 'react';
import { Calendar, CheckCircle, Users, TrendingUp, Clock, AlertCircle, Plus, Search, FileText, RefreshCw } from 'lucide-react';
import { useMobileStore } from '../../../stores/mobileStore';
import { useAuthStore } from '../../../stores/authStore';
import { OfflineStorageService } from '../../../services/offlineStorage';
import { SyncService } from '../../../services/syncService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const { 
    dashboardData, 
    isDashboardLoading, 
    loadDashboard, 
    error 
  } = useMobileStore();

  const updatePendingCount = React.useCallback(() => {
    if (user) {
      const count = OfflineStorageService.getPendingCount(user.id);
      setPendingCount(count);
    }
  }, [user]);

  useEffect(() => {
    loadDashboard();
    updatePendingCount();
  }, [loadDashboard, updatePendingCount]);

  useEffect(() => {
    // Listen for sync completion to update pending count
    const unsubscribe = SyncService.onSyncComplete(() => {
      updatePendingCount();
      setIsSyncing(false);
    });

    return unsubscribe;
  }, [updatePendingCount]);

  const handleSync = async () => {
    if (!user) return;
    
    setIsSyncing(true);
    try {
      await SyncService.syncOfflineReports(user.id, true);
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync reports');
      setIsSyncing(false);
    }
  };

  if (isDashboardLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-sm text-red-600 mb-2">Failed to load dashboard</p>
          <p className="text-xs text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    draft_reports: 0,
    in_progress_reports: 0,
    completed_reports: 0,
    pending_reports: 0,
    assigned_clients: 0,
    reports_today: 0,
  };

  const recentReports = dashboardData?.recent_reports || [];
  const upcomingServices = dashboardData?.upcoming_services || [];

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4 pb-6">
        {/* Welcome Section */}
        <div className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded p-4 text-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
          </div>
          <h1 className="text-lg font-semibold text-gray-900 mb-1">
            Good morning, {user?.name || 'PCO'}
          </h1>
          <p className="text-xs text-gray-600">
            Ready to manage your inspections and reports
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded p-3 text-center">
            <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Clock className="w-4 h-4" />
            </div>
            <p className="text-lg font-bold text-gray-900">{stats.draft_reports}</p>
            <p className="text-xs text-gray-600">Draft</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded p-3 text-center">
            <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-4 h-4" />
            </div>
            <p className="text-lg font-bold text-gray-900">{stats.reports_today}</p>
            <p className="text-xs text-gray-600">Today</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded p-3 text-center">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Users className="w-4 h-4" />
            </div>
            <p className="text-lg font-bold text-gray-900">{stats.assigned_clients}</p>
            <p className="text-xs text-gray-600">Clients</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded p-3 text-center">
            <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-4 h-4" />
            </div>
            <p className="text-lg font-bold text-gray-900">{stats.completed_reports}</p>
            <p className="text-xs text-gray-600">Completed</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            className="h-16 flex flex-col items-center justify-center gap-1 bg-white/70 backdrop-blur-sm border border-gray-100 rounded text-gray-700 hover:bg-gray-50"
            onClick={() => navigate('/mobile/schedule')}
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs">New Report</span>
          </button>
          
          <button
            className="h-16 flex flex-col items-center justify-center gap-1 bg-white/70 backdrop-blur-sm border border-gray-100 rounded text-gray-700 hover:bg-gray-50"
            onClick={() => navigate('/mobile/schedule')}
          >
            <Search className="w-4 h-4" />
            <span className="text-xs">Find Client</span>
          </button>
          
          <button
            className="h-16 flex flex-col items-center justify-center gap-1 bg-white/70 backdrop-blur-sm border border-gray-100 rounded text-gray-700 hover:bg-gray-50"
            onClick={() => navigate('/mobile/reports/pending')}
          >
            <FileText className="w-4 h-4" />
            <span className="text-xs">Pending ({pendingCount})</span>
          </button>

          <button
            className={`h-16 flex flex-col items-center justify-center gap-1 bg-white/70 backdrop-blur-sm border border-gray-100 rounded text-gray-700 hover:bg-gray-50 ${
              isSyncing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleSync}
            disabled={isSyncing}
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="text-xs">{isSyncing ? 'Syncing...' : 'Sync'}</span>
          </button>
        </div>

        {/* Recent Reports */}
        <div className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-gray-600" />
            <h2 className="text-sm font-semibold text-gray-900">Recent Reports</h2>
          </div>
          
          {recentReports.length > 0 ? (
            <div className="space-y-2">
              {recentReports.slice(0, 5).map((report) => (
                <div key={report.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    report.status === 'completed' ? 'bg-green-500' :
                    report.status === 'in_progress' ? 'bg-blue-500' :
                    report.status === 'draft' ? 'bg-orange-500' :
                    'bg-gray-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-xs text-gray-900">
                      {report.report_type.charAt(0).toUpperCase() + report.report_type.slice(1)} - {report.client_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(report.created_at).toLocaleDateString()} • {report.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500">No recent reports</p>
              <p className="text-xs text-gray-400 mt-1">Reports will appear here as you create them</p>
            </div>
          )}
        </div>

        {/* Upcoming Services */}
        {upcomingServices.length > 0 && (
          <div className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-gray-600" />
              <h2 className="text-sm font-semibold text-gray-900">Upcoming Services</h2>
            </div>
            
            <div className="space-y-2">
              {upcomingServices.slice(0, 3).map((service) => (
                <div key={service.id} className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-blue-500" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-900">{service.client_name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(service.next_service_date).toLocaleDateString()}
                    </p>
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
