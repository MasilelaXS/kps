import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Plus, Edit, Trash2, Zap, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMobileStore } from '../../../../stores/mobileStore';
import type { FumigationChemical, FumigationChemicalForm, InsectMonitor } from '../../../../types/mobile';

export const FumigationForm: React.FC = () => {
  const navigate = useNavigate();
  const { 
    currentReport, 
    reportInProgress,
    setCurrentStep,
    updateReportData,
    addFumigationChemical,
    updateFumigationChemical,
    removeFumigationChemical,
    chemicals,
    loadChemicals
  } = useMobileStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [currentChemical, setCurrentChemical] = useState<FumigationChemicalForm>({
    chemical_id: 0,
    name: '',
    quantity: 0,
    unit: 'ml',
    batch_number: '',
  });

  // API-compliant fumigation fields according to mobile-report.md
  const [treatedAreas, setTreatedAreas] = useState<string[]>([]);
  const [treatedFor, setTreatedFor] = useState<string[]>([]);
  const [insectMonitorReplaced, setInsectMonitorReplaced] = useState<boolean>(false);
  const [generalRemarks, setGeneralRemarks] = useState('');

  // Insect Monitor Management
  const [insectMonitors, setInsectMonitors] = useState<InsectMonitor[]>([]);
  const [isMonitorModalOpen, setIsMonitorModalOpen] = useState(false);
  const [editingMonitorIndex, setEditingMonitorIndex] = useState<number | null>(null);
  const [currentMonitor, setCurrentMonitor] = useState<InsectMonitor>({
    type: 'box',
    glue_board: '1',
    serviced: false,
    tubes: undefined,
  });

  // Predefined options for treated areas
  const areaOptions = [
    'kitchen', 'storage_room', 'loading_dock', 'dining_area', 'prep_area', 
    'main_kitchen', 'dining_hall', 'bathroom', 'office', 'warehouse', 'other'
  ];

  // Predefined options for pests
  const pestOptions = [
    'cockroaches', 'ants', 'flies', 'moths', 'spiders', 'beetles', 'termites', 'other'
  ];

  useEffect(() => {
    setCurrentStep('fumigation');
  }, [setCurrentStep]);

  useEffect(() => {
    // Load chemicals from database
    loadChemicals();
  }, [loadChemicals]);

  useEffect(() => {
    if (!reportInProgress || !currentReport) {
      navigate('/mobile/schedule');
      return;
    }

    // Check if fumigation is actually included
    if (!currentReport.report_types?.includes('fumigation')) {
      navigate('/mobile/reports/new?step=overall');
      return;
    }

    // Load existing data according to API structure
    const fumigationData = currentReport.fumigation;
    if (fumigationData) {
      setTreatedAreas(fumigationData.treated_areas || []);
      // Handle both target_pests (current) and treated_for (API) field names
      setTreatedFor(fumigationData.treated_for || fumigationData.target_pests || []);
      setInsectMonitorReplaced(fumigationData.insect_monitor_replaced === 1);
      setGeneralRemarks(fumigationData.general_remarks || fumigationData.fumigation_notes || '');
      setInsectMonitors(fumigationData.insect_monitors || []);
    }
  }, [reportInProgress, currentReport, navigate]);

  const fumigationChemicals = currentReport?.fumigation_chemicals || [];

  const handleAddChemical = () => {
    setEditingIndex(null);
    setCurrentChemical({
      chemical_id: 0,
      name: '',
      quantity: 0,
      unit: 'ml',
      batch_number: '',
    });
    setIsModalOpen(true);
  };

  const handleEditChemical = (index: number) => {
    const chemical = fumigationChemicals[index];
    setEditingIndex(index);
    setCurrentChemical({
      chemical_id: chemical.chemical_id,
      name: chemical.name || '',
      quantity: chemical.quantity,
      unit: chemical.unit || 'ml',
      batch_number: chemical.batch_number || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveChemical = () => {
    if (!currentChemical.chemical_id || currentChemical.chemical_id === 0) {
      alert('Please select a chemical from the database');
      return;
    }

    if (!currentChemical.quantity || currentChemical.quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    // Use API-compliant structure with database chemical_id
    const chemical: FumigationChemical = {
      chemical_id: currentChemical.chemical_id,
      quantity: currentChemical.quantity,
      batch_number: currentChemical.batch_number || '',
      batch_number_note: '', // Will be added to UI later if needed
      name: currentChemical.name, // Keep for display purposes
      unit: currentChemical.unit
    };

    if (editingIndex !== null) {
      updateFumigationChemical(editingIndex, chemical);
    } else {
      addFumigationChemical(chemical);
    }

    setIsModalOpen(false);
  };

  const handleDeleteChemical = (index: number) => {
    if (confirm('Are you sure you want to remove this chemical?')) {
      removeFumigationChemical(index);
    }
  };

  // Insect Monitor Management Functions
  const handleAddMonitor = () => {
    setEditingMonitorIndex(null);
    setCurrentMonitor({
      type: 'box',
      glue_board: '1',
      serviced: false,
      tubes: undefined,
    });
    setIsMonitorModalOpen(true);
  };

  const handleEditMonitor = (index: number) => {
    const monitor = insectMonitors[index];
    setEditingMonitorIndex(index);
    setCurrentMonitor({ ...monitor });
    setIsMonitorModalOpen(true);
  };

  const handleSaveMonitor = () => {
    console.log('Saving monitor:', currentMonitor);

    if (editingMonitorIndex !== null) {
      const updatedMonitors = [...insectMonitors];
      updatedMonitors[editingMonitorIndex] = { ...currentMonitor };
      setInsectMonitors(updatedMonitors);
    } else {
      setInsectMonitors([...insectMonitors, { ...currentMonitor }]);
    }

    setIsMonitorModalOpen(false);
  };

  const handleDeleteMonitor = (index: number) => {
    if (confirm('Are you sure you want to remove this insect monitor?')) {
      const updatedMonitors = insectMonitors.filter((_, i) => i !== index);
      setInsectMonitors(updatedMonitors);
    }
  };

  const handleSave = () => {
    console.log('Saving fumigation data:', {
      treated_areas: treatedAreas,
      treated_for: treatedFor,
      insect_monitor_replaced: insectMonitorReplaced ? 1 : 0,
      general_remarks: generalRemarks,
      insect_monitors: insectMonitors,
      chemicals_count: fumigationChemicals.length
    });

    // Save data according to mobile-report.md API structure
    updateReportData({
      fumigation: {
        treated_areas: treatedAreas,
        target_pests: treatedFor, // Legacy field name, same as treated_for
        treated_for: treatedFor,
        application_method: 'spray', // Default application method
        fumigation_notes: generalRemarks.trim(),
        insect_monitor_replaced: insectMonitorReplaced ? 1 : 0,
        general_remarks: generalRemarks.trim(),
        insect_monitors: insectMonitors,
        chemicals_used: fumigationChemicals.map(chemical => ({
          chemical_id: chemical.chemical_id,
          quantity: chemical.quantity,
          batch_number: chemical.batch_number || '',
          batch_number_note: chemical.batch_number_note || ''
        }))
      }
    });
  };

  const handleNext = () => {
    if (fumigationChemicals.length === 0) {
      alert('Please add at least one fumigation chemical before continuing.');
      return;
    }

    handleSave();
    navigate('/mobile/reports/new?step=overall');
  };

  const handleBack = () => {
    handleSave();
    navigate('/mobile/reports/new?step=inspection-remarks');
  };

  if (!reportInProgress || !currentReport) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">No report in progress</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            onClick={() => navigate('/mobile/schedule')}
          >
            Back to Schedule
          </button>
        </div>
      </div>
    );
  }

  if (!currentReport.report_types?.includes('fumigation')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Fumigation not included in this report</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            onClick={() => navigate('/mobile/reports/new?step=overall')}
          >
            Continue to Overall Remarks
          </button>
        </div>
      </div>
    );
  }

  const canContinue = fumigationChemicals.length > 0;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          className="p-1"
        >
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>
        <div>
          <h1 className="text-base font-medium text-gray-900">Fumigation Treatment</h1>
          <p className="text-xs text-gray-500">Step 4 of 7 - Chemical application details</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-700">Progress</span>
          <span className="text-xs text-gray-500">4/7</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div className="bg-blue-500 h-1 rounded-full" style={{ width: '57.1%' }}></div>
        </div>
      </div>

      {/* Chemicals Used */}
      <div className="bg-white rounded p-3 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-900">
            Chemicals Used ({fumigationChemicals.length})
          </h2>
          <button
            onClick={handleAddChemical}
            className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
          >
            <Plus className="w-3 h-3" />
            Add Chemical
          </button>
        </div>

        {fumigationChemicals.length > 0 ? (
          <div className="space-y-2">
            {fumigationChemicals.map((chemical, index) => (
              <div key={index} className="border border-gray-200 rounded p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-orange-500" />
                      <h3 className="text-sm font-medium text-gray-900">{chemical.name}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-gray-500">Quantity</p>
                        <p className="font-medium text-gray-900">
                          {chemical.quantity} {chemical.unit}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-gray-500">Batch Number</p>
                        <p className="font-medium text-gray-900">
                          {chemical.batch_number || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1 ml-3">
                    <button
                      onClick={() => handleEditChemical(index)}
                      className="p-1 hover:bg-gray-50 rounded"
                    >
                      <Edit className="w-3 h-3 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDeleteChemical(index)}
                      className="p-1 hover:bg-gray-50 rounded"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Zap className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">No Chemicals Added</h3>
            <p className="text-xs text-gray-500 mb-3">
              Add the chemicals used during fumigation treatment.
            </p>
            <button
              onClick={handleAddChemical}
              className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 mx-auto"
            >
              <Plus className="w-3 h-3" />
              Add First Chemical
            </button>
          </div>
        )}
      </div>

      {/* Treated Areas */}
      <div className="bg-white rounded p-3 space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Areas Treated</h3>
        <div className="space-y-2">
          {areaOptions.map((area) => (
            <label key={area} className="flex items-center gap-2 p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={treatedAreas.includes(area)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setTreatedAreas([...treatedAreas, area]);
                  } else {
                    setTreatedAreas(treatedAreas.filter(a => a !== area));
                  }
                }}
              />
              <span className="text-sm">
                {area.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          Select all areas where fumigation treatment was applied.
        </p>
      </div>

      {/* Target Pests */}
      <div className="bg-white rounded p-3 space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Target Pests</h3>
        <div className="space-y-2">
          {pestOptions.map((pest) => (
            <label key={pest} className="flex items-center gap-2 p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={treatedFor.includes(pest)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setTreatedFor([...treatedFor, pest]);
                  } else {
                    setTreatedFor(treatedFor.filter(p => p !== pest));
                  }
                }}
              />
              <span className="text-sm">
                {pest.replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          Select all pests that were targeted during the fumigation treatment.
        </p>
      </div>

      {/* Insect Monitors Management */}
      <div className="bg-white rounded p-3 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Insect Monitors</h3>
          <button
            onClick={handleAddMonitor}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus className="w-3 h-3" />
            Add Monitor
          </button>
        </div>

        {insectMonitors.length > 0 ? (
          <div className="space-y-2">
            {insectMonitors.map((monitor, index) => (
              <div key={index} className="border border-gray-200 rounded p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Monitor className="w-4 h-4 text-blue-500" />
                      <h4 className="text-sm font-medium text-gray-900">
                        {monitor.type === 'box' ? 'Box Monitor' : 'Light Monitor'}
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-gray-500">Glue Board</p>
                        <p className="font-medium text-gray-900">{monitor.glue_board}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-500">Serviced</p>
                        <p className="font-medium text-gray-900">
                          {monitor.serviced ? 'Yes' : 'No'}
                        </p>
                      </div>

                      {monitor.type === 'light' && monitor.tubes && (
                        <div className="col-span-2">
                          <p className="text-gray-500">Tubes</p>
                          <p className="font-medium text-gray-900">{monitor.tubes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1 ml-3">
                    <button
                      onClick={() => handleEditMonitor(index)}
                      className="p-1 hover:bg-gray-50 rounded"
                    >
                      <Edit className="w-3 h-3 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDeleteMonitor(index)}
                      className="p-1 hover:bg-gray-50 rounded"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <Monitor className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No insect monitors added</p>
            <p className="text-xs">Click "Add Monitor" to start tracking insect monitoring devices</p>
          </div>
        )}

        {/* Legacy checkbox for backward compatibility */}
        <label className="flex items-center gap-2 p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
          <input
            type="checkbox"
            checked={insectMonitorReplaced}
            onChange={(e) => setInsectMonitorReplaced(e.target.checked)}
          />
          <span className="text-sm">General insect monitor replacement during treatment</span>
        </label>
        <p className="text-xs text-gray-500">
          Add specific insect monitors above or use the general checkbox for backward compatibility.
        </p>
      </div>

      {/* General Remarks */}
      <div className="bg-white rounded p-3 space-y-3">
        <h3 className="text-sm font-medium text-gray-900">General Remarks</h3>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Treatment remarks</label>
          <textarea
            value={generalRemarks}
            onChange={(e) => setGeneralRemarks(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded text-sm"
            rows={3}
            placeholder="e.g., Heavy infestation in kitchen area, additional treatment recommended..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Provide detailed remarks about the fumigation treatment and observations.
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-2 pt-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded text-sm hover:bg-gray-50 flex-1 justify-center"
        >
          <ArrowLeft className="w-3 h-3" />
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!canContinue}
          className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex-1 justify-center disabled:opacity-50"
        >
          Continue
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Chemical Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md border border-white/20 shadow-xl rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b">
              <h3 className="text-base font-medium text-gray-900">
                {editingIndex !== null ? 'Edit Chemical' : 'Add Chemical'}
              </h3>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Select Chemical from Database *</label>
                <select
                  value={currentChemical.chemical_id.toString()}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedChemical = chemicals.find(c => c.id.toString() === selectedId);
                    if (selectedChemical) {
                      setCurrentChemical(prev => ({ 
                        ...prev, 
                        chemical_id: selectedChemical.id,
                        name: selectedChemical.name,
                        unit: selectedChemical.quantity_unit || 'ml'
                      }));
                    }
                  }}
                  className="w-full p-2 border border-gray-200 rounded text-sm"
                  required
                >
                  <option value="0">Choose a chemical</option>
                  {chemicals
                    .filter(chemical => chemical.category === 'fumigation' || chemical.category === 'both')
                    .map(chemical => (
                      <option key={chemical.id} value={chemical.id.toString()}>
                        {chemical.name}{chemical.active_ingredient ? ` (${chemical.active_ingredient})` : ''}
                      </option>
                    ))
                  }
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Quantity Used *</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={currentChemical.quantity.toString()}
                    onChange={(e) => setCurrentChemical(prev => ({ 
                      ...prev, 
                      quantity: parseFloat(e.target.value) || 0
                    }))}
                    className="w-full p-2 border border-gray-200 rounded text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Unit</label>
                  <input
                    type="text"
                    value={currentChemical.unit}
                    className="w-full p-2 border border-gray-200 rounded text-sm bg-gray-50"
                    disabled
                    readOnly
                  />
                  <p className="text-xs text-gray-400 mt-1">Unit is automatically set from the selected chemical</p>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Batch Number</label>
                <input
                  type="text"
                  placeholder="Chemical batch number"
                  value={currentChemical.batch_number}
                  onChange={(e) => setCurrentChemical(prev => ({ ...prev, batch_number: e.target.value }))}
                  className="w-full p-2 border border-gray-200 rounded text-sm"
                />
              </div>
            </div>
            
            <div className="p-4 border-t flex gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChemical}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                {editingIndex !== null ? 'Update Chemical' : 'Add Chemical'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insect Monitor Modal */}
      {isMonitorModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md border border-white/20 shadow-xl rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b">
              <h3 className="text-base font-medium text-gray-900">
                {editingMonitorIndex !== null ? 'Edit Insect Monitor' : 'Add Insect Monitor'}
              </h3>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Monitor Type *</label>
                <select
                  value={currentMonitor.type}
                  onChange={(e) => setCurrentMonitor(prev => ({ 
                    ...prev, 
                    type: e.target.value as 'box' | 'light',
                    tubes: e.target.value === 'light' ? prev.tubes || 1 : undefined
                  }))}
                  className="w-full p-2 border border-gray-200 rounded text-sm"
                  required
                >
                  <option value="box">Box Monitor</option>
                  <option value="light">Light Monitor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Glue Board *</label>
                <select
                  value={currentMonitor.glue_board}
                  onChange={(e) => setCurrentMonitor(prev => ({ 
                    ...prev, 
                    glue_board: e.target.value
                  }))}
                  className="w-full p-2 border border-gray-200 rounded text-sm"
                  required
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {currentMonitor.type === 'light' && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Number of Tubes</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={currentMonitor.tubes || ''}
                    onChange={(e) => setCurrentMonitor(prev => ({ 
                      ...prev, 
                      tubes: parseInt(e.target.value) || undefined
                    }))}
                    className="w-full p-2 border border-gray-200 rounded text-sm"
                  />
                </div>
              )}

              <div>
                <label className="flex items-center gap-2 p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={currentMonitor.serviced}
                    onChange={(e) => setCurrentMonitor(prev => ({ 
                      ...prev, 
                      serviced: e.target.checked
                    }))}
                  />
                  <span className="text-sm">Monitor was serviced</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Check if this monitor was serviced during the treatment.
                </p>
              </div>
            </div>
            
            <div className="p-4 border-t flex gap-2">
              <button
                onClick={() => setIsMonitorModalOpen(false)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMonitor}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                {editingMonitorIndex !== null ? 'Update Monitor' : 'Add Monitor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
