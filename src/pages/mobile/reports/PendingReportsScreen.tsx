import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  RefreshCw, 
  Trash2, 
  Eye, 
  Calendar,
  MapPin,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Button,
  useDisclosure
} from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { OfflineStorageService, type OfflineReport } from '../../../services/offlineStorage';
import { SyncService } from '../../../services/syncService';
import { useAuthStore } from '../../../stores/authStore';
import { useNetworkStatus } from '../../../utils/networkUtils';

export const PendingReportsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isConnected } = useNetworkStatus();
  const [pendingReports, setPendingReports] = useState<OfflineReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<OfflineReport | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const { isOpen: isViewModalOpen, onOpen: onViewModalOpen, onClose: onViewModalClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();

  const loadPendingReports = React.useCallback(() => {
    if (user) {
      const reports = OfflineStorageService.getUserOfflineReports(user.id);
      setPendingReports(reports);
    }
  }, [user]);

  useEffect(() => {
    loadPendingReports();
  }, [loadPendingReports]);

  useEffect(() => {
    // Listen for sync completion
    const unsubscribe = SyncService.onSyncComplete(() => {
      loadPendingReports();
      setIsSyncing(false);
    });

    return unsubscribe;
  }, [loadPendingReports]);

  const handleSync = async () => {
    if (!user || !isConnected) {
      toast.error('No internet connection available');
      return;
    }

    setIsSyncing(true);
    try {
      await SyncService.syncOfflineReports(user.id, true);
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync reports');
      setIsSyncing(false);
    }
  };

  const handleViewReport = (report: OfflineReport) => {
    setSelectedReport(report);
    onViewModalOpen();
  };

  const handleDeleteReport = (report: OfflineReport) => {
    setSelectedReport(report);
    onDeleteModalOpen();
  };

  const confirmDelete = () => {
    if (selectedReport) {
      OfflineStorageService.removeOfflineReport(selectedReport.id);
      loadPendingReports();
      toast.success('Report deleted');
      onDeleteModalClose();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'inspection':
        return 'bg-blue-100 text-blue-800';
      case 'fumigation':
        return 'bg-purple-100 text-purple-800';
      case 'both':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/mobile/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Pending Reports</h1>
              <p className="text-sm text-gray-500">
                {pendingReports.length} report{pendingReports.length !== 1 ? 's' : ''} waiting to sync
              </p>
            </div>
          </div>
          
          <button
            onClick={handleSync}
            disabled={!isConnected || isSyncing || pendingReports.length === 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isConnected && !isSyncing && pendingReports.length > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync All'}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {!isConnected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-yellow-800 font-medium">No Internet Connection</p>
              <p className="text-yellow-700 text-sm">Reports will sync automatically when connection is restored.</p>
            </div>
          </div>
        )}

        {pendingReports.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-500">No pending reports to sync.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingReports.map((report) => (
              <div key={report.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReportTypeColor(report.reportData.report_type)}`}>
                        {report.reportData.report_type}
                      </span>
                      {report.attempts > 0 && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {report.attempts} attempt{report.attempts > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">Service: {report.reportData.date_of_service}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">Client ID: {report.reportData.client_id}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Created: {formatDate(report.createdAt)}
                      </p>
                      {report.error && (
                        <p className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                          Error: {report.error}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleViewReport(report)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteReport(report)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Report Modal */}
      <Modal isOpen={isViewModalOpen} onClose={onViewModalClose} size="lg">
        <ModalContent>
          <ModalHeader>Report Details</ModalHeader>
          <ModalBody>
            {selectedReport && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Report Type</label>
                    <p className="text-gray-900">{selectedReport.reportData.report_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Client ID</label>
                    <p className="text-gray-900">{selectedReport.reportData.client_id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Service Date</label>
                    <p className="text-gray-900">{selectedReport.reportData.date_of_service}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Created</label>
                    <p className="text-gray-900">{formatDate(selectedReport.createdAt)}</p>
                  </div>
                </div>
                
                {selectedReport.reportData.overall_remarks && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Overall Remarks</label>
                    <p className="text-gray-900 mt-1">{selectedReport.reportData.overall_remarks}</p>
                  </div>
                )}
                
                {selectedReport.reportData.recommendations && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Recommendations</label>
                    <p className="text-gray-900 mt-1">{selectedReport.reportData.recommendations}</p>
                  </div>
                )}
                
                {selectedReport.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <label className="text-sm font-medium text-red-800">Last Error</label>
                    <p className="text-red-700 mt-1">{selectedReport.error}</p>
                  </div>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onViewModalClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalContent>
          <ModalHeader className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>Delete Report</span>
          </ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete this pending report? This action cannot be undone.</p>
            {selectedReport && (
              <div className="bg-gray-50 rounded-lg p-3 mt-3">
                <p className="text-sm text-gray-600">
                  Report Type: <span className="font-medium">{selectedReport.reportData.report_type}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Service Date: <span className="font-medium">{selectedReport.reportData.date_of_service}</span>
                </p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onDeleteModalClose}>
              Cancel
            </Button>
            <Button className="bg-red-600 text-white" onPress={confirmDelete}>
              Delete Report
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
