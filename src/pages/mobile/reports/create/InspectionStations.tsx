import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Plus, Edit, Trash2, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMobileStore } from '../../../../stores/mobileStore';
import type { InspectionStation } from '../../../../types/mobile';

export const InspectionStations: React.FC = () => {
  const navigate = useNavigate();
  const { 
    currentReport, 
    reportInProgress,
    chemicals,
    setCurrentStep,
    addStation,
    updateStation,
    removeStation,
    loadChemicals
  } = useMobileStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [stationNumber, setStationNumber] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'all' | 'inside' | 'outside'>('all');
  const [currentStation, setCurrentStation] = useState<Omit<InspectionStation, 'station_number'>>({
    location: 'outside',
    is_accessible: true,
    access_reason: '',
    has_activity: false,
    activity_type: undefined,
    activity_type_other: '',
    activity_description: '',
    station_condition: [],
    bait_status: 'eaten',
    rodent_box_replaced: false,
    poison_used_id: undefined,
    poison_quantity: undefined,
    batch_number: '',
    batch_number_note: '',
    station_remarks: ''
  });

  useEffect(() => {
    setCurrentStep('inspection-stations');
  }, [setCurrentStep]);

  useEffect(() => {
    if (!reportInProgress || !currentReport) {
      navigate('/mobile/schedule');
    }
  }, [reportInProgress, currentReport, navigate]);

  useEffect(() => {
    // Load chemicals for dropdown
    loadChemicals();
  }, [loadChemicals]);

  const stations = currentReport?.inspection_stations || [];
  
  // Filter stations based on active tab
  const filteredStations = stations.filter(station => {
    if (activeTab === 'all') return true;
    return station.location === activeTab;
  });

  // Count stations by location
  const insideCount = stations.filter(s => s.location === 'inside').length;
  const outsideCount = stations.filter(s => s.location === 'outside').length;

  const handleAddStation = () => {
    setEditingIndex(null);
    setStationNumber(stations.length + 1); // Auto-generate next station number
    setCurrentStation({
      location: 'outside',
      is_accessible: true,
      access_reason: '',
      has_activity: false,
      activity_type: undefined,
      activity_type_other: '',
      activity_description: '',
      station_condition: [],
      bait_status: 'eaten',
      rodent_box_replaced: false,
      poison_used_id: undefined,
      poison_quantity: undefined,
      batch_number: '',
      batch_number_note: '',
      station_remarks: ''
    });
    setIsModalOpen(true);
  };

  const handleEditStation = (index: number) => {
    const station = stations[index];
    setEditingIndex(index);
    setStationNumber(station.station_number); // Set current station number for editing
    setCurrentStation({
      location: station.location,
      is_accessible: station.is_accessible,
      access_reason: station.access_reason || '',
      has_activity: station.has_activity,
      activity_type: station.activity_type,
      activity_type_other: station.activity_type_other || '',
      activity_description: station.activity_description || '',
      station_condition: station.station_condition || [],
      bait_status: station.bait_status,
      rodent_box_replaced: station.rodent_box_replaced || false,
      poison_used_id: station.poison_used_id,
      poison_quantity: station.poison_quantity,
      batch_number: station.batch_number || '',
      batch_number_note: station.batch_number_note || '',
      station_remarks: station.station_remarks || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveStation = () => {
    const station: InspectionStation = {
      ...currentStation,
      station_number: stationNumber // Use the stationNumber state
    };

    if (editingIndex !== null) {
      updateStation(editingIndex, station);
    } else {
      addStation(station);
    }

    setIsModalOpen(false);
  };

  const handleDeleteStation = (index: number) => {
    if (confirm('Are you sure you want to delete this station?')) {
      removeStation(index);
    }
  };

  const handleNext = () => {
    if (stations.length === 0) {
      alert('Please add at least one inspection station before continuing.');
      return;
    }
    navigate('/mobile/reports/new?step=inspection-remarks');
  };

  const handleBack = () => {
    navigate('/mobile/reports/new?step=basic-info');
  };

  const canContinue = stations.length > 0;

  if (!reportInProgress || !currentReport) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">No report in progress</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => navigate('/mobile/schedule')}
          >
            Back to Schedule
          </button>
        </div>
      </div>
    );
  }

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
          <h1 className="text-base font-medium text-gray-900">Inspection Stations</h1>
          <p className="text-xs text-gray-500">Step 2 of 7 - Add bait stations</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-700">Progress</span>
          <span className="text-xs text-gray-500">2/7</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div className="bg-blue-500 h-1 rounded-full" style={{ width: '28.6%' }}></div>
        </div>
      </div>

      {/* Stations List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-900">
            Inspection Stations ({stations.length})
          </h2>
          <button
            onClick={handleAddStation}
            className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
          >
            <Plus className="w-3 h-3" />
            Add Station
          </button>
        </div>

        {/* Location Tabs */}
        {stations.length > 0 && (
          <div className="flex bg-gray-100 rounded p-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 px-3 py-1 text-xs rounded transition-colors ${
                activeTab === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              All ({stations.length})
            </button>
            <button
              onClick={() => setActiveTab('inside')}
              className={`flex-1 px-3 py-1 text-xs rounded transition-colors ${
                activeTab === 'inside'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Inside ({insideCount})
            </button>
            <button
              onClick={() => setActiveTab('outside')}
              className={`flex-1 px-3 py-1 text-xs rounded transition-colors ${
                activeTab === 'outside'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Outside ({outsideCount})
            </button>
          </div>
        )}

        {filteredStations.length > 0 ? (
          <div className="space-y-2">
            {filteredStations.map((station) => {
              // Find the original index in the full stations array for editing/deleting
              const originalIndex = stations.findIndex(s => s.station_number === station.station_number);
              return (
                <div key={originalIndex} className="bg-white border border-gray-200 rounded p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                          {station.station_number}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className={`px-2 py-0.5 text-xs rounded ${
                            station.location === 'inside' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {station.location === 'inside' ? 'Inside' : 'Outside'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-500">Status</p>
                          <div className="flex items-center gap-1">
                            {station.is_accessible ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : (
                              <AlertTriangle className="w-3 h-3 text-red-500" />
                            )}
                            <span className={station.is_accessible ? 'text-green-600' : 'text-red-600'}>
                              {station.is_accessible ? 'Accessible' : 'Inaccessible'}
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-gray-500">Activity</p>
                          <p className={`font-medium ${station.has_activity ? 'text-orange-600' : 'text-green-600'}`}>
                            {station.has_activity ? 'Activity Detected' : 'No Activity'}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-500">Bait Status</p>
                          <p className="font-medium text-gray-900 capitalize">
                            {station.bait_status?.replace('_', ' ') || station.bait_status || 'N/A'}
                          </p>
                        </div>

                        {station.poison_quantity && (
                          <div>
                            <p className="text-gray-500">Poison Used</p>
                            <p className="font-medium text-gray-900">
                              {station.poison_quantity}g
                            </p>
                          </div>
                        )}
                      </div>

                      {station.station_remarks && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          <p className="text-gray-600">{station.station_remarks}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => handleEditStation(originalIndex)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Edit className="w-3 h-3 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteStation(originalIndex)}
                        className="p-1 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : stations.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">No Stations Added</h3>
            <p className="text-xs text-gray-500 mb-3">
              Add inspection stations to record bait placement and pest activity monitoring.
            </p>
            <button
              onClick={handleAddStation}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 mx-auto"
            >
              <Plus className="w-3 h-3" />
              Add First Station
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              No {activeTab === 'inside' ? 'Inside' : activeTab === 'outside' ? 'Outside' : ''} Stations
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              {activeTab === 'inside' 
                ? 'No stations added for inside locations yet.' 
                : activeTab === 'outside' 
                ? 'No stations added for outside locations yet.'
                : 'No stations match the current filter.'}
            </p>
            <button
              onClick={handleAddStation}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 mx-auto"
            >
              <Plus className="w-3 h-3" />
              Add Station
            </button>
          </div>
        )}
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
          className={`flex items-center gap-1 px-3 py-2 rounded text-sm flex-1 justify-center ${
            canContinue 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Station Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b">
              <h3 className="text-base font-medium text-gray-900">
                {editingIndex !== null ? 'Edit Station' : 'Add Station'}
              </h3>
            </div>
            <div className="p-4 space-y-4">
              {/* Station Number */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Station Number</label>
                <input
                  type="number"
                  value={stationNumber.toString()}
                  onChange={(e) => setStationNumber(parseInt(e.target.value) || 1)}
                  className="w-full p-2 border border-gray-200 rounded text-sm"
                  placeholder="Enter station number"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">Station Location</label>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="location"
                      value="inside"
                      checked={currentStation.location === 'inside'}
                      onChange={(e) => setCurrentStation(prev => ({ ...prev, location: e.target.value as 'inside' | 'outside' }))}
                    />
                    <span className="text-sm">Inside</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="location"
                      value="outside"
                      checked={currentStation.location === 'outside'}
                      onChange={(e) => setCurrentStation(prev => ({ ...prev, location: e.target.value as 'inside' | 'outside' }))}
                    />
                    <span className="text-sm">Outside</span>
                  </label>
                </div>
              </div>

              {/* Accessibility */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">Station Accessible</label>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="accessible"
                      value="yes"
                      checked={currentStation.is_accessible}
                      onChange={() => setCurrentStation(prev => ({ ...prev, is_accessible: true }))}
                    />
                    <span className="text-sm">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="accessible"
                      value="no"
                      checked={!currentStation.is_accessible}
                      onChange={() => setCurrentStation(prev => ({ ...prev, is_accessible: false }))}
                    />
                    <span className="text-sm">No</span>
                  </label>
                </div>
              </div>

              {/* Access Reason */}
              {!currentStation.is_accessible && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Reason for Inaccessibility</label>
                  <textarea
                    value={currentStation.access_reason}
                    onChange={(e) => setCurrentStation(prev => ({ ...prev, access_reason: e.target.value }))}
                    className="w-full p-2 border border-gray-200 rounded text-sm"
                    rows={2}
                    placeholder="e.g., Locked door, blocked area, etc."
                  />
                </div>
              )}

              {/* Activity Detection */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">Activity Detected</label>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="activity"
                      value="no"
                      checked={!currentStation.has_activity}
                      onChange={() => setCurrentStation(prev => ({ ...prev, has_activity: false }))}
                    />
                    <span className="text-sm">No</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="activity"
                      value="yes"
                      checked={currentStation.has_activity}
                      onChange={() => setCurrentStation(prev => ({ ...prev, has_activity: true }))}
                    />
                    <span className="text-sm">Yes</span>
                  </label>
                </div>
              </div>

              {/* Activity Type */}
              {currentStation.has_activity && (
                <>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Activity Type</label>
                    <select
                      value={currentStation.activity_type || ''}
                      onChange={(e) => setCurrentStation(prev => ({ ...prev, activity_type: e.target.value as 'droppings' | 'gnawing' | 'tracks' | 'other' }))}
                      className="w-full p-2 border border-gray-200 rounded text-sm"
                    >
                      <option value="">Select activity type</option>
                      <option value="droppings">Droppings</option>
                      <option value="gnawing">Gnawing</option>
                      <option value="tracks">Tracks</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {currentStation.activity_type === 'other' && (
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Specify Other Activity Type</label>
                      <input
                        type="text"
                        value={currentStation.activity_type_other}
                        onChange={(e) => setCurrentStation(prev => ({ ...prev, activity_type_other: e.target.value }))}
                        className="w-full p-2 border border-gray-200 rounded text-sm"
                        placeholder="Describe the other type of activity"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Activity Description</label>
                    <textarea
                      value={currentStation.activity_description}
                      onChange={(e) => setCurrentStation(prev => ({ ...prev, activity_description: e.target.value }))}
                      className="w-full p-2 border border-gray-200 rounded text-sm"
                      rows={2}
                      placeholder="Describe the observed activity"
                    />
                  </div>
                </>
              )}

              {/* Bait Status */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Bait Status</label>
                <select
                  value={currentStation.bait_status}
                  onChange={(e) => setCurrentStation(prev => ({ ...prev, bait_status: e.target.value as 'eaten' | 'clean' | 'wet' }))}
                  className="w-full p-2 border border-gray-200 rounded text-sm"
                >
                  <option value="eaten">Eaten</option>
                  <option value="clean">Clean</option>
                  <option value="wet">Wet</option>
                </select>
              </div>

              {/* Station Condition */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">Station Condition (select all that apply)</label>
                <div className="space-y-1">
                  {['good', 'needs_repair', 'damaged', 'missing'].map((condition) => (
                    <label key={condition} className="flex items-center gap-2 p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={currentStation.station_condition?.includes(condition) || false}
                        onChange={(e) => {
                          const newConditions = currentStation.station_condition || [];
                          if (e.target.checked) {
                            setCurrentStation(prev => ({ 
                              ...prev, 
                              station_condition: [...newConditions, condition] 
                            }));
                          } else {
                            setCurrentStation(prev => ({ 
                              ...prev, 
                              station_condition: newConditions.filter(c => c !== condition) 
                            }));
                          }
                        }}
                      />
                      <span className="text-sm capitalize">{condition?.replace('_', ' ') || condition}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rodent Box Replaced */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">Rodent Box Replaced</label>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="boxReplaced"
                      value="no"
                      checked={!currentStation.rodent_box_replaced}
                      onChange={() => setCurrentStation(prev => ({ ...prev, rodent_box_replaced: false }))}
                    />
                    <span className="text-sm">No</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="boxReplaced"
                      value="yes"
                      checked={currentStation.rodent_box_replaced}
                      onChange={() => setCurrentStation(prev => ({ ...prev, rodent_box_replaced: true }))}
                    />
                    <span className="text-sm">Yes</span>
                  </label>
                </div>
              </div>

              {/* Chemical Usage */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Poison/Chemical Used</label>
                <select
                  value={currentStation.poison_used_id?.toString() || ''}
                  onChange={(e) => setCurrentStation(prev => ({ 
                    ...prev, 
                    poison_used_id: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  className="w-full p-2 border border-gray-200 rounded text-sm"
                >
                  <option value="">Select chemical (optional)</option>
                  {chemicals
                    .filter(chemical => chemical.category === 'inspection' || chemical.category === 'both')
                    .map(chemical => (
                      <option key={chemical.id} value={chemical.id}>
                        {chemical.name}{chemical.active_ingredient ? ` (${chemical.active_ingredient})` : ''}
                      </option>
                    ))
                  }
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Poison Quantity (grams)</label>
                <input
                  type="number"
                  value={currentStation.poison_quantity?.toString() || ''}
                  onChange={(e) => setCurrentStation(prev => ({ 
                    ...prev, 
                    poison_quantity: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  className="w-full p-2 border border-gray-200 rounded text-sm"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Batch Number</label>
                <input
                  type="text"
                  value={currentStation.batch_number}
                  onChange={(e) => setCurrentStation(prev => ({ ...prev, batch_number: e.target.value }))}
                  className="w-full p-2 border border-gray-200 rounded text-sm"
                  placeholder="Enter batch number"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Batch Number Note</label>
                <textarea
                  value={currentStation.batch_number_note}
                  onChange={(e) => setCurrentStation(prev => ({ ...prev, batch_number_note: e.target.value }))}
                  className="w-full p-2 border border-gray-200 rounded text-sm"
                  rows={2}
                  placeholder="Add note about batch number (optional)"
                />
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Station Remarks</label>
                <textarea
                  value={currentStation.station_remarks}
                  onChange={(e) => setCurrentStation(prev => ({ ...prev, station_remarks: e.target.value }))}
                  className="w-full p-2 border border-gray-200 rounded text-sm"
                  placeholder="Any additional notes about this station"
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
                onClick={handleSaveStation}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                {editingIndex !== null ? 'Update Station' : 'Add Station'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
