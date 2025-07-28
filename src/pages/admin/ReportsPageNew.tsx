import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText,
  Calendar,
  User,
  Building2,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Archive,
  AlertTriangle,
  Loader2,
  ChevronDown,
  Edit3,
  TrendingUp,
  Activity
} from 'lucide-react';
import { 
  Button,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  Chip,
  useDisclosure
} from '@heroui/react';
import toast from 'react-hot-toast';
import { adminService, type Report } from '../../services/adminService';

export const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [reports, setReports] = useState<Report[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    declined: 0,
    archived: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reportTypeFilter, setReportTypeFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'decline' | 'archive'>('approve');
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (reportTypeFilter !== 'all') {
        params.report_type = reportTypeFilter;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await adminService.getReports(params);
      if (response.data) {
        setReports(response.data.reports);
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, reportTypeFilter]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleStatusUpdate = async () => {
    if (!selectedReport) return;

    try {
      setActionLoading(true);
      await adminService.updateReportStatus(selectedReport.id, {
        status: actionType,
        admin_notes: adminNotes
      });
      toast.success(`Report ${actionType}d successfully`);
      onClose();
      setSelectedReport(null);
      setAdminNotes('');
      loadReports();
    } catch (error) {
      console.error('Error updating report status:', error);
      toast.error(`Failed to ${actionType} report`);
    } finally {
      setActionLoading(false);
    }
  };

  const openActionModal = (report: Report, action: 'approve' | 'decline' | 'archive') => {
    setSelectedReport(report);
    setActionType(action);
    onOpen();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'declined': return 'danger';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return AlertTriangle;
      case 'approved': return CheckCircle;
      case 'declined': return XCircle;
      case 'archived': return Archive;
      default: return FileText;
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = searchTerm === '' || 
      report.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.pco.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.pco.pco_number.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Reports Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              Review and manage PCO reports across all clients
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="light"
              startContent={<TrendingUp className="w-5 h-5" />}
              className="text-purple-600 hover:text-purple-700"
            >
              Analytics
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{summary.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{summary.approved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Declined</p>
                <p className="text-2xl font-bold text-gray-900">{summary.declined}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <Archive className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Archived</p>
                <p className="text-2xl font-bold text-gray-900">{summary.archived}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by client name, PCO name, or PCO number..."
                value={searchTerm}
                onValueChange={setSearchTerm}
                startContent={<Search className="text-gray-400 h-4 w-4" />}
                classNames={{
                  input: "focus:ring-purple-500",
                  inputWrapper: "focus-within:border-purple-500 hover:border-purple-300 border-gray-300"
                }}
              />
            </div>
            
            <div className="flex gap-4">
              <Dropdown>
                <DropdownTrigger>
                  <Button 
                    variant="bordered" 
                    className="min-w-[150px] justify-between border-gray-300 hover:border-purple-500 focus:border-purple-500"
                    endContent={<ChevronDown className="h-4 w-4" />}
                  >
                    {statusFilter === 'all' ? 'All Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu 
                  aria-label="Status filter"
                  onAction={(key) => setStatusFilter(key as string)}
                  selectedKeys={[statusFilter]}
                  selectionMode="single"
                >
                  <DropdownItem key="all">All Status</DropdownItem>
                  <DropdownItem key="pending">Pending</DropdownItem>
                  <DropdownItem key="approved">Approved</DropdownItem>
                  <DropdownItem key="declined">Declined</DropdownItem>
                  <DropdownItem key="archived">Archived</DropdownItem>
                </DropdownMenu>
              </Dropdown>
              
              <Dropdown>
                <DropdownTrigger>
                  <Button 
                    variant="bordered" 
                    className="min-w-[150px] justify-between border-gray-300 hover:border-purple-500 focus:border-purple-500"
                    endContent={<ChevronDown className="h-4 w-4" />}
                  >
                    {reportTypeFilter === 'all' ? 'All Types' : reportTypeFilter.charAt(0).toUpperCase() + reportTypeFilter.slice(1)}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu 
                  aria-label="Report type filter"
                  onAction={(key) => setReportTypeFilter(key as string)}
                  selectedKeys={[reportTypeFilter]}
                  selectionMode="single"
                >
                  <DropdownItem key="all">All Types</DropdownItem>
                  <DropdownItem key="inspection">Inspection</DropdownItem>
                  <DropdownItem key="fumigation">Fumigation</DropdownItem>
                  <DropdownItem key="both">Both</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Reports</h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredReports.length} reports found
            </p>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <span className="ml-2 text-gray-500">Loading reports...</span>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredReports.map((report) => {
                const StatusIcon = getStatusIcon(report.status);
                return (
                  <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Report Info */}
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              Report #{report.id}
                            </div>
                            <div className="text-xs text-gray-500">
                              {report.station_count} stations • {report.chemicals_used} chemicals
                            </div>
                            {report.has_missing_batch_numbers && (
                              <div className="flex items-center mt-1">
                                <AlertTriangle className="h-3 w-3 text-orange-500 mr-1" />
                                <span className="text-xs text-orange-600">Missing batch numbers</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Client Info */}
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {report.client.name}
                            </div>
                            <div className="text-xs text-gray-500">ID: {report.client.id}</div>
                          </div>
                        </div>

                        {/* PCO Info */}
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <User className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {report.pco.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              PCO: {report.pco.pco_number}
                            </div>
                          </div>
                        </div>

                        {/* Status and Date */}
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2">
                              <Chip 
                                color="secondary" 
                                variant="flat" 
                                size="sm"
                                className="bg-purple-100 text-purple-800"
                              >
                                {report.report_type}
                              </Chip>
                              <div className="flex items-center">
                                <StatusIcon className="h-3 w-3 mr-1" />
                                <Chip 
                                  color={getStatusColor(report.status)}
                                  variant="flat"
                                  size="sm"
                                >
                                  {report.status}
                                </Chip>
                              </div>
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(report.created_at)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => navigate(`/admin/reports/${report.id}/edit`)}
                          className="text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        
                        {report.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="light"
                              onPress={() => openActionModal(report, 'approve')}
                              className="text-green-600 hover:text-green-800 hover:bg-green-50"
                              startContent={<CheckCircle className="h-4 w-4" />}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="light"
                              onPress={() => openActionModal(report, 'decline')}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              startContent={<XCircle className="h-4 w-4" />}
                            >
                              Decline
                            </Button>
                          </>
                        )}
                        
                        {report.status !== 'archived' && (
                          <Button
                            size="sm"
                            variant="light"
                            onPress={() => openActionModal(report, 'archive')}
                            className="text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                            startContent={<Archive className="h-4 w-4" />}
                          >
                            Archive
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Action Modal */}
      <Modal isOpen={isOpen} onClose={onClose} placement="center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {actionType === 'approve' && 'Approve Report'}
                {actionType === 'decline' && 'Decline Report'}
                {actionType === 'archive' && 'Archive Report'}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Are you sure you want to {actionType} this report?
                    {selectedReport && (
                      <span className="font-medium">
                        {' '}Report #{selectedReport.id} from {selectedReport.client.name}
                      </span>
                    )}
                  </p>
                  
                  <Textarea
                    label="Admin Notes"
                    placeholder={`Enter notes for ${actionType}ing this report...`}
                    value={adminNotes}
                    onValueChange={setAdminNotes}
                    rows={3}
                    classNames={{
                      input: "focus:ring-purple-500",
                      inputWrapper: "focus-within:border-purple-500 hover:border-purple-300 border-gray-300"
                    }}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  onPress={handleStatusUpdate}
                  isLoading={actionLoading}
                  className={
                    actionType === 'decline' 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }
                >
                  {actionLoading ? 'Processing...' : `${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Report`}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
