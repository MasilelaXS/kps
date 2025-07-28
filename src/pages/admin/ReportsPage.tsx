 import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText,
  Search,
  MoreHorizontal,
  Edit3,
  Eye,
  CheckCircle,
  XCircle,
  Archive,
  AlertTriangle,
  ChevronDown,
  Calendar,
  User,
  TrendingUp
} from 'lucide-react';
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Button,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip
} from '@heroui/react';
import toast from 'react-hot-toast';
import { adminService, type Report } from '../../services/adminService';

export const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    pending: number;
    approved: number;
    declined: number;
    archived: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [hasInitialData, setHasInitialData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reportTypeFilter, setReportTypeFilter] = useState<string>('all');

  // HeroUI disclosure hooks
  const { isOpen: isStatusModalOpen, onOpen: onStatusModalOpen, onClose: onStatusModalClose } = useDisclosure();

  // Selected report for modals
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'decline' | 'archive'>('approve');
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadReports = useCallback(async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsSearching(true);
      }

      const response = await adminService.getReports();
      
      if (response.success && response.data) {
        setReports(response.data.reports);
        setStats(response.data.summary);
        
        if (isInitialLoad) {
          setHasInitialData(true);
        }
      } else {
        throw new Error('Failed to load reports');
      }
    } catch (error: unknown) {
      console.error('Error loading reports:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load reports. Please try again.';
      
      if (isInitialLoad) {
        setError(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      } else {
        setIsSearching(false);
      }
    }
  }, []);

  useEffect(() => {
    loadReports(true);
  }, [loadReports]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = searchTerm === '' || 
      report.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.pco.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.pco.pco_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesType = reportTypeFilter === 'all' || report.report_type === reportTypeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleStatusAction = async (report: Report, action: 'approve' | 'decline' | 'archive') => {
    setSelectedReport(report);
    setActionType(action);
    setAdminNotes('');
    onStatusModalOpen();
  };

  const handleConfirmStatusAction = async () => {
    if (!selectedReport) return;

    setActionLoading(true);
    try {
      const response = await adminService.updateReportStatus(selectedReport.id, {
        status: actionType === 'approve' ? 'approved' : actionType === 'decline' ? 'declined' : 'archived',
        admin_notes: adminNotes || undefined
      });

      if (response?.success) {
        toast.success(`Report ${actionType}d successfully!`);
        loadReports();
        onStatusModalClose();
      } else {
        toast.error(`Failed to ${actionType} report`);
      }
    } catch (error) {
      console.error(`Error ${actionType}ing report:`, error);
      toast.error(`An error occurred while ${actionType}ing the report`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewReport = (report: Report) => {
    navigate(`/admin/reports/${report.id}`);
  };

  const handleEditReport = (report: Report) => {
    navigate(`/admin/reports/${report.id}/edit`);
  };

  // Loading state
  if (isLoading && !hasInitialData) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        {/* Loading Navigation Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-24"></div>
            </div>
            <div className="w-32 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Loading Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse mr-4"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Loading Main Content */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              {/* Loading Toolbar */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-1 max-w-md h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="w-32 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="w-32 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                  <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>

              {/* Loading Report List */}
              <div className="divide-y divide-gray-100">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                        <div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-32"></div>
                          <div className="flex items-center space-x-3">
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                            <div className="h-6 bg-gray-200 rounded animate-pulse w-24"></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse mb-1 w-16"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
                        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load reports</h3>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button
            onClick={() => {
              setHasInitialData(false);
              loadReports(true);
            }}
            className="inline-flex items-center px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Small Loading Dialog */}
      {isSearching && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 px-6 py-4 flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-gray-700">Please wait...</span>
          </div>
        </div>
      )}

      {/* Freshdesk-style Navigation Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Reports</h1>
          </div>
          <Button 
            onClick={() => navigate('/admin/reports/new')}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
            startContent={<TrendingUp className="h-4 w-4" />}
          >
            View Analytics
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Reports</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Declined</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.declined}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                    <Archive className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Archived</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.archived}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Freshdesk-style Main Content */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            {/* Toolbar */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-500 bg-white focus:outline-none focus:ring-0 focus:border-purple-500 hover:border-gray-400 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="relative w-32">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-0 focus:border-purple-500 hover:border-gray-400 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="declined">Declined</option>
                      <option value="archived">Archived</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="relative w-32">
                    <select
                      value={reportTypeFilter}
                      onChange={(e) => setReportTypeFilter(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-0 focus:border-purple-500 hover:border-gray-400 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="all">All Types</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="emergency">Emergency</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {filteredReports.length} items
                </div>
              </div>
            </div>

            {/* Report List */}
            <div className="divide-y divide-gray-100">
              {filteredReports.map((report) => (
                <div key={report.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          {report.client.name} - {report.report_type.charAt(0).toUpperCase() + report.report_type.slice(1)}
                        </h3>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-gray-500 flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            PCO: {report.pco.name} ({report.pco.pco_number})
                          </span>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(report.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          Report #{report.id}
                        </p>
                        <p className="text-xs text-gray-500">
                          {report.station_count || 0} stations
                        </p>
                      </div>
                      <Chip
                        size="sm"
                        variant="flat"
                        classNames={{
                          base: report.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : report.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : report.status === 'declined'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800',
                        }}
                      >
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </Chip>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button variant="light" size="sm" isIconOnly>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                          <DropdownItem 
                            key="view" 
                            startContent={<Eye className="h-4 w-4" />}
                            onPress={() => handleViewReport(report)}
                          >
                            View Details
                          </DropdownItem>
                          <DropdownItem 
                            key="edit" 
                            startContent={<Edit3 className="h-4 w-4" />}
                            onPress={() => handleEditReport(report)}
                          >
                            Edit Report
                          </DropdownItem>
                          {report.status === 'pending' ? (
                            <>
                              <DropdownItem 
                                key="approve" 
                                startContent={<CheckCircle className="h-4 w-4" />}
                                onPress={() => handleStatusAction(report, 'approve')}
                                className="text-success"
                                color="success"
                              >
                                Approve
                              </DropdownItem>
                              <DropdownItem 
                                key="decline" 
                                startContent={<XCircle className="h-4 w-4" />}
                                onPress={() => handleStatusAction(report, 'decline')}
                                className="text-danger"
                                color="danger"
                              >
                                Decline
                              </DropdownItem>
                            </>
                          ) : report.status !== 'archived' ? (
                            <DropdownItem 
                              key="archive" 
                              startContent={<Archive className="h-4 w-4" />}
                              onPress={() => handleStatusAction(report, 'archive')}
                              className="text-warning"
                              color="warning"
                            >
                              Archive
                            </DropdownItem>
                          ) : null}
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredReports.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                <p className="text-gray-500 text-sm mb-6">
                  {searchTerm || statusFilter !== 'all' || reportTypeFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Reports will appear here when PCOs submit them'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Action Modal */}
      <Modal 
        isOpen={isStatusModalOpen} 
        onClose={onStatusModalClose}
        size="2xl"
        classNames={{
          base: "bg-white",
          header: "border-b border-gray-200",
          footer: "border-t border-gray-200",
          closeButton: "hover:bg-gray-100"
        }}
      >
        <ModalContent>
          <ModalHeader className="text-lg font-semibold">
            {actionType === 'approve' && 'Approve Report'}
            {actionType === 'decline' && 'Decline Report'}
            {actionType === 'archive' && 'Archive Report'}
          </ModalHeader>
          <ModalBody className="py-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Are you sure you want to {actionType} this report?
                </p>
                {selectedReport && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {selectedReport.client.name} - {selectedReport.report_type}
                        </p>
                        <p className="text-sm text-gray-500">
                          PCO: {selectedReport.pco.name} • {formatDate(selectedReport.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes {actionType === 'decline' ? '(Required)' : '(Optional)'}
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-purple-500 hover:border-gray-400 transition-colors resize-none"
                  placeholder={`Add notes for ${actionType}ing this report...`}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={onStatusModalClose}
              className="text-gray-600 hover:text-gray-800"
            >
              Cancel
            </Button>
            <Button
              className={
                actionType === 'approve' 
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : actionType === 'decline'
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-yellow-600 hover:bg-yellow-700 text-white"
              }
              onPress={handleConfirmStatusAction}
              isLoading={actionLoading}
              isDisabled={actionType === 'decline' && !adminNotes.trim()}
            >
              {actionType === 'approve' && 'Approve Report'}
              {actionType === 'decline' && 'Decline Report'}
              {actionType === 'archive' && 'Archive Report'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
