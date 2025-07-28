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
  Loader2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { 
  Button,
  Input,
  Textarea,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  Checkbox,
  Card,
  CardBody,
  Divider
} from '@heroui/react';
import toast from 'react-hot-toast';
import { adminService, type DetailedReport, type Chemical } from '../../services/adminService';

// Union type for station data from different API endpoints
type StationData = NonNullable<DetailedReport['inspection_stations']>[0] | NonNullable<DetailedReport['stations']>[0];

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
    chemical_id: number;
    quantity: number;
    batch_number: string;
    batch_number_note?: string;
  }>;
}

interface EditForm {
  overall_remarks: string;
  recommendations: string;
  next_service_date: string;
  warning_signs_replaced: boolean;
  warning_signs_quantity: number;
}

// Helper function to safely parse array fields that might be JSON strings
const safeParseArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter(item => typeof item === 'string');
  }
  
  if (typeof value === 'string') {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => typeof item === 'string');
      }
      // If it's a single string, split by comma
      return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    } catch {
      // If JSON parsing fails, split by comma
      return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }
  }
  
  return [];
};

export const ReportEdit: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  
  const [report, setReport] = useState<DetailedReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data
  const [editForm, setEditForm] = useState<EditForm>({
    overall_remarks: '',
    recommendations: '',
    next_service_date: '',
    warning_signs_replaced: false,
    warning_signs_quantity: 0
  });
  
  const [editingStations, setEditingStations] = useState<EditableStation[]>([]);
  const [editingTreatments, setEditingTreatments] = useState<EditableTreatment[]>([]);
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [expandedStations, setExpandedStations] = useState<Set<number>>(new Set());
  const [expandedTreatments, setExpandedTreatments] = useState<Set<number>>(new Set());

  // Load report data
  const loadReport = useCallback(async () => {
    if (!reportId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [reportResponse, chemicalsResponse] = await Promise.all([
        adminService.getReport(parseInt(reportId)),
        adminService.getChemicals()
      ]);
      
      if (reportResponse.success && reportResponse.data) {
        const reportData = reportResponse.data;
        setReport(reportData);
        
        // Set basic form data
        setEditForm({
          overall_remarks: reportData.overall_remarks || '',
          recommendations: reportData.recommendations || '',
          next_service_date: reportData.next_service_date || '',
          warning_signs_replaced: reportData.warning_signs_replaced || false,
          warning_signs_quantity: reportData.warning_signs_quantity || 0
        });

        // Normalize and set stations data
        const stationsData = reportData.inspection_stations || reportData.stations || [];
        setEditingStations(stationsData.map((station: StationData) => ({
          id: station.id,
          station_number: typeof station.station_number === 'string' 
            ? parseInt(station.station_number) 
            : station.station_number,
          location: station.location as 'inside' | 'outside',
          is_accessible: station.is_accessible,
          has_activity: station.has_activity,
          activity_type: station.activity_type as 'droppings' | 'gnawing' | 'tracks' | 'other' | undefined,
          activity_description: 'activity_description' in station ? station.activity_description || '' : '',
          station_condition: safeParseArray('station_condition' in station ? station.station_condition : []),
          bait_status: station.bait_status as 'eaten' | 'partially_eaten' | 'untouched' | 'moldy',
          rodent_box_replaced: 'rodent_box_replaced' in station ? station.rodent_box_replaced || false : false,
          poison_used_id: station.poison_used_id || 0,
          poison_quantity: station.poison_quantity || 0,
          batch_number: station.batch_number || '',
          station_remarks: station.station_remarks || ''
        })));

        // Normalize and set treatments data
        const treatmentsData = reportData.fumigation_treatments || [];
        setEditingTreatments(treatmentsData.map((treatment: DetailedReport['fumigation_treatments'][0]) => ({
          id: treatment.id,
          treated_areas: safeParseArray(treatment.treated_areas),
          treated_for: safeParseArray(treatment.treated_for),
          insect_monitor_replaced: treatment.insect_monitor_replaced || false,
          general_remarks: treatment.general_remarks || '',
          chemicals: treatment.chemicals ? treatment.chemicals.map((chem: DetailedReport['fumigation_treatments'][0]['chemicals'][0]) => ({
            chemical_id: chem.chemical_id,
            quantity: chem.quantity,
            batch_number: chem.batch_number || '',
            batch_number_note: chem.batch_number_note || undefined
          })) : []
        })));
      } else {
        setError('Failed to load report');
      }
      
      if (chemicalsResponse.success && chemicalsResponse.data) {
        setChemicals(chemicalsResponse.data);
      }
    } catch (err) {
      console.error('Failed to load report:', err);
      setError('Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  // Station management
  const addStation = () => {
    const newStation: EditableStation = {
      station_number: editingStations.length + 1,
      location: 'inside',
      is_accessible: true,
      has_activity: false,
      station_condition: [],
      bait_status: 'untouched',
      rodent_box_replaced: false,
      poison_used_id: 0,
      poison_quantity: 0,
      batch_number: '',
      station_remarks: ''
    };
    setEditingStations([...editingStations, newStation]);
  };

  const updateStation = (index: number, field: keyof EditableStation, value: unknown) => {
    const updated = [...editingStations];
    updated[index] = { ...updated[index], [field]: value };
    setEditingStations(updated);
  };

  const removeStation = (index: number) => {
    setEditingStations(editingStations.filter((_, i) => i !== index));
  };

  // Treatment management
  const addTreatment = () => {
    const newTreatment: EditableTreatment = {
      treated_areas: [],
      treated_for: [],
      insect_monitor_replaced: false,
      general_remarks: '',
      chemicals: []
    };
    setEditingTreatments([...editingTreatments, newTreatment]);
  };

  const updateTreatment = (index: number, field: keyof EditableTreatment, value: unknown) => {
    const updated = [...editingTreatments];
    updated[index] = { ...updated[index], [field]: value };
    setEditingTreatments(updated);
  };

  const removeTreatment = (index: number) => {
    setEditingTreatments(editingTreatments.filter((_, i) => i !== index));
  };

  // Accordion management
  const toggleStationAccordion = (index: number) => {
    const newExpanded = new Set(expandedStations);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedStations(newExpanded);
  };

  const toggleTreatmentAccordion = (index: number) => {
    const newExpanded = new Set(expandedTreatments);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedTreatments(newExpanded);
  };

  // Chemical management for treatments
  const addChemicalToTreatment = (treatmentIndex: number) => {
    const updated = [...editingTreatments];
    updated[treatmentIndex].chemicals.push({
      chemical_id: 0,
      quantity: 0,
      batch_number: ''
    });
    setEditingTreatments(updated);
  };

  const updateTreatmentChemical = (treatmentIndex: number, chemicalIndex: number, field: keyof EditableTreatment['chemicals'][0], value: unknown) => {
    const updated = [...editingTreatments];
    updated[treatmentIndex].chemicals[chemicalIndex] = {
      ...updated[treatmentIndex].chemicals[chemicalIndex],
      [field]: value
    };
    setEditingTreatments(updated);
  };

  const removeTreatmentChemical = (treatmentIndex: number, chemicalIndex: number) => {
    const updated = [...editingTreatments];
    updated[treatmentIndex].chemicals.splice(chemicalIndex, 1);
    setEditingTreatments(updated);
  };

  // Save changes
  const handleSave = async () => {
    if (!report) return;

    try {
      setSaving(true);
      
      const updateData = {
        overall_remarks: editForm.overall_remarks,
        recommendations: editForm.recommendations,
        next_service_date: editForm.next_service_date,
        warning_signs_replaced: editForm.warning_signs_replaced,
        warning_signs_quantity: editForm.warning_signs_quantity,
        stations: editingStations,
        treatments: editingTreatments
      };

      const response = await adminService.updateReport(report.id, updateData);
      
      if (response.success) {
        toast.success('Report updated successfully!');
        navigate('/admin/reports');
      } else {
        throw new Error(response.message || 'Failed to update report');
      }
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('Failed to update report');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Report</h2>
          <p className="text-gray-600 mb-4">{error || 'Report not found'}</p>
          <Button onPress={() => navigate('/admin/reports')} className="bg-purple-600 text-white">
            Back to Reports
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              isIconOnly
              variant="light"
              onPress={() => navigate('/admin/reports')}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Edit Report #{report.id}</h1>
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center text-sm text-gray-500">
                  <Building2 className="w-4 h-4 mr-1" />
                  {report.client.name}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <User className="w-4 h-4 mr-1" />
                  {report.pco.name} ({report.pco.pco_number})
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(report.created_at)}
                </div>
                <Chip 
                  color="secondary" 
                  variant="flat" 
                  size="sm"
                  className="bg-purple-100 text-purple-800"
                >
                  {report.report_type}
                </Chip>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="light"
              onPress={() => navigate('/admin/reports')}
              className="text-gray-600 hover:text-gray-800"
            >
              Cancel
            </Button>
            <Button
              onPress={handleSave}
              isLoading={saving}
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              startContent={!saving ? <Save className="w-4 h-4" /> : undefined}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Report Summary */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardBody className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Report Summary</h2>
                <p className="text-sm text-gray-500">General information and recommendations</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Overall Remarks</label>
                  <Textarea
                    value={editForm.overall_remarks}
                    onValueChange={(value) => setEditForm({ ...editForm, overall_remarks: value })}
                    placeholder="Enter overall remarks about the service..."
                    rows={4}
                    classNames={{
                      input: "focus:ring-purple-500",
                      inputWrapper: "focus-within:border-purple-500 hover:border-purple-300 border-gray-300"
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recommendations</label>
                  <Textarea
                    value={editForm.recommendations}
                    onValueChange={(value) => setEditForm({ ...editForm, recommendations: value })}
                    placeholder="Enter recommendations for the client..."
                    rows={4}
                    classNames={{
                      input: "focus:ring-purple-500",
                      inputWrapper: "focus-within:border-purple-500 hover:border-purple-300 border-gray-300"
                    }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Next Service Date</label>
                  <Input
                    type="date"
                    value={editForm.next_service_date}
                    onValueChange={(value) => setEditForm({ ...editForm, next_service_date: value })}
                    classNames={{
                      input: "focus:ring-purple-500",
                      inputWrapper: "focus-within:border-purple-500 hover:border-purple-300 border-gray-300"
                    }}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      isSelected={editForm.warning_signs_replaced}
                      onValueChange={(checked) => setEditForm({ ...editForm, warning_signs_replaced: checked })}
                      color="secondary"
                    >
                      Warning Signs Replaced
                    </Checkbox>
                  </div>

                  {editForm.warning_signs_replaced && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                      <Input
                        type="number"
                        value={editForm.warning_signs_quantity.toString()}
                        onValueChange={(value) => setEditForm({ ...editForm, warning_signs_quantity: parseInt(value) || 0 })}
                        placeholder="Enter quantity"
                        min={0}
                        classNames={{
                          input: "focus:ring-purple-500",
                          inputWrapper: "focus-within:border-purple-500 hover:border-purple-300 border-gray-300"
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Inspection Stations */}
        {(report.report_type === 'inspection' || report.report_type === 'both') && (
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Inspection Stations</h2>
                    <p className="text-sm text-gray-500">{editingStations.length} station{editingStations.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <Button
                  onPress={addStation}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  startContent={<Plus className="w-4 h-4" />}
                >
                  Add Station
                </Button>
              </div>
              
              {editingStations.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No inspection stations</h3>
                  <p className="text-gray-500 mb-4">Add stations to track inspection details</p>
                  <Button
                    onPress={addStation}
                    variant="light"
                    className="text-purple-600"
                  >
                    Add your first station
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {editingStations.map((station, index) => {
                    const isExpanded = expandedStations.has(index);
                    return (
                      <Card key={index} className="border border-gray-200">
                        <CardBody className="p-0">
                          {/* Station Header */}
                          <div 
                            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleStationAccordion(index)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {isExpanded ? (
                                  <ChevronDown className="w-5 h-5 text-gray-600" />
                                ) : (
                                  <ChevronRight className="w-5 h-5 text-gray-600" />
                                )}
                                <div>
                                  <h3 className="text-lg font-medium text-gray-900">
                                    Station {station.station_number}
                                  </h3>
                                  <div className="flex items-center space-x-3 mt-1">
                                    <Chip 
                                      size="sm" 
                                      variant="flat"
                                      color={station.location === 'inside' ? 'primary' : 'success'}
                                    >
                                      {station.location === 'inside' ? 'Inside' : 'Outside'}
                                    </Chip>
                                    <Chip 
                                      size="sm" 
                                      variant="flat"
                                      color={station.is_accessible ? 'success' : 'danger'}
                                    >
                                      {station.is_accessible ? 'Accessible' : 'Not Accessible'}
                                    </Chip>
                                    {station.has_activity && (
                                      <Chip size="sm" variant="flat" color="warning">
                                        Activity: {station.activity_type || 'Unknown'}
                                      </Chip>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                onPress={(e) => {
                                  e.stopPropagation();
                                  removeStation(index);
                                }}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Station Details */}
                          {isExpanded && (
                            <>
                              <Divider />
                              <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Station Number</label>
                                    <Input
                                      type="number"
                                      value={station.station_number.toString()}
                                      onValueChange={(value) => updateStation(index, 'station_number', parseInt(value) || 0)}
                                      classNames={{
                                        input: "focus:ring-purple-500",
                                        inputWrapper: "focus-within:border-purple-500 hover:border-purple-300 border-gray-300"
                                      }}
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                    <Dropdown>
                                      <DropdownTrigger>
                                        <Button variant="bordered" className="w-full justify-between border-gray-300">
                                          {station.location === 'inside' ? 'Inside' : 'Outside'}
                                        </Button>
                                      </DropdownTrigger>
                                      <DropdownMenu
                                        selectedKeys={[station.location]}
                                        onAction={(key) => updateStation(index, 'location', key)}
                                        selectionMode="single"
                                      >
                                        <DropdownItem key="inside">Inside</DropdownItem>
                                        <DropdownItem key="outside">Outside</DropdownItem>
                                      </DropdownMenu>
                                    </Dropdown>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Bait Status</label>
                                    <Dropdown>
                                      <DropdownTrigger>
                                        <Button variant="bordered" className="w-full justify-between border-gray-300">
                                          {station.bait_status.replace('_', ' ')}
                                        </Button>
                                      </DropdownTrigger>
                                      <DropdownMenu
                                        selectedKeys={[station.bait_status]}
                                        onAction={(key) => updateStation(index, 'bait_status', key)}
                                        selectionMode="single"
                                      >
                                        <DropdownItem key="untouched">Untouched</DropdownItem>
                                        <DropdownItem key="partially_eaten">Partially Eaten</DropdownItem>
                                        <DropdownItem key="eaten">Eaten</DropdownItem>
                                        <DropdownItem key="moldy">Moldy</DropdownItem>
                                      </DropdownMenu>
                                    </Dropdown>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Chemical Used</label>
                                    <Dropdown>
                                      <DropdownTrigger>
                                        <Button variant="bordered" className="w-full justify-between border-gray-300">
                                          {station.poison_used_id ? 
                                            chemicals.find(c => c.id === station.poison_used_id)?.name || 'Select Chemical' 
                                            : 'Select Chemical'
                                          }
                                        </Button>
                                      </DropdownTrigger>
                                      <DropdownMenu
                                        selectedKeys={station.poison_used_id ? [station.poison_used_id.toString()] : []}
                                        onAction={(key) => updateStation(index, 'poison_used_id', parseInt(key as string) || 0)}
                                        selectionMode="single"
                                      >
                                        <DropdownItem key="0">Select Chemical</DropdownItem>
                                        {chemicals.filter(c => c.category === 'inspection' || c.category === 'both').map(chemical => (
                                          <DropdownItem key={chemical.id.toString()}>
                                            {chemical.name} ({chemical.l_number})
                                          </DropdownItem>
                                        ))}
                                      </DropdownMenu>
                                    </Dropdown>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                                    <Input
                                      type="number"
                                      value={station.poison_quantity.toString()}
                                      onValueChange={(value) => updateStation(index, 'poison_quantity', parseInt(value) || 0)}
                                      min={0}
                                      classNames={{
                                        input: "focus:ring-purple-500",
                                        inputWrapper: "focus-within:border-purple-500 hover:border-purple-300 border-gray-300"
                                      }}
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Batch Number</label>
                                    <Input
                                      value={station.batch_number}
                                      onValueChange={(value) => updateStation(index, 'batch_number', value)}
                                      placeholder="Enter batch number"
                                      classNames={{
                                        input: "focus:ring-purple-500",
                                        inputWrapper: "focus-within:border-purple-500 hover:border-purple-300 border-gray-300"
                                      }}
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                  <Checkbox
                                    isSelected={station.is_accessible}
                                    onValueChange={(checked) => updateStation(index, 'is_accessible', checked)}
                                    color="secondary"
                                  >
                                    Accessible
                                  </Checkbox>

                                  <Checkbox
                                    isSelected={station.has_activity}
                                    onValueChange={(checked) => updateStation(index, 'has_activity', checked)}
                                    color="secondary"
                                  >
                                    Has Activity
                                  </Checkbox>

                                  <Checkbox
                                    isSelected={station.rodent_box_replaced}
                                    onValueChange={(checked) => updateStation(index, 'rodent_box_replaced', checked)}
                                    color="secondary"
                                  >
                                    Box Replaced
                                  </Checkbox>
                                </div>

                                {station.has_activity && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
                                      <Dropdown>
                                        <DropdownTrigger>
                                          <Button variant="bordered" className="w-full justify-between border-gray-300">
                                            {station.activity_type || 'Select Activity'}
                                          </Button>
                                        </DropdownTrigger>
                                        <DropdownMenu
                                          selectedKeys={station.activity_type ? [station.activity_type] : []}
                                          onAction={(key) => updateStation(index, 'activity_type', key)}
                                          selectionMode="single"
                                        >
                                          <DropdownItem key="">Select Activity</DropdownItem>
                                          <DropdownItem key="droppings">Droppings</DropdownItem>
                                          <DropdownItem key="gnawing">Gnawing</DropdownItem>
                                          <DropdownItem key="tracks">Tracks</DropdownItem>
                                          <DropdownItem key="other">Other</DropdownItem>
                                        </DropdownMenu>
                                      </Dropdown>
                                    </div>

                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">Activity Description</label>
                                      <Input
                                        value={station.activity_description || ''}
                                        onValueChange={(value) => updateStation(index, 'activity_description', value)}
                                        placeholder="Describe the activity..."
                                        classNames={{
                                          input: "focus:ring-purple-500",
                                          inputWrapper: "focus-within:border-purple-500 hover:border-purple-300 border-gray-300"
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Station Remarks</label>
                                  <Textarea
                                    value={station.station_remarks}
                                    onValueChange={(value) => updateStation(index, 'station_remarks', value)}
                                    placeholder="Additional remarks for this station..."
                                    rows={2}
                                    classNames={{
                                      input: "focus:ring-purple-500",
                                      inputWrapper: "focus-within:border-purple-500 hover:border-purple-300 border-gray-300"
                                    }}
                                  />
                                </div>
                              </div>
                            </>
                          )}
                        </CardBody>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* Fumigation Treatments */}
        {(report.report_type === 'fumigation' || report.report_type === 'both') && (
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Beaker className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Fumigation Treatments</h2>
                    <p className="text-sm text-gray-500">{editingTreatments.length} treatment{editingTreatments.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <Button
                  onPress={addTreatment}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  startContent={<Plus className="w-4 h-4" />}
                >
                  Add Treatment
                </Button>
              </div>
              
              {editingTreatments.length === 0 ? (
                <div className="text-center py-12">
                  <Beaker className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No fumigation treatments</h3>
                  <p className="text-gray-500 mb-4">Add treatments to track fumigation details</p>
                  <Button
                    onPress={addTreatment}
                    variant="light"
                    className="text-purple-600"
                  >
                    Add your first treatment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {editingTreatments.map((treatment, index) => {
                    const isExpanded = expandedTreatments.has(index);
                    const treatmentChemicals = treatment.chemicals.filter(c => c.chemical_id > 0);
                    const treatmentAreas = treatment.treated_areas.filter(area => area.trim());
                    const treatmentPests = treatment.treated_for.filter(pest => pest.trim());

                    return (
                      <Card key={index} className="border border-gray-200">
                        <CardBody className="p-0">
                          {/* Treatment Header */}
                          <div 
                            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleTreatmentAccordion(index)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                  {isExpanded ? (
                                    <ChevronDown className="w-5 h-5 text-gray-500" />
                                  ) : (
                                    <ChevronRight className="w-5 h-5 text-gray-500" />
                                  )}
                                  <h3 className="text-lg font-medium text-gray-900">Treatment {index + 1}</h3>
                                </div>
                                
                                {/* Summary badges when collapsed */}
                                {!isExpanded && (
                                  <div className="flex items-center space-x-2 ml-4">
                                    {treatmentAreas.length > 0 && (
                                      <Chip size="sm" variant="flat" color="primary">
                                        {treatmentAreas.length} area{treatmentAreas.length !== 1 ? 's' : ''}
                                      </Chip>
                                    )}
                                    {treatmentPests.length > 0 && (
                                      <Chip size="sm" variant="flat" color="success">
                                        {treatmentPests.length} pest{treatmentPests.length !== 1 ? 's' : ''}
                                      </Chip>
                                    )}
                                    {treatmentChemicals.length > 0 && (
                                      <Chip size="sm" variant="flat" color="warning">
                                        {treatmentChemicals.length} chemical{treatmentChemicals.length !== 1 ? 's' : ''}
                                      </Chip>
                                    )}
                                    {treatment.insect_monitor_replaced && (
                                      <Chip size="sm" variant="flat" color="secondary">
                                        Monitor Replaced
                                      </Chip>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                onPress={(e) => {
                                  e.stopPropagation();
                                  removeTreatment(index);
                                }}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Treatment Details */}
                          {isExpanded && (
                            <>
                              <Divider />
                              <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Treated Areas</label>
                                    <div className="space-y-2">
                                      {treatment.treated_areas.map((area, areaIndex) => (
                                        <div key={areaIndex} className="flex gap-2">
                                          <Input
                                            value={area}
                                            onValueChange={(value) => {
                                              const updated = [...editingTreatments];
                                              updated[index].treated_areas[areaIndex] = value;
                                              setEditingTreatments(updated);
                                            }}
                                            placeholder="Enter treated area"
                                            classNames={{
                                              input: "focus:ring-purple-500",
                                              inputWrapper: "focus-within:border-purple-500 hover:border-purple-300 border-gray-300"
                                            }}
                                          />
                                          <Button
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                            onPress={() => {
                                              const updated = [...editingTreatments];
                                              updated[index].treated_areas.splice(areaIndex, 1);
                                              setEditingTreatments(updated);
                                            }}
                                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      ))}
                                      <Button
                                        onPress={() => {
                                          const updated = [...editingTreatments];
                                          updated[index].treated_areas.push('');
                                          setEditingTreatments(updated);
                                        }}
                                        variant="light"
                                        startContent={<Plus className="w-4 h-4" />}
                                        className="text-purple-600 border-purple-200 hover:bg-purple-50"
                                      >
                                        Add Area
                                      </Button>
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Treated For</label>
                                    <div className="space-y-2">
                                      {treatment.treated_for.map((pest, pestIndex) => (
                                        <div key={pestIndex} className="flex gap-2">
                                          <Input
                                            value={pest}
                                            onValueChange={(value) => {
                                              const updated = [...editingTreatments];
                                              updated[index].treated_for[pestIndex] = value;
                                              setEditingTreatments(updated);
                                            }}
                                            placeholder="Enter target pest"
                                            classNames={{
                                              input: "focus:ring-purple-500",
                                              inputWrapper: "focus-within:border-purple-500 hover:border-purple-300 border-gray-300"
                                            }}
                                          />
                                          <Button
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                            onPress={() => {
                                              const updated = [...editingTreatments];
                                              updated[index].treated_for.splice(pestIndex, 1);
                                              setEditingTreatments(updated);
                                            }}
                                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      ))}
                                      <Button
                                        onPress={() => {
                                          const updated = [...editingTreatments];
                                          updated[index].treated_for.push('');
                                          setEditingTreatments(updated);
                                        }}
                                        variant="light"
                                        startContent={<Plus className="w-4 h-4" />}
                                        className="text-purple-600 border-purple-200 hover:bg-purple-50"
                                      >
                                        Add Pest
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                <div className="mb-6">
                                  <Checkbox
                                    isSelected={treatment.insect_monitor_replaced}
                                    onValueChange={(checked) => updateTreatment(index, 'insect_monitor_replaced', checked)}
                                    color="secondary"
                                  >
                                    Insect Monitor Replaced
                                  </Checkbox>
                                </div>

                                <div className="mb-6">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">General Remarks</label>
                                  <Textarea
                                    value={treatment.general_remarks}
                                    onValueChange={(value) => updateTreatment(index, 'general_remarks', value)}
                                    placeholder="Treatment remarks..."
                                    rows={2}
                                    classNames={{
                                      input: "focus:ring-purple-500",
                                      inputWrapper: "focus-within:border-purple-500 hover:border-purple-300 border-gray-300"
                                    }}
                                  />
                                </div>

                                {/* Chemicals for this treatment */}
                                <div>
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-medium text-gray-900">Chemicals Used</h4>
                                    <Button
                                      onPress={() => addChemicalToTreatment(index)}
                                      size="sm"
                                      variant="light"
                                      startContent={<Plus className="w-4 h-4" />}
                                      className="text-green-600 hover:bg-green-50"
                                    >
                                      Add Chemical
                                    </Button>
                                  </div>
                                  
                                  <div className="space-y-3">
                                    {treatment.chemicals.map((chemical, chemIndex) => (
                                      <Card key={chemIndex} className="border border-gray-200">
                                        <CardBody className="p-4">
                                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                            <div>
                                              <label className="block text-xs font-medium text-gray-700 mb-1">Chemical</label>
                                              <Dropdown>
                                                <DropdownTrigger>
                                                  <Button variant="bordered" size="sm" className="w-full justify-between border-gray-300 text-xs">
                                                    {chemical.chemical_id ? 
                                                      chemicals.find(c => c.id === chemical.chemical_id)?.name || 'Select Chemical' 
                                                      : 'Select Chemical'
                                                    }
                                                  </Button>
                                                </DropdownTrigger>
                                                <DropdownMenu
                                                  selectedKeys={chemical.chemical_id ? [chemical.chemical_id.toString()] : []}
                                                  onAction={(key) => updateTreatmentChemical(index, chemIndex, 'chemical_id', parseInt(key as string) || 0)}
                                                  selectionMode="single"
                                                >
                                                  <DropdownItem key="0">Select Chemical</DropdownItem>
                                                  {chemicals.filter(c => c.category === 'fumigation' || c.category === 'both').map(chem => (
                                                    <DropdownItem key={chem.id.toString()}>
                                                      {chem.name} ({chem.l_number})
                                                    </DropdownItem>
                                                  ))}
                                                </DropdownMenu>
                                              </Dropdown>
                                            </div>
                                            
                                            <div>
                                              <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                                              <Input
                                                type="number"
                                                size="sm"
                                                value={chemical.quantity.toString()}
                                                onValueChange={(value) => updateTreatmentChemical(index, chemIndex, 'quantity', parseInt(value) || 0)}
                                                min={0}
                                                classNames={{
                                                  input: "focus:ring-purple-500",
                                                  inputWrapper: "focus-within:border-purple-500 hover:border-purple-300 border-gray-300"
                                                }}
                                              />
                                            </div>
                                            
                                            <div>
                                              <label className="block text-xs font-medium text-gray-700 mb-1">Batch Number</label>
                                              <Input
                                                size="sm"
                                                value={chemical.batch_number}
                                                onValueChange={(value) => updateTreatmentChemical(index, chemIndex, 'batch_number', value)}
                                                placeholder="Batch number"
                                                classNames={{
                                                  input: "focus:ring-purple-500",
                                                  inputWrapper: "focus-within:border-purple-500 hover:border-purple-300 border-gray-300"
                                                }}
                                              />
                                            </div>
                                            
                                            <div className="flex items-end">
                                              <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                                onPress={() => removeTreatmentChemical(index, chemIndex)}
                                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                              >
                                                <Trash2 className="w-4 h-4" />
                                              </Button>
                                            </div>
                                          </div>
                                        </CardBody>
                                      </Card>
                                    ))}
                                    
                                    {treatment.chemicals.length === 0 && (
                                      <div className="text-center py-6 text-gray-500">
                                        <Beaker className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                        <p className="text-sm">No chemicals added yet</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </CardBody>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReportEdit;
