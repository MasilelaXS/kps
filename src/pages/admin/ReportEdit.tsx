import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Save,
  Target,
  Beaker,
  Plus,
  Trash2,
  FileText,
  Building2,
  MapPin,
  XCircle
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
  useDisclosure,
  Input,
  Textarea,
  Select,
  SelectItem,
  Tabs,
  Tab,
  Card,
  CardBody,
  Divider
} from '@heroui/react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import type { DetailedReport, Chemical, User as PCOUser } from '../../types/admin';

// Define interfaces for editable data structures
interface EditableStation {
  id?: number;
  station_number: number;
  location: 'inside' | 'outside';
  is_accessible: boolean;
  access_reason: string;
  has_activity: boolean;
  activity_type?: 'droppings' | 'gnaw_marks' | 'live_sighting' | 'dead_pest' | 'other' | null;
  activity_type_other: string;
  activity_description: string;
  station_condition: string[];
  bait_status: 'untouched' | 'partially_consumed' | 'fully_consumed' | 'wet' | 'missing';
  rodent_box_replaced: boolean;
  poison_used_id: number;
  poison_quantity: number;
  batch_number: string;
  batch_number_note: string;
  station_remarks: string;
}

interface EditableFumigationChemical {
  id?: number;
  chemical_id: number;
  quantity: number;
  batch_number: string;
  batch_number_note: string;
}

interface EditableFumigation {
  id?: number;
  treated_areas: string[];
  treated_for: string[];
  insect_monitor_replaced: boolean;
  general_remarks: string;
  chemicals: EditableFumigationChemical[];
}

// Predefined options
const TREATED_AREAS_OPTIONS = [
  'Kitchen', 'Storage Room', 'Office', 'Warehouse', 'Loading Dock', 
  'Dining Area', 'Bathroom', 'Reception', 'Conference Room', 'Basement',
  'Attic', 'Garage', 'Production Area', 'Break Room', 'Other'
];

const TREATED_FOR_OPTIONS = [
  'Cockroaches', 'Ants', 'Flies', 'Moths', 'Rodents', 'Spiders',
  'Beetles', 'Wasps', 'Termites', 'Fleas', 'Other'
];

const STATION_CONDITIONS = ['good', 'needs_repair', 'damaged', 'missing'];
const ACTIVITY_TYPES = [
  { key: 'droppings', label: 'Droppings' },
  { key: 'gnaw_marks', label: 'Gnaw Marks' },
  { key: 'live_sighting', label: 'Live Sighting' },
  { key: 'dead_pest', label: 'Dead Pest' },
  { key: 'other', label: 'Other' }
];

const BAIT_STATUS_OPTIONS = [
  { key: 'untouched', label: 'Untouched' },
  { key: 'partially_consumed', label: 'Partially Consumed' },
  { key: 'fully_consumed', label: 'Fully Consumed' },
  { key: 'wet', label: 'Wet' },
  { key: 'missing', label: 'Missing' }
];

