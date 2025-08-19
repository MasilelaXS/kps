import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  FileText,
  Calendar,
  User,
  Building2,
  Edit3,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Archive,
  Target,
  Beaker,
  MapPin,
  ClipboardCheck,
  Trash2,
  Mail,
  Eye
} from 'lucide-react';
import { 
  Button,
  Chip,
  Card,
  CardBody,
  Divider,
  Accordion,
  AccordionItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@heroui/react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import type { DetailedReport } from '../../types/admin';

export const ReportView: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<DetailedReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Loading states for actions
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Modals
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();

  const loadReport = useCallback(async () => {
    if (!reportId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 Loading report with ID:', reportId);
      const response = await adminService.getReport(parseInt(reportId));
      console.log('📊 API Response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Report data received:', response.data);
        console.log('🎯 Inspection Stations:', response.data.inspection_stations);
        console.log('🎯 Stations (fallback):', response.data.stations);
        console.log('🧪 Fumigation Treatments:', response.data.fumigation_treatments);
        setReport(response.data);
      } else {
        setError(response.message || 'Failed to load report');
      }
    } catch (error) {
      console.error('❌ Error loading report:', error);
      setError('An error occurred while loading the report');
    } finally {
      setIsLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft': return 'default';
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'declined': return 'danger';
      case 'archived': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'declined': return <XCircle className="h-4 w-4" />;
      case 'pending': return <AlertTriangle className="h-4 w-4" />;
      case 'archived': return <Archive className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const handleDownload = async () => {
    if (!report) return;
    
    try {
      setDownloadLoading(true);
      const blob = await adminService.downloadReportPDF(report.id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${report.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleEmail = async () => {
    if (!report) return;
    
    if (report.status !== 'approved') {
      toast.error('Only approved reports can be emailed to clients');
      return;
    }
    
    try {
      setEmailLoading(true);
      const response = await adminService.emailReport(report.id);
      
      if (response.success) {
        toast.success(`Report emailed successfully to ${response.data?.recipient || 'client'}!`);
      } else {
        toast.error('Failed to email report');
      }
    } catch (error) {
      console.error('Error emailing report:', error);
      toast.error('An error occurred while emailing the report');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!report) return;
    
    try {
      setDeleteLoading(true);
      const isDraft = report.status === 'draft';
      const response = await adminService.deleteReport(report.id, !isDraft);
      
      if (response.success) {
        toast.success('Report deleted successfully!');
        navigate('/admin/reports');
      } else {
        toast.error('Failed to delete report');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('An error occurred while deleting the report');
    } finally {
      setDeleteLoading(false);
      onDeleteModalClose();
    }
  };

  const getLocationIcon = (location: string) => {
    return location === 'inside' ? (
      <Building2 className="h-4 w-4 text-blue-600" />
    ) : (
      <MapPin className="h-4 w-4 text-green-600" />
    );
  };

  const getActivityTypeDisplay = (activityType: string | null, activityTypeOther?: string) => {
    if (!activityType) return 'None';
    if (activityType === 'other' && activityTypeOther) return activityTypeOther;
    
    const types: Record<string, string> = {
      'droppings': 'Droppings',
      'gnaw_marks': 'Gnaw Marks', 
      'live_sighting': 'Live Sighting',
      'dead_pest': 'Dead Pest',
      'tracks': 'Tracks'
    };
    
    return types[activityType] || activityType;
  };

  const getBaitStatusColor = (status: string) => {
    switch (status) {
      case 'untouched': return 'success';
      case 'partially_consumed': return 'warning';
      case 'fully_consumed': return 'danger';
      case 'moldy': return 'secondary';
      case 'missing': return 'danger';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report details...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Report</h2>
          <p className="text-gray-600 mb-4">{error || 'Report not found'}</p>
          <Button
            color="primary"
            onPress={() => navigate('/admin/reports')}
            startContent={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Reports
          </Button>
        </div>
      </div>
    );
  }

  const inspectionStations = report.inspection_stations || report.stations || [];
  const fumigationTreatments = report.fumigation_treatments || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="light"
              onPress={() => navigate('/admin/reports')}
              startContent={<ArrowLeft className="h-4 w-4" />}
              className="text-gray-600 hover:text-gray-800"
            >
              Back to Reports
            </Button>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Report #{report.id}</h1>
              <p className="text-sm text-gray-500">{report.client?.name || 'Unknown Client'}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Button
              color="primary"
              variant="flat"
              onPress={() => navigate(`/admin/reports/${report.id}/edit`)}
              startContent={<Edit3 className="h-4 w-4" />}
            >
              Edit
            </Button>
            
            <Button
              color="success"
              variant="flat"
              onPress={handleDownload}
              startContent={<Download className="h-4 w-4" />}
              isLoading={downloadLoading}
            >
              Download
            </Button>
            
            <Button
              color="secondary"
              variant="flat"
              onPress={handleEmail}
              startContent={<Mail className="h-4 w-4" />}
              isLoading={emailLoading}
              isDisabled={report.status !== 'approved'}
            >
              Email
            </Button>
            
            <Button
              color="danger"
              variant="flat"
              onPress={onDeleteModalOpen}
              startContent={<Trash2 className="h-4 w-4" />}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Report Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Report Overview */}
            <Card className="report-card">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span>Report Overview</span>
                  </h2>
                  <Chip
                    color={getStatusColor(report.status)}
                    startContent={getStatusIcon(report.status)}
                    variant="flat"
                    size="lg"
                  >
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </Chip>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Report Type</label>
                    <p className="text-sm text-gray-900 mt-1 capitalize">{report.report_type}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Service Date</label>
                    <p className="text-sm text-gray-900 mt-1 flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{report.date_of_service || 'Not specified'}</span>
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Next Service Date</label>
                    <p className="text-sm text-gray-900 mt-1">{report.next_service_date || 'Not scheduled'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Warning Signs Replaced</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {report.warning_signs_replaced ? `Yes (${report.warning_signs_quantity || 0})` : 'No'}
                    </p>
                  </div>
                </div>

                {report.overall_remarks && (
                  <>
                    <Divider className="my-6" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Overall Remarks</label>
                      <p className="text-sm text-gray-900 mt-2 whitespace-pre-wrap">{report.overall_remarks}</p>
                    </div>
                  </>
                )}

                {report.recommendations && (
                  <>
                    <Divider className="my-6" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Recommendations</label>
                      <p className="text-sm text-gray-900 mt-2 whitespace-pre-wrap">{report.recommendations}</p>
                    </div>
                  </>
                )}

                {report.admin_notes && (
                  <>
                    <Divider className="my-6" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Admin Notes</label>
                      <p className="text-sm text-gray-900 mt-2 whitespace-pre-wrap bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        {report.admin_notes}
                      </p>
                    </div>
                  </>
                )}
              </CardBody>
            </Card>

            {/* Inspection Stations */}
            {inspectionStations.length > 0 && (
              <Card>
                <CardBody className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 mb-6">
                    <Target className="h-5 w-5 text-green-600" />
                    <span>Inspection Stations ({inspectionStations.length})</span>
                  </h2>

                  <Accordion variant="splitted">
                    {inspectionStations.map((station, index) => (
                      <AccordionItem
                        key={station.id || index}
                        title={
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-3">
                              {getLocationIcon(station.location)}
                              <span className="font-medium">
                                Station {station.station_number}
                              </span>
                              <span className="text-sm text-gray-500 capitalize">
                                ({station.location})
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {station.has_activity && (
                                <Chip size="sm" color="warning" variant="flat">Activity</Chip>
                              )}
                              <Chip
                                size="sm"
                                color={getBaitStatusColor(station.bait_status)}
                                variant="flat"
                              >
                                {station.bait_status.replace('_', ' ')}
                              </Chip>
                            </div>
                          </div>
                        }
                      >
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Accessibility</label>
                              <p className="text-sm text-gray-900 mt-1">
                                {station.is_accessible ? (
                                  <span className="flex items-center space-x-1 text-green-600">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Accessible</span>
                                  </span>
                                ) : (
                                  <span className="flex items-center space-x-1 text-red-600">
                                    <XCircle className="h-4 w-4" />
                                    <span>Not Accessible</span>
                                  </span>
                                )}
                              </p>
                              {!station.is_accessible && (station as any).access_reason && (
                                <p className="text-xs text-gray-600 mt-1">{(station as any).access_reason}</p>
                              )}
                            </div>
                            
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Activity Detected</label>
                              <p className="text-sm text-gray-900 mt-1">
                                {station.has_activity ? (
                                  <span className="text-orange-600">
                                    {getActivityTypeDisplay(station.activity_type, (station as any).activity_type_other)}
                                  </span>
                                ) : (
                                  <span className="text-green-600">No Activity</span>
                                )}
                              </p>
                              {station.has_activity && (station as any).activity_description && (
                                <p className="text-xs text-gray-600 mt-1">{(station as any).activity_description}</p>
                              )}
                            </div>
                          </div>

                          {Array.isArray((station as any).station_condition) && (station as any).station_condition.length > 0 && (
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Station Condition</label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {(station as any).station_condition.map((condition: string, idx: number) => (
                                  <Chip key={idx} size="sm" variant="flat" color="default">
                                    {condition.replace('_', ' ')}
                                  </Chip>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Chemical Used</label>
                              <p className="text-sm text-gray-900 mt-1">
                                {(station as any).chemical_name || 'Unknown Chemical'}
                              </p>
                              {(station as any).l_number && (
                                <p className="text-xs text-gray-600">L# {(station as any).l_number}</p>
                              )}
                            </div>
                            
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quantity</label>
                              <p className="text-sm text-gray-900 mt-1">{station.poison_quantity}g</p>
                            </div>
                            
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Batch Number</label>
                              <p className="text-sm text-gray-900 mt-1">{station.batch_number || 'Not specified'}</p>
                            </div>
                          </div>

                          {station.station_remarks && (
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Remarks</label>
                              <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{station.station_remarks}</p>
                            </div>
                          )}
                        </div>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardBody>
              </Card>
            )}

            {/* Fumigation Treatments */}
            {fumigationTreatments.length > 0 && (
              <Card>
                <CardBody className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 mb-6">
                    <Beaker className="h-5 w-5 text-purple-600" />
                    <span>Fumigation Treatments ({fumigationTreatments.length})</span>
                  </h2>

                  <Accordion variant="splitted" >
                    {fumigationTreatments.map((treatment, index) => (
                      <AccordionItem
                      className="!shadow-none px-6"
                        key={treatment.id || index}
                        title={
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-3">
                              <Beaker className="h-4 w-4 text-purple-600" />
                              <span className="font-medium">Treatment {index + 1}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Chip size="sm" color="secondary" variant="flat">
                                {treatment.chemicals?.length || 0} Chemicals
                              </Chip>
                              {treatment.insect_monitor_replaced && (
                                <Chip size="sm" color="success" variant="flat">Monitor Replaced</Chip>
                              )}
                            </div>
                          </div>
                        }
                      >
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Treated Areas</label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {treatment.treated_areas?.map((area, idx) => (
                                  <Chip key={idx} size="sm" variant="flat" color="primary">
                                    {area}
                                  </Chip>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Treated For</label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {treatment.treated_for?.map((pest, idx) => (
                                  <Chip key={idx} size="sm" variant="flat" color="warning">
                                    {pest}
                                  </Chip>
                                ))}
                              </div>
                            </div>
                          </div>

                          {treatment.chemicals && treatment.chemicals.length > 0 && (
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Chemicals Used</label>
                              <div className="space-y-3 mt-2">
                                {treatment.chemicals.map((chemical, idx) => (
                                  <div key={chemical.id || idx} className="bg-white p-3 rounded-lg border">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">
                                          {chemical.chemical_name || 'Unknown Chemical'}
                                        </p>
                                        {chemical.l_number && (
                                          <p className="text-xs text-gray-600">L# {chemical.l_number}</p>
                                        )}
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-900">{chemical.quantity}ml</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-900">{chemical.batch_number}</p>
                                        {chemical.batch_number_note && (
                                          <p className="text-xs text-gray-600">{chemical.batch_number_note}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {treatment.general_remarks && (
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">General Remarks</label>
                              <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{treatment.general_remarks}</p>
                            </div>
                          )}
                        </div>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Right Column - Client & PCO Info */}
          <div className="space-y-6">
            
            {/* Client Information */}
            <Card>
              <CardBody className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 mb-4">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <span>Client Information</span>
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-sm text-gray-900 mt-1">{report.client?.name || 'Unknown Client'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-sm text-gray-900 mt-1">{report.client?.address || 'Not provided'}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* PCO Information */}
            <Card>
              <CardBody className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 mb-4">
                  <User className="h-5 w-5 text-green-600" />
                  <span>PCO Information</span>
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-sm text-gray-900 mt-1">{report.pco?.name || 'Unknown PCO'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">PCO Number</label>
                    <p className="text-sm text-gray-900 mt-1">{report.pco?.pco_number || 'Not provided'}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Report Metadata */}
            <Card>
              <CardBody className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 mb-4">
                  <ClipboardCheck className="h-5 w-5 text-purple-600" />
                  <span>Report Details</span>
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(report.created_at).toLocaleString()}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(report.updated_at).toLocaleString()}
                    </p>
                  </div>
                  
                  {report.reviewed_at && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Reviewed</label>
                        <p className="text-sm text-gray-900 mt-1">
                          {new Date(report.reviewed_at).toLocaleString()}
                        </p>
                      </div>
                      
                      {report.reviewed_by_name && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Reviewed By</label>
                          <p className="text-sm text-gray-900 mt-1">{report.reviewed_by_name}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose} size="md">
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center space-x-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              <span>Delete Report</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <p className="text-gray-600">
              Are you sure you want to delete this report? This action cannot be undone.
            </p>
            {report?.status !== 'draft' && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Non-draft reports will be archived instead of permanently deleted.
                </p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={onDeleteModalClose}
              isDisabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={handleDelete}
              isLoading={deleteLoading}
            >
              Delete Report
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
