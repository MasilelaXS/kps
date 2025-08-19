import React, { useState } from 'react';
import { Spinner } from '@heroui/react';
import { ArrowLeft, MapPin, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMobileStore } from '../../../stores/mobileStore';

export const ClientDetails: React.FC = () => {
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const { 
    assignedClients,
    startReport,
    isLoading, 
    error 
  } = useMobileStore();

  const [selectedReportTypes, setSelectedReportTypes] = useState<string[]>([]);
  const [serviceDate, setServiceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Find the client from the assigned clients list
  const client = assignedClients.find(c => c.id === parseInt(clientId || '0'));

  const handleReportTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedReportTypes(prev => [...prev, type]);
    } else {
      setSelectedReportTypes(prev => prev.filter(t => t !== type));
    }
  };

  const handleStartReport = () => {
    if (!client || selectedReportTypes.length === 0) {
      return;
    }

    // Determine the report type
    let reportType: 'inspection' | 'fumigation' | 'both';
    if (selectedReportTypes.length === 1) {
      reportType = selectedReportTypes[0] as 'inspection' | 'fumigation';
    } else {
      reportType = 'both';
    }

    // Start the report with callback to navigate after store is updated
    startReport(client.id, reportType, () => {
      navigate('/mobile/reports/new');
    });
  };

  const canStartReport = selectedReportTypes.length > 0 && serviceDate;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-gray-600">Loading client details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Failed to load client details</p>
          <p className="text-gray-500 text-sm">{error}</p>
          <button
            className="mt-4 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded"
            onClick={() => navigate('/mobile/schedule')}
          >
            Back to Clients
          </button>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Client not found</p>
          <button
            className="mt-4 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded"
            onClick={() => navigate('/mobile/schedule')}
          >
            Back to Clients
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
          onClick={() => navigate('/mobile/schedule')}
          className="p-1"
        >
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>
        <div>
          <h1 className="text-base font-medium text-gray-900">{client.name}</h1>
          <p className="text-xs text-gray-500">Client Details</p>
        </div>
      </div>

      {/* Client Information */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-gray-900">Client Information</h2>
        
        <div className="space-y-2">
          <div>
            <p className="text-xs text-gray-500">Name</p>
            <p className="text-sm text-gray-900">{client.name}</p>
          </div>
          
          <div className="flex items-start gap-2">
            <MapPin className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Address</p>
              <p className="text-sm text-gray-900">{client.address}</p>
            </div>
          </div>

          {client.last_service_date && (
            <div>
              <p className="text-xs text-gray-500">Last Service</p>
              <p className="text-sm text-gray-900">{new Date(client.last_service_date).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Create New Report */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-gray-900">Create New Report</h2>
        
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-2">Select Report Type</p>
            
            {/* Inspection Option */}
            <div className="mb-2">
              <label className="flex items-start gap-2 p-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedReportTypes.includes('inspection')}
                  onChange={(e) => handleReportTypeChange('inspection', e.target.checked)}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm text-gray-900">Inspection</p>
                  <p className="text-xs text-gray-500">Monitor bait stations</p>
                </div>
              </label>
            </div>

            {/* Fumigation Option */}
            <div>
              <label className="flex items-start gap-2 p-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedReportTypes.includes('fumigation')}
                  onChange={(e) => handleReportTypeChange('fumigation', e.target.checked)}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm text-gray-900">Fumigation</p>
                  <p className="text-xs text-gray-500">Chemical treatment</p>
                </div>
              </label>
            </div>
          </div>

          {/* Service Date */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Service Date
            </label>
            <input
              type="date"
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full p-2 border border-gray-200 rounded text-sm text-gray-900"
            />
            <p className="text-xs text-gray-400 mt-1">Service date cannot be later than today</p>
          </div>

          {/* Start Report Button */}
          <button
            disabled={!canStartReport}
            onClick={handleStartReport}
            className={`w-full p-3 rounded text-sm font-medium ${
              canStartReport 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Start Report
          </button>
        </div>
      </div>
    </div>
  );
};
