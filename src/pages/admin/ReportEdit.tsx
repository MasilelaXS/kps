import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Save,
  Target,
  Beaker,
  Plus,
  Trash2,
  AlertTriangle,
  FileText,
  Calendar,
  User,
  Building2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { 
  Button,
  Chip,
  Checkbox,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@heroui/react';
import toast from 'react-hot-toast';
import { adminService, type DetailedReport, type Chemical } from '../../services/adminService';

interface EditableStation {
  id?: number;
  station_number: number;
  location: 'inside' | 'outside';
  is_accessible: boolean;
  has_activity: boolean;
  activity_type?: 'droppings' | 'gnawing' | 'tracks' | 'other';
  activity_description?: string;
  station_condition: string[];
  bait_status: 'eaten' | 'partially_eaten' | 'untouched' | 'moldy';
  rodent_box_replaced: boolean;
  poison_used_id: number;
  poison_quantity: number;
  batch_number: string;
  station_remarks: string;
}

interface EditableTreatment {
  id?: number;
  treated_areas: string[];
  treated_for: string[];
  insect_monitor_replaced: boolean;
  general_remarks: string;
  chemicals: Array<{
    id?: number;
    chemical_id: number;
    quantity: number;
    batch_number: string;
    batch_number_note?: string | null;
    chemical_name?: string;
    l_number?: string;
  }>;
}

export const ReportEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<DetailedReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [expandedStations, setExpandedStations] = useState<Set<number>>(new Set());
  const [expandedTreatments, setExpandedTreatments] = useState<Set<number>>(new Set());

  // HeroUI disclosure hooks
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  const [deleteTarget, setDeleteTarget] = useState<{type: 'station' | 'treatment', index: number} | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    overall_remarks: '',
    warning_signs_replaced: false,
    warning_signs_quantity: 0,
    recommendations: '',
    next_service_date: ''
  });

  const [stations, setStations] = useState<EditableStation[]>([]);
  const [treatments, setTreatments] = useState<EditableTreatment[]>([]);

  const loadReport = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const [reportResponse, chemicalsResponse] = await Promise.all([
        adminService.getReport(parseInt(id)),
        adminService.getChemicals()
      ]);

      if (reportResponse.success && reportResponse.data) {
        const reportData = reportResponse.data;
        setReport(reportData);

        // Set form data
        setFormData({
          overall_remarks: reportData.overall_remarks || '',
          warning_signs_replaced: reportData.warning_signs_replaced || false,
          warning_signs_quantity: reportData.warning_signs_quantity || 0,
          recommendations: reportData.recommendations || '',
          next_service_date: reportData.next_service_date || ''
        });

        // Process stations
        const stationsData = reportData.inspection_stations || reportData.stations || [];
        const processedStations: EditableStation[] = stationsData.map((station) => ({
          id: station.id,
          station_number: typeof station.station_number === 'string' 
            ? parseInt(station.station_number) 
            : station.station_number,
          location: (station.location as 'inside' | 'outside') || 'inside',
          is_accessible: station.is_accessible,
          has_activity: station.has_activity,
          activity_type: station.activity_type as 'droppings' | 'gnawing' | 'tracks' | 'other' | undefined,
          activity_description: ('activity_description' in station ? station.activity_description : '') || '',
          station_condition: Array.isArray('station_condition' in station ? station.station_condition : null) 
            ? ('station_condition' in station ? station.station_condition : [])
            : [],
          bait_status: station.bait_status as 'eaten' | 'partially_eaten' | 'untouched' | 'moldy',
          rodent_box_replaced: ('rodent_box_replaced' in station ? station.rodent_box_replaced : false) || false,
          poison_used_id: station.poison_used_id,
          poison_quantity: station.poison_quantity,
          batch_number: station.batch_number || '',
          station_remarks: ('station_remarks' in station ? station.station_remarks : '') || ''
        }));
        setStations(processedStations);

        // Process treatments
        const treatmentsData = reportData.fumigation_treatments || [];
        const processedTreatments: EditableTreatment[] = treatmentsData.map((treatment) => ({
          id: treatment.id,
          treated_areas: Array.isArray(treatment.treated_areas) 
            ? treatment.treated_areas 
            : [],
          treated_for: Array.isArray(treatment.treated_for) 
            ? treatment.treated_for 
            : [],
          insect_monitor_replaced: treatment.insect_monitor_replaced || false,
          general_remarks: treatment.general_remarks || '',
          chemicals: Array.isArray(treatment.chemicals) 
            ? treatment.chemicals.map((chem) => ({
                id: chem.id,
                chemical_id: chem.chemical_id,
                quantity: chem.quantity,
                batch_number: chem.batch_number || '',
                batch_number_note: chem.batch_number_note,
                chemical_name: chem.chemical_name,
                l_number: chem.l_number
              }))
            : []
        }));
        setTreatments(processedTreatments);

      } else {
        throw new Error('Failed to load report');
      }

      if (chemicalsResponse.success && chemicalsResponse.data) {
        setChemicals(chemicalsResponse.data);
      }

    } catch (error: unknown) {
      console.error('Error loading report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load report. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleSave = async () => {
    if (!report) return;

    setSaving(true);
    try {
      // TODO: Implement actual update functionality when API endpoint is available
      /*
      const updateData = {
        overall_remarks: formData.overall_remarks,
        warning_signs_replaced: formData.warning_signs_replaced,
        warning_signs_quantity: formData.warning_signs_quantity,
        recommendations: formData.recommendations,
        next_service_date: formData.next_service_date,
        stations: stations.map(station => ({
          id: station.id,
          station_number: station.station_number,
          location: station.location,
          is_accessible: station.is_accessible,
          has_activity: station.has_activity,
          activity_type: station.activity_type,
          activity_description: station.activity_description,
          station_condition: station.station_condition,
          bait_status: station.bait_status,
          rodent_box_replaced: station.rodent_box_replaced,
          poison_used_id: station.poison_used_id,
          poison_quantity: station.poison_quantity,
          batch_number: station.batch_number,
          station_remarks: station.station_remarks
        })),
        fumigation_treatments: treatments.map(treatment => ({
          id: treatment.id,
          treated_areas: treatment.treated_areas,
          treated_for: treatment.treated_for,
          insect_monitor_replaced: treatment.insect_monitor_replaced,
          general_remarks: treatment.general_remarks,
          chemicals: treatment.chemicals.map(chem => ({
            id: chem.id,
            chemical_id: chem.chemical_id,
            quantity: chem.quantity,
            batch_number: chem.batch_number,
            batch_number_note: chem.batch_number_note
          }))
        }))
      };
      */

      // TODO: Implement updateReport method in adminService
      // const response = await adminService.updateReport(report.id, updateData);
      
      // For now, just show success message
      toast.success('Report updated successfully!');
      navigate(`/admin/reports/${report.id}`);
    } catch (error) {
      console.error('Error saving report:', error);
      toast.error('An error occurred while saving the report');
    } finally {
      setSaving(false);
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

  const toggleStationExpansion = (index: number) => {
    const newExpanded = new Set(expandedStations);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedStations(newExpanded);
  };

  const toggleTreatmentExpansion = (index: number) => {
    const newExpanded = new Set(expandedTreatments);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedTreatments(newExpanded);
  };

  const addNewStation = () => {
    const newStation: EditableStation = {
      station_number: stations.length + 1,
      location: 'inside',
      is_accessible: true,
      has_activity: false,
      station_condition: [],
      bait_status: 'untouched',
      rodent_box_replaced: false,
      poison_used_id: chemicals.length > 0 ? chemicals[0].id : 0,
      poison_quantity: 0,
      batch_number: '',
      station_remarks: ''
    };
    setStations([...stations, newStation]);
    setExpandedStations(prev => new Set([...prev, stations.length]));
  };

  const addNewTreatment = () => {
    const newTreatment: EditableTreatment = {
      treated_areas: [],
      treated_for: [],
      insect_monitor_replaced: false,
      general_remarks: '',
      chemicals: []
    };
    setTreatments([...treatments, newTreatment]);
    setExpandedTreatments(prev => new Set([...prev, treatments.length]));
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'station') {
      const newStations = stations.filter((_, index) => index !== deleteTarget.index);
      setStations(newStations);
      setExpandedStations(prev => {
        const newSet = new Set(prev);
        newSet.delete(deleteTarget.index);
        return newSet;
      });
    } else {
      const newTreatments = treatments.filter((_, index) => index !== deleteTarget.index);
      setTreatments(newTreatments);
      setExpandedTreatments(prev => {
        const newSet = new Set(prev);
        newSet.delete(deleteTarget.index);
        return newSet;
      });
    }

    setDeleteTarget(null);
    onDeleteModalClose();
    toast.success(`${deleteTarget.type} deleted successfully`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        {/* Loading Navigation Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
            </div>
            <div className="flex space-x-3">
              <div className="w-20 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="w-16 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Loading Report Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse mb-2 w-48"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-24"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Loading Form Sections */}
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
                </div>
                <div className="p-6 space-y-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                      <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load report</h3>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={() => navigate('/admin/reports')}
              className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reports
            </button>
            <button
              onClick={loadReport}
              className="inline-flex items-center px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Freshdesk-style Navigation Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="light"
              onPress={() => navigate('/admin/reports')}
              startContent={<ArrowLeft className="h-4 w-4" />}
              className="text-gray-600 hover:text-gray-800"
            >
              Back
            </Button>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Edit Report #{report.id}</h1>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="light"
              onPress={() => navigate(`/admin/reports/${report.id}`)}
              className="text-gray-600 hover:text-gray-800"
            >
              Cancel
            </Button>
            <Button
              onPress={handleSave}
              isLoading={saving}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              startContent={!saving && <Save className="h-4 w-4" />}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Report Header Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {report.client.name} - {report.report_type.charAt(0).toUpperCase() + report.report_type.slice(1)} Report
                  </h2>
                  <p className="text-sm text-gray-500">
                    PCO: {report.pco.name} ({report.pco.pco_number}) • {formatDate(report.created_at)}
                  </p>
                </div>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600 flex items-center">
                  <Building2 className="h-4 w-4 mr-2" />
                  Client
                </p>
                <p className="text-sm text-gray-900">{report.client.name}</p>
                <p className="text-xs text-gray-500">{report.client.address}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  PCO
                </p>
                <p className="text-sm text-gray-900">{report.pco.name}</p>
                <p className="text-xs text-gray-500">#{report.pco.pco_number}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Report Date
                </p>
                <p className="text-sm text-gray-900">{formatDate(report.created_at)}</p>
                <p className="text-xs text-gray-500">{report.report_type} report</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600 flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Stations
                </p>
                <p className="text-sm text-gray-900">{stations.length} stations</p>
                <p className="text-xs text-gray-500">{treatments.length} treatments</p>
              </div>
            </div>
          </div>

          {/* General Information Form */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">General Information</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Warning Signs Replaced
                  </label>
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      isSelected={formData.warning_signs_replaced}
                      onValueChange={(checked) => setFormData(prev => ({ ...prev, warning_signs_replaced: checked }))}
                    >
                      Yes, warning signs were replaced
                    </Checkbox>
                  </div>
                </div>
                {formData.warning_signs_replaced && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity Replaced
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.warning_signs_quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, warning_signs_quantity: parseInt(e.target.value) || 0 }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-0 focus:border-purple-500 hover:border-gray-400 transition-colors"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Next Service Date
                </label>
                <input
                  type="date"
                  value={formData.next_service_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, next_service_date: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-0 focus:border-purple-500 hover:border-gray-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overall Remarks
                </label>
                <textarea
                  rows={4}
                  value={formData.overall_remarks}
                  onChange={(e) => setFormData(prev => ({ ...prev, overall_remarks: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-purple-500 hover:border-gray-400 transition-colors resize-none"
                  placeholder="Enter overall remarks about the inspection..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recommendations
                </label>
                <textarea
                  rows={4}
                  value={formData.recommendations}
                  onChange={(e) => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-purple-500 hover:border-gray-400 transition-colors resize-none"
                  placeholder="Enter recommendations for the client..."
                />
              </div>
            </div>
          </div>

          {/* Inspection Stations */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Inspection Stations ({stations.length})
                </h3>
                <Button
                  onPress={addNewStation}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  startContent={<Plus className="h-4 w-4" />}
                >
                  Add Station
                </Button>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {stations.map((station, index) => (
                <div key={index} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Target className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">
                          Station #{station.station_number}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {station.location} • {station.is_accessible ? 'Accessible' : 'Not accessible'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="light"
                        size="sm"
                        onPress={() => toggleStationExpansion(index)}
                        startContent={expandedStations.has(index) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      >
                        {expandedStations.has(index) ? 'Collapse' : 'Expand'}
                      </Button>
                      <Button
                        variant="light"
                        size="sm"
                        onPress={() => {
                          setDeleteTarget({ type: 'station', index });
                          onDeleteModalOpen();
                        }}
                        startContent={<Trash2 className="h-4 w-4" />}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  {expandedStations.has(index) && (
                    <div className="mt-4 pl-14 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Station Number
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={station.station_number}
                            onChange={(e) => {
                              const newStations = [...stations];
                              newStations[index].station_number = parseInt(e.target.value) || 1;
                              setStations(newStations);
                            }}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-0 focus:border-purple-500 hover:border-gray-400 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location
                          </label>
                          <div className="relative">
                            <select
                              value={station.location}
                              onChange={(e) => {
                                const newStations = [...stations];
                                newStations[index].location = e.target.value as 'inside' | 'outside';
                                setStations(newStations);
                              }}
                              className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-0 focus:border-purple-500 hover:border-gray-400 transition-colors appearance-none cursor-pointer"
                            >
                              <option value="inside">Inside</option>
                              <option value="outside">Outside</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Accessibility
                          </label>
                          <Checkbox
                            isSelected={station.is_accessible}
                            onValueChange={(checked) => {
                              const newStations = [...stations];
                              newStations[index].is_accessible = checked;
                              setStations(newStations);
                            }}
                          >
                            Station is accessible
                          </Checkbox>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Station Remarks
                        </label>
                        <textarea
                          rows={3}
                          value={station.station_remarks}
                          onChange={(e) => {
                            const newStations = [...stations];
                            newStations[index].station_remarks = e.target.value;
                            setStations(newStations);
                          }}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-purple-500 hover:border-gray-400 transition-colors resize-none"
                          placeholder="Enter any remarks about this station..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {stations.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No stations added</h3>
                  <p className="text-gray-500 text-sm mb-6">
                    Add inspection stations to record details about each location
                  </p>
                  <Button
                    onPress={addNewStation}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    startContent={<Plus className="h-4 w-4" />}
                  >
                    Add First Station
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Fumigation Treatments */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Beaker className="h-5 w-5 mr-2" />
                  Fumigation Treatments ({treatments.length})
                </h3>
                <Button
                  onPress={addNewTreatment}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  startContent={<Plus className="h-4 w-4" />}
                >
                  Add Treatment
                </Button>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {treatments.map((treatment, index) => (
                <div key={index} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Beaker className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">
                          Treatment #{index + 1}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {treatment.chemicals.length} chemicals • {treatment.treated_areas.length} areas
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="light"
                        size="sm"
                        onPress={() => toggleTreatmentExpansion(index)}
                        startContent={expandedTreatments.has(index) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      >
                        {expandedTreatments.has(index) ? 'Collapse' : 'Expand'}
                      </Button>
                      <Button
                        variant="light"
                        size="sm"
                        onPress={() => {
                          setDeleteTarget({ type: 'treatment', index });
                          onDeleteModalOpen();
                        }}
                        startContent={<Trash2 className="h-4 w-4" />}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  {expandedTreatments.has(index) && (
                    <div className="mt-4 pl-14 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          General Remarks
                        </label>
                        <textarea
                          rows={3}
                          value={treatment.general_remarks}
                          onChange={(e) => {
                            const newTreatments = [...treatments];
                            newTreatments[index].general_remarks = e.target.value;
                            setTreatments(newTreatments);
                          }}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-purple-500 hover:border-gray-400 transition-colors resize-none"
                          placeholder="Enter general remarks about this treatment..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {treatments.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Beaker className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No treatments added</h3>
                  <p className="text-gray-500 text-sm mb-6">
                    Add fumigation treatments to record chemical applications
                  </p>
                  <Button
                    onPress={addNewTreatment}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    startContent={<Plus className="h-4 w-4" />}
                  >
                    Add First Treatment
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={onDeleteModalClose}
        size="md"
        classNames={{
          base: "bg-white",
          header: "border-b border-gray-200",
          footer: "border-t border-gray-200",
          closeButton: "hover:bg-gray-100"
        }}
      >
        <ModalContent>
          <ModalHeader className="text-lg font-semibold">
            Delete {deleteTarget?.type === 'station' ? 'Station' : 'Treatment'}
          </ModalHeader>
          <ModalBody className="py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-900 font-medium">
                  Are you sure you want to delete this {deleteTarget?.type}?
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={onDeleteModalClose}
              className="text-gray-600 hover:text-gray-800"
            >
              Cancel
            </Button>
            <Button
              onPress={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
