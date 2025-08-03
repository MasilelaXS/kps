import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText,
  Search,
  Edit3,
  Eye,
  CheckCircle,
  XCircle,
  Archive,
  AlertTriangle,
  ChevronDown,
  Calendar,
  User,
  TrendingUp,
  Trash2,
  Mail,
  Download
} from 'lucide-react';
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Button,
  useDisclosure,
  Chip
} from '@heroui/react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import type { Report } from '../../types/admin';
import { CustomDropdown } from '../../components/common/CustomDropdown';

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
  const [pagination, setPagination] = useState<{
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [hasInitialData, setHasInitialData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Enhanced filtering options
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reportTypeFilter, setReportTypeFilter] = useState<string>('all');
  const [dateFromFilter, setDateFromFilter] = useState<string>('');
  const [dateToFilter, setDateToFilter] = useState<string>('');
  const [pcoFilter] = useState<string>('all'); // TODO: Add PCO filter dropdown
  const [currentPage, setCurrentPage] = useState(1);
  const [limitPerPage] = useState(20); // TODO: Add per-page selector

  // HeroUI disclosure hooks
  const { isOpen: isStatusModalOpen, onOpen: onStatusModalOpen, onClose: onStatusModalClose } = useDisclosure();
  const { isOpen: isStatusChangeOpen, onOpen: onStatusChangeOpen, onClose: onStatusChangeClose } = useDisclosure();
  const { isOpen: isEmailModalOpen, onOpen: onEmailModalOpen, onClose: onEmailModalClose } = useDisclosure();

  // Selected report for modals
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'decline' | 'archive'>('approve');
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  
  // Email modal state
  const [emailCCList, setEmailCCList] = useState<string>('');
  const [additionalMessage, setAdditionalMessage] = useState<string>('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const loadReports = useCallback(async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsSearching(true);
      }

      // Build filter parameters for server-side filtering
      const params: {
        search?: string;
        status?: string;
        report_type?: string;
        date_from?: string;
        date_to?: string;
        pco_id?: number;
        page?: number;
        limit?: number;
      } = {};
      
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      if (reportTypeFilter && reportTypeFilter !== 'all') {
        params.report_type = reportTypeFilter;
      }
      
      if (dateFromFilter) {
        params.date_from = dateFromFilter;
      }
      
      if (dateToFilter) {
        params.date_to = dateToFilter;
      }
      
      if (pcoFilter && pcoFilter !== 'all') {
        params.pco_id = parseInt(pcoFilter);
      }
      
      // Add pagination
      params.page = currentPage;
      params.limit = limitPerPage;

      const response = await adminService.getReports(params);
      
      if (response.success && response.data) {
        setReports(response.data.reports);
        setStats(response.data.summary);
        setPagination(response.data.pagination || null);
        
        // Debug pagination
        console.log('📊 Pagination data received:', response.data.pagination);
        console.log('📄 Current page set to:', currentPage);
        console.log('📦 Reports count:', response.data.reports.length);
        
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
  }, [searchTerm, statusFilter, reportTypeFilter, dateFromFilter, dateToFilter, pcoFilter, currentPage, limitPerPage]);

  useEffect(() => {
    loadReports(true);
  }, [loadReports]);

  // Reload data when filters change (debounced for search)
  useEffect(() => {
    if (!hasInitialData) return;
    
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when filters change
    }, searchTerm ? 500 : 0); // Debounce search, but immediate for other filters

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, reportTypeFilter, dateFromFilter, dateToFilter, pcoFilter, hasInitialData]);

  // Reload data when pagination changes or filters change (after page reset)
  useEffect(() => {
    if (hasInitialData) {
      loadReports();
    }
  }, [currentPage, limitPerPage, hasInitialData, loadReports]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusAction = async (report: Report, action: 'approve' | 'decline' | 'archive') => {
    setSelectedReport(report);
    setActionType(action);
    setAdminNotes('');
    onStatusModalOpen();
  };

  const handleStatusChange = (report: Report) => {
    setSelectedReport(report);
    setNewStatus(report.status);
    setAdminNotes('');
    onStatusChangeOpen();
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedReport || !newStatus) return;

    setActionLoading(true);
    try {
      const response = await adminService.updateReportStatus(selectedReport.id, {
        status: newStatus,
        admin_notes: adminNotes || undefined
      });

      if (response?.success) {
        toast.success(`Report status updated to ${newStatus} successfully!`);
        loadReports();
        onStatusChangeClose();
      } else {
        // Enhanced error handling - show actual backend error message
        const errorMessage = response?.message || `Failed to update report status`;
        toast.error(errorMessage);
      }
    } catch (error: unknown) {
      console.error(`Error updating report status:`, error);
      
      // Enhanced error handling - extract actual error message
      let errorMessage = `An error occurred while updating the report status`;
      
      if (error && typeof error === 'object') {
        if ('response' in error && error.response && typeof error.response === 'object') {
          const response = error.response as any;
          if (response.data?.message) {
            errorMessage = response.data.message;
          } else if (response.data?.error) {
            errorMessage = response.data.error;
          } else if (response.statusText) {
            errorMessage = response.statusText;
          }
        } else if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
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
        // Enhanced error handling - show actual backend error message
        const errorMessage = response?.message || `Failed to ${actionType} report`;
        toast.error(errorMessage);
      }
    } catch (error: unknown) {
      console.error(`Error ${actionType}ing report:`, error);
      
      // Enhanced error handling - extract actual error message
      let errorMessage = `An error occurred while ${actionType}ing the report`;
      
      if (error && typeof error === 'object') {
        if ('response' in error && error.response && typeof error.response === 'object') {
          const response = error.response as any;
          if (response.data?.message) {
            errorMessage = response.data.message;
          } else if (response.data?.error) {
            errorMessage = response.data.error;
          } else if (response.statusText) {
            errorMessage = response.statusText;
          }
        } else if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
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

  const handleDeleteReport = async (report: Report) => {
    if (!confirm(`Are you sure you want to delete this report? This action cannot be undone.`)) {
      return;
    }

    try {
      const isDraft = report.status === 'draft';
      const response = await adminService.deleteReport(report.id, !isDraft);
      
      if (response?.success) {
        toast.success('Report deleted successfully!');
        loadReports();
      } else {
        toast.error('Failed to delete report');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('An error occurred while deleting the report');
    }
  };

  const handleEmailReport = async (report: Report) => {
    if (report.status !== 'approved') {
      toast.error('Only approved reports can be emailed to clients');
      return;
    }

    // Open email modal instead of directly sending
    setSelectedReport(report);
    setEmailCCList('');
    setAdditionalMessage('');
    onEmailModalOpen();
  };

  const handleConfirmEmailReport = async () => {
    if (!selectedReport) return;

    setIsEmailLoading(true);
    try {
      // Parse CC list - split by comma and trim whitespace
      const ccEmails = emailCCList
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);

      // Prepare request data
      const emailData: {
        cc?: string[];
        additional_message?: string;
      } = {};

      if (ccEmails.length > 0) {
        emailData.cc = ccEmails;
      }

      if (additionalMessage.trim()) {
        emailData.additional_message = additionalMessage.trim();
      }

      const response = await adminService.emailReport(selectedReport.id, emailData);
      
      if (response?.success) {
        toast.success(`Report emailed successfully to ${response.data?.recipient || 'client'}!`);
        onEmailModalClose();
      } else {
        // Enhanced error handling - show actual backend error message
        const errorMessage = response?.message || 'Failed to email report';
        toast.error(errorMessage);
      }
    } catch (error: unknown) {
      console.error('Error emailing report:', error);
      
      // Enhanced error handling - extract actual error message
      let errorMessage = 'An error occurred while emailing the report';
      
      if (error && typeof error === 'object') {
        if ('response' in error && error.response && typeof error.response === 'object') {
          const response = error.response as any;
          if (response.data?.message) {
            errorMessage = response.data.message;
          } else if (response.data?.error) {
            errorMessage = response.data.error;
          } else if (response.statusText) {
            errorMessage = response.statusText;
          }
        } else if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleDownloadReport = async (report: Report) => {
    try {
      const blob = await adminService.downloadReportPDF(report.id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `report_${report.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('An error occurred while downloading the report');
    }
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
            onClick={() => navigate('/admin/analytics')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-2.5 rounded-xl shadow-sm"
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
              <div className="bg-white rounded-xl border border-gray-200 p-6 report-card">
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

              <div className="bg-white rounded-xl border border-gray-200 p-6 report-card">
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

              <div className="bg-white rounded-xl border border-gray-200 p-6 report-card">
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

              <div className="bg-white rounded-xl border border-gray-200 p-6 report-card">
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

              <div className="bg-white rounded-xl border border-gray-200 p-6 report-card">
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
          <div className="bg-white rounded-xl border border-gray-200 report-card">
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
                      <option value="draft">Draft</option>
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
                      <option value="inspection">Inspection</option>
                      <option value="fumigation">Fumigation</option>
                      <option value="both">Both</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  
                  {/* Date Range Filters */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="date"
                      value={dateFromFilter}
                      onChange={(e) => setDateFromFilter(e.target.value)}
                      className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-0 focus:border-purple-500 hover:border-gray-400 transition-colors"
                      placeholder="From Date"
                    />
                    <input
                      type="date"
                      value={dateToFilter}
                      onChange={(e) => setDateToFilter(e.target.value)}
                      className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-0 focus:border-purple-500 hover:border-gray-400 transition-colors"
                      placeholder="To Date"
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {pagination ? `${pagination.total} total items` : `${reports.length} items`}
                </div>
              </div>
            </div>

            {/* Report List */}
            <div className="divide-y divide-gray-100">
              {reports.map((report) => (
                <div key={report.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          {report.client_name || report.client?.name || 'Unknown Client'} - {report.report_type.charAt(0).toUpperCase() + report.report_type.slice(1)}
                        </h3>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-gray-500 flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            PCO: {report.pco_name || report.pco?.name || 'Unknown'} ({report.pco_number || report.pco?.pco_number || 'N/A'})
                          </span>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {report.date_of_service ? new Date(report.date_of_service).toLocaleDateString() : formatDate(report.created_at)}
                          </span>
                          {report.next_service_date && (
                            <span className="text-xs text-blue-600 flex items-center">
                              Next: {new Date(report.next_service_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {report.overall_remarks && (
                          <p className="text-xs text-gray-600 mt-1 truncate max-w-md">
                            {report.overall_remarks}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          Report #{report.id}
                        </p>
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>{report.station_count || 0} stations{report.fumigation_count ? `, ${report.fumigation_count} treatments` : ''}</p>
                          {report.completion_status && (
                            <p className="text-green-600">Status: {report.completion_status}</p>
                          )}
                          {report.reviewed_by_name && (
                            <p>Reviewed by: {report.reviewed_by_name}</p>
                          )}
                        </div>
                      </div>
                      <Chip
                        size="sm"
                        variant="flat"
                        classNames={{
                          base: report.status === 'draft'
                            ? 'bg-gray-100 text-gray-800'
                            : report.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : report.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : report.status === 'declined'
                            ? 'bg-red-100 text-red-800'
                            : report.status === 'archived'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800',
                        }}
                      >
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </Chip>
                      
                      {/* Status Update Buttons - Show for different report statuses */}
                      {report.status === 'pending' && (
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            color="success"
                            variant="solid"
                            className="bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-1.5 rounded-lg"
                            startContent={<CheckCircle className="h-3 w-3" />}
                            onPress={() => handleStatusAction(report, 'approve')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            variant="solid"
                            className="bg-red-600 hover:bg-red-700 text-white font-medium px-3 py-1.5 rounded-lg"
                            startContent={<XCircle className="h-3 w-3" />}
                            onPress={() => handleStatusAction(report, 'decline')}
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                      
                      {/* Change Status Button - Always visible for admins */}
                      <Button
                        size="sm"
                        variant="bordered"
                        className="border-purple-200 text-purple-700 hover:bg-purple-50 font-medium px-3 py-1.5 rounded-lg"
                        startContent={<Archive className="h-3 w-3" />}
                        onPress={() => handleStatusChange(report)}
                      >
                        Change Status
                      </Button>
                      
                      <CustomDropdown
                        items={[
                          {
                            key: 'view',
                            label: 'View Details',
                            icon: <Eye className="h-4 w-4" />,
                            onPress: () => handleViewReport(report)
                          },
                          {
                            key: 'edit',
                            label: 'Edit Report',
                            icon: <Edit3 className="h-4 w-4" />,
                            onPress: () => handleEditReport(report)
                          },
                          ...(report.status === 'approved' ? [{
                            key: 'email',
                            label: 'Email to Client',
                            icon: <Mail className="h-4 w-4" />,
                            color: 'primary' as const,
                            onPress: () => handleEmailReport(report)
                          }] : []),
                          {
                            key: 'download',
                            label: 'Download PDF',
                            icon: <Download className="h-4 w-4" />,
                            onPress: () => handleDownloadReport(report)
                          },
                          ...(report.status !== 'archived' && report.status !== 'pending' ? [{
                            key: 'archive',
                            label: 'Archive',
                            icon: <Archive className="h-4 w-4" />,
                            color: 'warning' as const,
                            onPress: () => handleStatusAction(report, 'archive')
                          }] : []),
                          {
                            key: 'delete',
                            label: 'Delete',
                            icon: <Trash2 className="h-4 w-4" />,
                            color: 'danger' as const,
                            onPress: () => handleDeleteReport(report)
                          }
                        ]}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {reports.length === 0 && (
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
          
          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {(pagination.current_page - 1) * pagination.per_page + 1} to{' '}
                  {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                  {pagination.total} results
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="bordered"
                    isDisabled={pagination.current_page <= 1}
                    onClick={() => setCurrentPage(pagination.current_page - 1)}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {[...Array(Math.min(5, pagination.total_pages))].map((_, index) => {
                      const page = Math.max(1, pagination.current_page - 2) + index;
                      if (page > pagination.total_pages) return null;
                      
                      return (
                        <Button
                          key={page}
                          size="sm"
                          variant={page === pagination.current_page ? "solid" : "bordered"}
                          className={page === pagination.current_page ? "bg-purple-600 text-white" : ""}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    size="sm"
                    variant="bordered"
                    isDisabled={pagination.current_page >= pagination.total_pages}
                    onClick={() => setCurrentPage(pagination.current_page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
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
                          {selectedReport.client_name || selectedReport.client?.name || 'Unknown Client'} - {selectedReport.report_type}
                        </p>
                        <p className="text-sm text-gray-500">
                          PCO: {selectedReport.pco_name || selectedReport.pco?.name || 'Unknown'} • {formatDate(selectedReport.created_at)}
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
              className="text-gray-600 hover:text-gray-800 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              className={
                actionType === 'approve' 
                  ? "bg-green-600 hover:bg-green-700 text-white rounded-xl"
                  : actionType === 'decline'
                  ? "bg-red-600 hover:bg-red-700 text-white rounded-xl"
                  : "bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl"
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

      {/* Status Change Modal */}
      <Modal 
        isOpen={isStatusChangeOpen} 
        onClose={onStatusChangeClose}
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
            Change Report Status
          </ModalHeader>
          <ModalBody className="py-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Update the status of this report:
                </p>
                {selectedReport && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {selectedReport.client_name || selectedReport.client?.name || 'Unknown Client'} - {selectedReport.report_type}
                        </p>
                        <p className="text-sm text-gray-500">
                          PCO: {selectedReport.pco_name || selectedReport.pco?.name || 'Unknown'} • {formatDate(selectedReport.created_at)}
                        </p>
                        <p className="text-sm text-purple-600 mt-1">
                          Current Status: <span className="font-medium">{selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-0 focus:border-purple-500 hover:border-gray-400 transition-colors appearance-none cursor-pointer"
                >
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="declined">Declined</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-purple-500 hover:border-gray-400 transition-colors resize-none"
                  placeholder="Add notes about this status change..."
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={onStatusChangeClose}
              className="text-gray-600 hover:text-gray-800 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
              onPress={handleConfirmStatusChange}
              isLoading={actionLoading}
              isDisabled={!newStatus || newStatus === selectedReport?.status}
            >
              Update Status
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Email Report Modal */}
      <Modal 
        isOpen={isEmailModalOpen} 
        onClose={onEmailModalClose}
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
            Email Report to Client
          </ModalHeader>
          <ModalBody className="py-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Send this approved report to the client via email. You can optionally add CC recipients and a custom message.
                </p>
                {selectedReport && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {selectedReport.client_name || selectedReport.client?.name || 'Unknown Client'} - {selectedReport.report_type}
                        </p>
                        <p className="text-sm text-gray-500">
                          PCO: {selectedReport.pco_name || selectedReport.pco?.name || 'Unknown'} • {formatDate(selectedReport.created_at)}
                        </p>
                        <p className="text-sm text-green-600 mt-1">
                          Status: <span className="font-medium">Approved</span> ✓
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CC Recipients <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={emailCCList}
                  onChange={(e) => setEmailCCList(e.target.value)}
                  placeholder="manager@company.com, supervisor@company.com"
                  className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-500 bg-white focus:outline-none focus:ring-0 focus:border-blue-500 hover:border-gray-400 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate multiple email addresses with commas
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Message <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={additionalMessage}
                  onChange={(e) => setAdditionalMessage(e.target.value)}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-blue-500 hover:border-gray-400 transition-colors resize-none"
                  placeholder="Please review the attached report carefully. We noticed some increased activity in the kitchen area and recommend additional monitoring. Our team will follow up next week to discuss preventive measures."
                />
                <p className="text-xs text-gray-500 mt-1">
                  This message will be included in the email body along with the report attachment
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Mail className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Email will include:</p>
                    <ul className="mt-1 list-disc list-inside text-xs space-y-0.5">
                      <li>PDF report attachment</li>
                      <li>Standard professional email template</li>
                      <li>Your additional message (if provided)</li>
                      <li>Company contact information</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={onEmailModalClose}
              className="text-gray-600 hover:text-gray-800 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              onPress={handleConfirmEmailReport}
              isLoading={isEmailLoading}
              startContent={!isEmailLoading && <Mail className="h-4 w-4" />}
            >
              {isEmailLoading ? 'Sending...' : 'Send Email'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