export const ReportEdit: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  
  // Main state
  const [report, setReport] = useState<DetailedReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    client_id: 0,
    pco_id: 0,
    report_type: 'inspection' as 'inspection' | 'fumigation' | 'both',
    date_of_service: '',
    next_service_date: '',
    overall_remarks: '',
    recommendations: '',
    warning_signs_replaced: false,
    warning_signs_quantity: 0,
    admin_notes: ''
  });
  
  const [stations, setStations] = useState<EditableStation[]>([]);
  const [fumigation, setFumigation] = useState<EditableFumigation | null>(null);
  
  // Reference data
  const [pcos, setPcos] = useState<PCOUser[]>([]);
  const [inspectionChemicals, setInspectionChemicals] = useState<Chemical[]>([]);
  const [fumigationChemicals, setFumigationChemicals] = useState<Chemical[]>([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState<string>('details');
  
  // Modals
  const { isOpen: isAddChemicalModalOpen, onOpen: onAddChemicalModalOpen, onClose: onAddChemicalModalClose } = useDisclosure();
  const [newChemical, setNewChemical] = useState({
    l_number: '',
    name: '',
    type: '',
    category: 'both' as 'inspection' | 'fumigation' | 'both',
    quantity_unit: ''
  });

  // Load report data
  const loadReport = useCallback(async () => {
    if (!reportId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 Loading report for editing:', reportId);
      const response = await adminService.getReport(parseInt(reportId));
      
      if (response.success && response.data) {
        const reportData = response.data;
        setReport(reportData);
        
        console.log('📋 Full Report Data Structure:', reportData);
        console.log('🎯 Inspection Stations:', reportData.inspection_stations);
        console.log('🎯 Stations (fallback):', reportData.stations);
        console.log('🧪 Fumigation Treatments:', reportData.fumigation_treatments);
        
        // Set form data
        setFormData({
          client_id: reportData.client_id,
          pco_id: reportData.pco_id,
          report_type: reportData.report_type as 'inspection' | 'fumigation' | 'both',
          date_of_service: reportData.date_of_service || '',
          next_service_date: reportData.next_service_date || '',
          overall_remarks: reportData.overall_remarks || '',
          recommendations: reportData.recommendations || '',
          warning_signs_replaced: reportData.warning_signs_replaced || false,
          warning_signs_quantity: reportData.warning_signs_quantity || 0,
          admin_notes: reportData.admin_notes || ''
        });
        
        // Set stations data
        const stationsData = reportData.inspection_stations || reportData.stations || [];
        setStations(stationsData.map(station => {
          const stationData = station as any; // Cast to any to access all fields safely
          return {
            id: stationData.id,
            station_number: typeof stationData.station_number === 'string' ? parseInt(stationData.station_number) : stationData.station_number,
            location: stationData.location as 'inside' | 'outside',
            is_accessible: stationData.is_accessible,
            access_reason: stationData.access_reason || '',
            has_activity: stationData.has_activity,
            activity_type: stationData.activity_type as any,
            activity_type_other: stationData.activity_type_other || '',
            activity_description: stationData.activity_description || '',
            station_condition: Array.isArray(stationData.station_condition) ? stationData.station_condition : [],
            bait_status: stationData.bait_status as any,
            rodent_box_replaced: stationData.rodent_box_replaced,
            poison_used_id: stationData.poison_used_id,
            poison_quantity: stationData.poison_quantity,
            batch_number: stationData.batch_number,
            batch_number_note: stationData.batch_number_note || '',
            station_remarks: stationData.station_remarks
          };
        }));
        
        // Set fumigation data
        if (reportData.fumigation_treatments && reportData.fumigation_treatments.length > 0) {
          const treatment = reportData.fumigation_treatments[0];
          setFumigation({
            id: treatment.id,
            treated_areas: Array.isArray(treatment.treated_areas) ? treatment.treated_areas : [],
            treated_for: Array.isArray(treatment.treated_for) ? treatment.treated_for : [],
            insect_monitor_replaced: treatment.insect_monitor_replaced,
            general_remarks: treatment.general_remarks || '',
            chemicals: treatment.chemicals?.map(chem => ({
              id: chem.id,
              chemical_id: chem.chemical_id,
              quantity: chem.quantity,
              batch_number: chem.batch_number,
              batch_number_note: chem.batch_number_note || ''
            })) || []
          });
        }
      } else {
        const errorMessage = response.message || (response as any).error || 'Failed to load report';
        console.error('❌ Backend error:', errorMessage);
        setError(errorMessage);
      }
    } catch (error) {
      console.error('❌ Error loading report:', error);
      // Try to extract error message from the error object
      let errorMessage = 'An error occurred while loading the report';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as any).message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [reportId]);

  // Load chemicals and users
  const loadReferenceData = useCallback(async () => {
    try {
      const [chemicalsResponse, usersResponse] = await Promise.all([
        adminService.getChemicals(),
        adminService.getUsers()
      ]);
      
      if (chemicalsResponse.success && chemicalsResponse.data) {
        setInspectionChemicals(chemicalsResponse.data.filter(c => 
          c.category === 'inspection' || c.category === 'both'
        ));
        setFumigationChemicals(chemicalsResponse.data.filter(c => 
          c.category === 'fumigation' || c.category === 'both'
        ));
      }
      
      if (usersResponse.success && usersResponse.data) {
        setPcos(usersResponse.data.filter(user => user.role === 'pco'));
      }
    } catch (error) {
      console.error('Error loading reference data:', error);
      // Try to extract error message from the error object
      let errorMessage = 'Failed to load reference data';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as any).message;
      }
      toast.error(errorMessage);
    }
  }, []);

  useEffect(() => {
    loadReport();
    loadReferenceData();
  }, [loadReport, loadReferenceData]);

  // Handle form updates
  const updateFormData = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Station management
  const addStation = () => {
    const newStationNumber = Math.max(0, ...stations.map(s => s.station_number)) + 1;
    const newStation: EditableStation = {
      station_number: newStationNumber,
      location: 'inside',
      is_accessible: true,
      access_reason: '',
      has_activity: false,
      activity_type: null,
      activity_type_other: '',
      activity_description: '',
      station_condition: ['good'],
      bait_status: 'untouched',
      rodent_box_replaced: false,
      poison_used_id: inspectionChemicals[0]?.id || 0,
      poison_quantity: 0,
      batch_number: '',
      batch_number_note: '',
      station_remarks: ''
    };
    setStations(prev => [...prev, newStation]);
  };

  const updateStation = (index: number, field: keyof EditableStation, value: any) => {
    setStations(prev => prev.map((station, i) => 
      i === index ? { ...station, [field]: value } : station
    ));
  };

  const removeStation = (index: number) => {
    setStations(prev => prev.filter((_, i) => i !== index));
  };

  // Fumigation management
  const initializeFumigation = () => {
    setFumigation({
      treated_areas: [],
      treated_for: [],
      insect_monitor_replaced: false,
      general_remarks: '',
      chemicals: []
    });
  };

  const updateFumigation = (field: keyof EditableFumigation, value: any) => {
    setFumigation(prev => prev ? { ...prev, [field]: value } : null);
  };

  const addFumigationChemical = () => {
    if (!fumigation) return;
    
    const newChemical: EditableFumigationChemical = {
      chemical_id: fumigationChemicals[0]?.id || 0,
      quantity: 0,
      batch_number: '',
      batch_number_note: ''
    };
    
    setFumigation(prev => prev ? {
      ...prev,
      chemicals: [...prev.chemicals, newChemical]
    } : null);
  };

  const updateFumigationChemical = (index: number, field: keyof EditableFumigationChemical, value: any) => {
    setFumigation(prev => prev ? {
      ...prev,
      chemicals: prev.chemicals.map((chem, i) => 
        i === index ? { ...chem, [field]: value } : chem
      )
    } : null);
  };

  const removeFumigationChemical = (index: number) => {
    setFumigation(prev => prev ? {
      ...prev,
      chemicals: prev.chemicals.filter((_, i) => i !== index)
    } : null);
  };

  // Create new chemical
  const handleCreateChemical = async () => {
    try {
      const response = await adminService.createChemical(newChemical);
      
      if (response.success) {
        toast.success('Chemical created successfully!');
        onAddChemicalModalClose();
        setNewChemical({
          l_number: '',
          name: '',
          type: '',
          category: 'both',
          quantity_unit: ''
        });
        // Reload chemicals
        await loadReferenceData();
      } else {
        const errorMessage = response.message || (response as any).error || 'Failed to create chemical';
        console.error('❌ Backend chemical creation error:', errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error creating chemical:', error);
      // Try to extract error message from the error object
      let errorMessage = 'An error occurred while creating the chemical';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as any).message;
      }
      toast.error(errorMessage);
    }
  };

  // Save report
  const handleSave = async () => {
    if (!reportId || !report) return;
    
    try {
      setIsSaving(true);
      
      // Prepare data for API
      const updateData: any = {
        ...formData,
        stations: stations.map(station => ({
          ...station,
          station_condition: Array.isArray(station.station_condition) ? station.station_condition : []
        }))
      };
      
      // Add fumigation data if applicable
      if (fumigation && (formData.report_type === 'fumigation' || formData.report_type === 'both')) {
        updateData.fumigation = fumigation;
      }
      
      console.log('💾 Saving report with data:', updateData);
      console.log('📝 Form Data:', formData);
      console.log('🎯 Stations Data:', stations);
      console.log('🧪 Fumigation Data:', fumigation);
      console.log('📋 Full Update Payload:', JSON.stringify(updateData, null, 2));
      
      const response = await adminService.editReport(parseInt(reportId), updateData);
      
      if (response.success) {
        toast.success('Report updated successfully!');
        // Navigate to view page
        navigate(`/admin/reports/${reportId}`);
      } else {
        const errorMessage = response.message || (response as any).error || 'Failed to update report';
        console.error('❌ Backend save error:', errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error saving report:', error);
      // Try to extract error message from the error object
      let errorMessage = 'An error occurred while saving the report';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as any).message;
      }
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const getChemicalById = (id: number, chemicalsList: Chemical[]) => {
    return chemicalsList.find(c => c.id === id);
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report for editing...</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="light"
              onPress={() => navigate(`/admin/reports/${reportId}`)}
              startContent={<ArrowLeft className="h-4 w-4" />}
              className="text-gray-600 hover:text-gray-800"
            >
              Back to View
            </Button>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Edit Report #{report.id}</h1>
              <p className="text-sm text-gray-500">{report.client?.name || 'Unknown Client'}</p>
            </div>
          </div>

          {/* Save Button */}
          <Button
            color="primary"
            onPress={handleSave}
            startContent={<Save className="h-4 w-4" />}
            isLoading={isSaving}
            size="lg"
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <Tabs 
          selectedKey={activeTab} 
          onSelectionChange={(key) => setActiveTab(key as string)}
          variant="underlined"
          classNames={{
            base: "w-full",
            tabList: "gap-0 w-full relative rounded-xl bg-gray-50 p-1 border border-gray-200 shadow-sm",
            cursor: "w-full bg-white shadow-sm rounded-lg border border-gray-200",
            tab: "max-w-fit px-6 py-3 h-auto rounded-lg transition-all duration-200 hover:bg-gray-100 data-[selected=true]:shadow-sm",
            tabContent: "group-data-[selected=true]:text-purple-600 font-medium text-gray-600 transition-colors duration-200"
          }}
        >
          <Tab key="details" title={
            <div className="flex items-center space-x-3 px-2 py-1">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <span className="font-medium">Report Details</span>
            </div>
          }>
            <Card className="mt-6 report-card">
              <CardBody className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div>
                      <Select
                        label="Report Type"
                        labelPlacement="outside"
                        selectedKeys={[formData.report_type]}
                        onSelectionChange={(keys) => {
                          const type = Array.from(keys)[0] as 'inspection' | 'fumigation' | 'both';
                          updateFormData('report_type', type);
                          
                          // Initialize fumigation if needed
                          if ((type === 'fumigation' || type === 'both') && !fumigation) {
                            initializeFumigation();
                          }
                        }}
                        className="max-w-full"
                        aria-label="Select report type"
                      >
                        <SelectItem key="inspection">Inspection Only</SelectItem>
                        <SelectItem key="fumigation">Fumigation Only</SelectItem>
                        <SelectItem key="both">Inspection + Fumigation</SelectItem>
                      </Select>
                    </div>

                    <div>
                      <Select
                        label="PCO"
                        labelPlacement="outside"
                        selectedKeys={formData.pco_id > 0 ? [formData.pco_id.toString()] : []}
                        onSelectionChange={(keys) => {
                          const pcoId = parseInt(Array.from(keys)[0] as string);
                          updateFormData('pco_id', pcoId);
                        }}
                        className="max-w-full"
                        aria-label="Select PCO"
                      >
                        {pcos.map(pco => (
                          <SelectItem key={pco.id.toString()}>
                            {pco.name} ({pco.pco_number})
                          </SelectItem>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <Input
                        label="Service Date"
                        labelPlacement="outside"
                        type="date"
                        value={formData.date_of_service}
                        onChange={(e) => updateFormData('date_of_service', e.target.value)}
                      />
                    </div>

                    <div>
                      <Input
                        label="Next Service Date"
                        labelPlacement="outside"
                        type="date"
                        value={formData.next_service_date}
                        onChange={(e) => updateFormData('next_service_date', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center space-x-3 mb-3">
                        <Checkbox
                          isSelected={formData.warning_signs_replaced}
                          onValueChange={(checked) => updateFormData('warning_signs_replaced', checked)}
                        >
                          Warning Signs Replaced
                        </Checkbox>
                      </div>
                      {formData.warning_signs_replaced && (
                        <div className="ml-6">
                          <Input
                            label="Quantity"
                            labelPlacement="outside"
                            type="number"
                            value={formData.warning_signs_quantity.toString()}
                            onChange={(e) => updateFormData('warning_signs_quantity', parseInt(e.target.value) || 0)}
                            min="0"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <Textarea
                        label="Overall Remarks"
                        labelPlacement="outside"
                        value={formData.overall_remarks}
                        onChange={(e) => updateFormData('overall_remarks', e.target.value)}
                        placeholder="Enter overall service remarks..."
                        minRows={3}
                      />
                    </div>

                    <div>
                      <Textarea
                        label="Recommendations"
                        labelPlacement="outside"
                        value={formData.recommendations}
                        onChange={(e) => updateFormData('recommendations', e.target.value)}
                        placeholder="Enter service recommendations..."
                        minRows={3}
                      />
                    </div>

                    <div>
                      <Textarea
                        label="Admin Notes"
                        labelPlacement="outside"
                        value={formData.admin_notes}
                        onChange={(e) => updateFormData('admin_notes', e.target.value)}
                        placeholder="Enter admin notes (internal use only)..."
                        minRows={3}
                        className="admin-notes"
                      />
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Tab>

          {(formData.report_type === 'inspection' || formData.report_type === 'both') && (
            <Tab key="stations" title={
              <div className="flex items-center space-x-3 px-2 py-1">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Target className="h-4 w-4 text-green-600" />
                </div>
                <span className="font-medium">Inspection Stations</span>
                <Chip 
                  size="sm" 
                  variant="flat" 
                  classNames={{
                    base: "bg-green-100 text-green-700 border-green-200",
                    content: "font-semibold"
                  }}
                >
                  {stations.length}
                </Chip>
              </div>
            }>
              <div className="mt-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Inspection Stations</h2>
                  <Button
                    color="primary"
                    onPress={addStation}
                    startContent={<Plus className="h-4 w-4" />}
                  >
                    Add Station
                  </Button>
                </div>

                <div className="space-y-4">
                  {stations.map((station, index) => (
                    <Card key={index} className="report-card">
                      <CardBody className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                            <Target className="h-4 w-4 text-green-600" />
                            <span>Station {station.station_number}</span>
                          </h3>
                          <Button
                            color="danger"
                            variant="light"
                            size="sm"
                            onPress={() => removeStation(index)}
                            startContent={<Trash2 className="h-4 w-4" />}
                          >
                            Remove
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <Input
                              label="Station Number"
                              labelPlacement="outside"
                              type="number"
                              value={station.station_number.toString()}
                              onChange={(e) => updateStation(index, 'station_number', parseInt(e.target.value) || 1)}
                              min="1"
                            />
                          </div>

                          <div>
                            <Select
                              label="Location"
                              labelPlacement="outside" 
                              selectedKeys={[station.location]}
                              onSelectionChange={(keys) => {
                                const location = Array.from(keys)[0] as 'inside' | 'outside';
                                updateStation(index, 'location', location);
                              }}
                              aria-label="Select station location"
                            >
                              <SelectItem key="inside" startContent={<Building2 className="h-4 w-4 text-blue-600" />}>
                                Inside
                              </SelectItem>
                              <SelectItem key="outside" startContent={<MapPin className="h-4 w-4 text-green-600" />}>
                                Outside
                              </SelectItem>
                            </Select>
                          </div>

                          <div>
                            <div className="mb-2">
                              <span className="text-sm font-medium text-gray-700">Accessibility</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <Checkbox
                                isSelected={station.is_accessible}
                                onValueChange={(checked) => updateStation(index, 'is_accessible', checked)}
                              >
                                Accessible
                              </Checkbox>
                            </div>
                            {!station.is_accessible && (
                              <Input
                                className="mt-2"
                                placeholder="Reason for inaccessibility..."
                                value={station.access_reason}
                                onChange={(e) => updateStation(index, 'access_reason', e.target.value)}
                              />
                            )}
                          </div>

                          <div>
                            <div className="mb-2">
                              <span className="text-sm font-medium text-gray-700">Activity Detected</span>
                            </div>
                            <Checkbox
                              isSelected={station.has_activity}
                              onValueChange={(checked) => updateStation(index, 'has_activity', checked)}
                            >
                              Activity Present
                            </Checkbox>
                          </div>

                          {station.has_activity && (
                            <>
                              <div>
                                <Select
                                  label="Activity Type"
                                  labelPlacement="outside"
                                  selectedKeys={station.activity_type ? [station.activity_type] : []}
                                  onSelectionChange={(keys) => {
                                    const type = Array.from(keys)[0] as typeof station.activity_type;
                                    updateStation(index, 'activity_type', type);
                                  }}
                                  aria-label="Select activity type"
                                >
                                  {ACTIVITY_TYPES.map(type => (
                                    <SelectItem key={type.key}>{type.label}</SelectItem>
                                  ))}
                                </Select>
                              </div>

                              {station.activity_type === 'other' && (
                                <div>
                                  <Input
                                    label="Other Activity"
                                    labelPlacement="outside"
                                    placeholder="Describe other activity..."
                                    value={station.activity_type_other}
                                    onChange={(e) => updateStation(index, 'activity_type_other', e.target.value)}
                                  />
                                </div>
                              )}

                              <div className="md:col-span-2">
                                <Textarea
                                  label="Activity Description"
                                  labelPlacement="outside"
                                  placeholder="Detailed description of activity..."
                                  value={station.activity_description}
                                  onChange={(e) => updateStation(index, 'activity_description', e.target.value)}
                                />
                              </div>
                            </>
                          )}

                          <div>
                            <div className="mb-2">
                              <span className="text-sm font-medium text-gray-700">Station Condition</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {STATION_CONDITIONS.map(condition => (
                                <Checkbox
                                  key={condition}
                                  isSelected={station.station_condition.includes(condition)}
                                  onValueChange={(checked) => {
                                    const currentConditions = station.station_condition;
                                    if (checked) {
                                      updateStation(index, 'station_condition', [...currentConditions, condition]);
                                    } else {
                                      updateStation(index, 'station_condition', currentConditions.filter(c => c !== condition));
                                    }
                                  }}
                                >
                                  {condition.replace('_', ' ')}
                                </Checkbox>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Select
                              label="Bait Status"
                              labelPlacement="outside"
                              selectedKeys={[station.bait_status]}
                              onSelectionChange={(keys) => {
                                const status = Array.from(keys)[0] as typeof station.bait_status;
                                updateStation(index, 'bait_status', status);
                              }}
                              aria-label="Select bait status"
                            >
                              {BAIT_STATUS_OPTIONS.map(status => (
                                <SelectItem key={status.key}>{status.label}</SelectItem>
                              ))}
                            </Select>
                          </div>

                          <div>
                            <div className="mb-2">
                              <span className="text-sm font-medium text-gray-700">Box Replacement</span>
                            </div>
                            <div className="flex items-center space-x-3 mb-3">
                              <Checkbox
                                isSelected={station.rodent_box_replaced}
                                onValueChange={(checked) => updateStation(index, 'rodent_box_replaced', checked)}
                              >
                                Box Replaced
                              </Checkbox>
                            </div>
                          </div>

                          <div>
                            <div className="mb-2">
                              <span className="text-sm font-medium text-gray-700">Chemical Used</span>
                            </div>
                            <div className="flex space-x-2">
                              <Select
                                selectedKeys={station.poison_used_id > 0 ? [station.poison_used_id.toString()] : []}
                                onSelectionChange={(keys) => {
                                  const chemicalId = parseInt(Array.from(keys)[0] as string);
                                  updateStation(index, 'poison_used_id', chemicalId);
                                }}
                                className="flex-1"
                                aria-label="Select chemical for station"
                              >
                                {inspectionChemicals.map(chemical => (
                                  <SelectItem key={chemical.id.toString()}>
                                    {chemical.name} (L#{chemical.l_number}) - {chemical.quantity_unit}
                                  </SelectItem>
                                ))}
                              </Select>
                              <Button
                                size="sm"
                                variant="flat"
                                onPress={onAddChemicalModalOpen}
                                startContent={<Plus className="h-4 w-4" />}
                              >
                                Add
                              </Button>
                            </div>
                            {station.poison_used_id > 0 && (
                              <p className="text-xs text-gray-500 mt-1">
                                Unit: {getChemicalById(station.poison_used_id, inspectionChemicals)?.quantity_unit}
                              </p>
                            )}
                          </div>

                          <div>
                            <Input
                              label="Quantity"
                              labelPlacement="outside"
                              type="number"
                              value={station.poison_quantity.toString()}
                              onChange={(e) => updateStation(index, 'poison_quantity', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.1"
                            />
                          </div>

                          <div>
                            <Input
                              label="Batch Number"
                              labelPlacement="outside"
                              value={station.batch_number}
                              onChange={(e) => updateStation(index, 'batch_number', e.target.value)}
                              placeholder="Enter batch number..."
                            />
                          </div>

                          <div className="md:col-span-2">
                            <Input
                              label="Batch Number Note"
                              labelPlacement="outside"
                              value={station.batch_number_note}
                              onChange={(e) => updateStation(index, 'batch_number_note', e.target.value)}
                              placeholder="Additional batch information..."
                            />
                          </div>

                          <div className="md:col-span-3">
                            <Textarea
                              label="Station Remarks"
                              labelPlacement="outside"
                              value={station.station_remarks}
                              onChange={(e) => updateStation(index, 'station_remarks', e.target.value)}
                              placeholder="Additional station notes..."
                            />
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>

                {stations.length === 0 && (
                  <Card className="report-card">
                    <CardBody className="p-8 text-center">
                      <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Inspection Stations</h3>
                      <p className="text-gray-600 mb-4">Add inspection stations to record monitoring data.</p>
                      <Button
                        color="primary"
                        onPress={addStation}
                        startContent={<Plus className="h-4 w-4" />}
                      >
                        Add First Station
                      </Button>
                    </CardBody>
                  </Card>
                )}
              </div>
            </Tab>
          )}

          {(formData.report_type === 'fumigation' || formData.report_type === 'both') && (
            <Tab key="fumigation" title={
              <div className="flex items-center space-x-3 px-2 py-1">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Beaker className="h-4 w-4 text-orange-600" />
                </div>
                <span className="font-medium">Fumigation</span>
                {fumigation && (
                  <Chip 
                    size="sm" 
                    variant="flat" 
                    classNames={{
                      base: "bg-orange-100 text-orange-700 border-orange-200",
                      content: "font-semibold"
                    }}
                  >
                    {fumigation.chemicals.length}
                  </Chip>
                )}
              </div>
            }>
              <div className="mt-6">
                {fumigation ? (
                  <Card className="report-card">
                    <CardBody className="p-8">
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <h2 className="text-lg font-semibold text-gray-900">Fumigation Treatment</h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Treated Areas</label>
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg min-h-[80px]">
                                {fumigation.treated_areas.map((area, index) => (
                                  <Chip
                                    key={index}
                                    onClose={() => {
                                      updateFumigation('treated_areas', fumigation.treated_areas.filter((_, i) => i !== index));
                                    }}
                                    color="primary"
                                    variant="flat"
                                  >
                                    {area}
                                  </Chip>
                                ))}
                              </div>
                              <div className="flex space-x-2">
                                <Select
                                  placeholder="Select area to add..."
                                  onSelectionChange={(keys) => {
                                    const area = Array.from(keys)[0] as string;
                                    if (area && !fumigation.treated_areas.includes(area)) {
                                      updateFumigation('treated_areas', [...fumigation.treated_areas, area]);
                                    }
                                  }}
                                  className="flex-1"
                                  selectedKeys={[]}
                                  aria-label="Select treated area to add"
                                >
                                  {TREATED_AREAS_OPTIONS.map(area => (
                                    <SelectItem key={area}>{area}</SelectItem>
                                  ))}
                                </Select>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Treated For</label>
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg min-h-[80px]">
                                {fumigation.treated_for.map((pest, index) => (
                                  <Chip
                                    key={index}
                                    onClose={() => {
                                      updateFumigation('treated_for', fumigation.treated_for.filter((_, i) => i !== index));
                                    }}
                                    color="warning"
                                    variant="flat"
                                  >
                                    {pest}
                                  </Chip>
                                ))}
                              </div>
                              <div className="flex space-x-2">
                                <Select
                                  placeholder="Select pest to add..."
                                  onSelectionChange={(keys) => {
                                    const pest = Array.from(keys)[0] as string;
                                    if (pest && !fumigation.treated_for.includes(pest)) {
                                      updateFumigation('treated_for', [...fumigation.treated_for, pest]);
                                    }
                                  }}
                                  className="flex-1"
                                  selectedKeys={[]}
                                  aria-label="Select pest type to add"
                                >
                                  {TREATED_FOR_OPTIONS.map(pest => (
                                    <SelectItem key={pest}>{pest}</SelectItem>
                                  ))}
                                </Select>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Checkbox
                            isSelected={fumigation.insect_monitor_replaced}
                            onValueChange={(checked) => updateFumigation('insect_monitor_replaced', checked)}
                          >
                            Insect Monitor Replaced
                          </Checkbox>
                        </div>

                        <div>
                          <Textarea
                            label="General Remarks"
                            labelPlacement="outside"
                            value={fumigation.general_remarks}
                            onChange={(e) => updateFumigation('general_remarks', e.target.value)}
                            placeholder="Enter general treatment remarks..."
                            minRows={3}
                          />
                        </div>

                        <Divider />

                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Chemicals Used</h3>
                            <Button
                              color="primary"
                              onPress={addFumigationChemical}
                              startContent={<Plus className="h-4 w-4" />}
                            >
                              Add Chemical
                            </Button>
                          </div>

                          <div className="space-y-4">
                            {fumigation.chemicals.map((chemical, index) => (
                              <Card key={index} className="bg-gray-50 report-card">
                                <CardBody className="p-4">
                                  <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-medium text-gray-900">Chemical {index + 1}</h4>
                                    <Button
                                      color="danger"
                                      variant="light"
                                      size="sm"
                                      onPress={() => removeFumigationChemical(index)}
                                      startContent={<Trash2 className="h-4 w-4" />}
                                    >
                                      Remove
                                    </Button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <div className="mb-2">
                                        <span className="text-sm font-medium text-gray-700">Chemical</span>
                                      </div>
                                      <div className="flex space-x-2">
                                        <Select
                                          selectedKeys={chemical.chemical_id > 0 ? [chemical.chemical_id.toString()] : []}
                                          onSelectionChange={(keys) => {
                                            const chemicalId = parseInt(Array.from(keys)[0] as string);
                                            updateFumigationChemical(index, 'chemical_id', chemicalId);
                                          }}
                                          className="flex-1"
                                          aria-label="Select fumigation chemical"
                                        >
                                          {fumigationChemicals.map(chem => (
                                            <SelectItem key={chem.id.toString()}>
                                              {chem.name} (L#{chem.l_number}) - {chem.quantity_unit}
                                            </SelectItem>
                                          ))}
                                        </Select>
                                        <Button
                                          size="sm"
                                          variant="flat"
                                          onPress={onAddChemicalModalOpen}
                                          startContent={<Plus className="h-4 w-4" />}
                                        >
                                          Add
                                        </Button>
                                      </div>
                                      {chemical.chemical_id > 0 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          Unit: {getChemicalById(chemical.chemical_id, fumigationChemicals)?.quantity_unit}
                                        </p>
                                      )}
                                    </div>

                                    <div>
                                      <Input
                                        label="Quantity"
                                        labelPlacement="outside"
                                        type="number"
                                        value={chemical.quantity.toString()}
                                        onChange={(e) => updateFumigationChemical(index, 'quantity', parseFloat(e.target.value) || 0)}
                                        min="0"
                                        step="0.1"
                                      />
                                    </div>

                                    <div>
                                      <Input
                                        label="Batch Number"
                                        labelPlacement="outside"
                                        value={chemical.batch_number}
                                        onChange={(e) => updateFumigationChemical(index, 'batch_number', e.target.value)}
                                        placeholder="Enter batch number..."
                                      />
                                    </div>

                                    <div>
                                      <Input
                                        label="Batch Note"
                                        labelPlacement="outside"
                                        value={chemical.batch_number_note}
                                        onChange={(e) => updateFumigationChemical(index, 'batch_number_note', e.target.value)}
                                        placeholder="Additional batch info..."
                                      />
                                    </div>
                                  </div>
                                </CardBody>
                              </Card>
                            ))}
                          </div>

                          {fumigation.chemicals.length === 0 && (
                            <Card className="bg-gray-50 report-card">
                              <CardBody className="p-8 text-center">
                                <Beaker className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Chemicals Added</h3>
                                <p className="text-gray-600 mb-4">Add chemicals used in the fumigation treatment.</p>
                                <Button
                                  color="primary"
                                  onPress={addFumigationChemical}
                                  startContent={<Plus className="h-4 w-4" />}
                                >
                                  Add First Chemical
                                </Button>
                              </CardBody>
                            </Card>
                          )}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ) : (
                  <Card className="report-card">
                    <CardBody className="p-8 text-center">
                      <Beaker className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Fumigation Treatment</h3>
                      <p className="text-gray-600 mb-4">Initialize fumigation treatment to add treatment details.</p>
                      <Button
                        color="primary"
                        onPress={initializeFumigation}
                        startContent={<Plus className="h-4 w-4" />}
                      >
                        Initialize Fumigation
                      </Button>
                    </CardBody>
                  </Card>
                )}
              </div>
            </Tab>
          )}
        </Tabs>
      </div>

      {/* Add Chemical Modal */}
      <Modal isOpen={isAddChemicalModalOpen} onClose={onAddChemicalModalClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-primary" />
              <span>Add New Chemical</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="L-Number"
                  labelPlacement="outside"
                  placeholder="e.g., L7525"
                  value={newChemical.l_number}
                  onChange={(e) => setNewChemical(prev => ({ ...prev, l_number: e.target.value }))}
                  isRequired
                />
                <Input
                  label="Chemical Name"
                  labelPlacement="outside"
                  placeholder="e.g., Alphathrin"
                  value={newChemical.name}
                  onChange={(e) => setNewChemical(prev => ({ ...prev, name: e.target.value }))}
                  isRequired
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Type"
                  labelPlacement="outside"
                  placeholder="e.g., Spray, Bait, Powder"
                  value={newChemical.type}
                  onChange={(e) => setNewChemical(prev => ({ ...prev, type: e.target.value }))}
                />
                <Select
                  label="Category"
                  labelPlacement="outside"
                  selectedKeys={[newChemical.category]}
                  onSelectionChange={(keys) => {
                    const category = Array.from(keys)[0] as 'inspection' | 'fumigation' | 'both';
                    setNewChemical(prev => ({ ...prev, category }));
                  }}
                  isRequired
                  aria-label="Select chemical category"
                >
                  <SelectItem key="inspection">Inspection Only</SelectItem>
                  <SelectItem key="fumigation">Fumigation Only</SelectItem>
                  <SelectItem key="both">Both</SelectItem>
                </Select>
              </div>
              
              <Input
                label="Quantity Unit"
                labelPlacement="outside"
                placeholder="e.g., ml, g, tablets"
                value={newChemical.quantity_unit}
                onChange={(e) => setNewChemical(prev => ({ ...prev, quantity_unit: e.target.value }))}
                isRequired
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={onAddChemicalModalClose}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleCreateChemical}
              isDisabled={!newChemical.l_number || !newChemical.name || !newChemical.quantity_unit}
            >
              Create Chemical
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
