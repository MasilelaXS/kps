import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle, MapPin, Zap, FileText, User, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMobileStore } from '../../../../stores/mobileStore';
import { format } from 'date-fns';

export const VerificationScreen: React.FC = () => {
  const navigate = useNavigate();
  const { 
    currentReport, 
    reportInProgress,
    setCurrentStep
  } = useMobileStore();

  const [isLoading] = useState(false);

  useEffect(() => {
    setCurrentStep('verification');
  }, [setCurrentStep]);

  useEffect(() => {
    if (!reportInProgress || !currentReport) {
      navigate('/mobile/schedule');
    }
  }, [reportInProgress, currentReport, navigate]);

  const handleBack = () => {
    navigate('/mobile/reports/new?step=overall');
  };

  const handleNext = () => {
    navigate('/mobile/reports/new?step=signature');
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

  const stations = currentReport.inspection_stations || [];
  const stationsWithActivity = stations.filter(s => s.has_activity);
  const accessibleStations = stations.filter(s => s.is_accessible);
  const fumigationChemicals = currentReport.fumigation_chemicals || [];
  const fumigationData = currentReport.fumigation;
  const includesFumigation = currentReport.report_types?.includes('fumigation');

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
          <h1 className="text-base font-medium text-gray-900">Verification & Review</h1>
          <p className="text-xs text-gray-500">Step 6 of 7 - Review all details before signing</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-700">Progress</span>
          <span className="text-xs text-gray-500">6/7</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div className="bg-blue-500 h-1 rounded-full" style={{ width: '85.7%' }}></div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded p-3 space-y-3">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-blue-500" />
          <h2 className="text-sm font-medium text-gray-900">Service Details</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-gray-500">Client</p>
            <p className="font-medium text-gray-900">{currentReport.client?.name}</p>
          </div>
          <div>
            <p className="text-gray-500">PCO</p>
            <p className="font-medium text-gray-900">{currentReport.assigned_pco}</p>
          </div>
          <div>
            <p className="text-gray-500">Service Date</p>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-gray-400" />
              <p className="font-medium text-gray-900">
                {currentReport.service_date ? format(new Date(currentReport.service_date), 'MMM dd, yyyy') : 'Not set'}
              </p>
            </div>
          </div>
          <div>
            <p className="text-gray-500">Report Types</p>
            <div className="flex gap-1 mt-1">
              {currentReport.report_types?.map(type => (
                <span key={type} className="px-1 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Inspection Summary */}
      <div className="bg-white rounded p-3 space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-green-500" />
          <h2 className="text-sm font-medium text-gray-900">Inspection Summary</h2>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-3 bg-blue-50 rounded">
            <p className="text-lg font-bold text-blue-600">{stations.length}</p>
            <p className="text-xs text-gray-600">Total Stations</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded">
            <p className="text-lg font-bold text-green-600">{accessibleStations.length}</p>
            <p className="text-xs text-gray-600">Accessible</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded">
            <p className="text-lg font-bold text-orange-600">{stationsWithActivity.length}</p>
            <p className="text-xs text-gray-600">With Activity</p>
          </div>
        </div>

        {stations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-900">Station Details:</h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {stations.map(station => (
                <div key={station.station_number} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">#{station.station_number}</span>
                    <span className={`px-1 py-0.5 text-xs rounded ${station.location === 'inside' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {station.location}
                    </span>
                    {station.has_activity && (
                      <span className="px-1 py-0.5 text-xs bg-orange-100 text-orange-800 rounded">
                        {station.activity_type}
                      </span>
                    )}
                  </div>
                  {station.is_accessible ? (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  ) : (
                    <AlertCircle className="w-3 h-3 text-red-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fumigation Details */}
      {includesFumigation && (
        <div className="bg-white rounded p-3 space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-medium text-gray-900">Fumigation Treatment</h2>
          </div>

          <div className="p-3 bg-orange-50 rounded text-center">
            <p className="text-lg font-bold text-orange-600">{fumigationChemicals.length}</p>
            <p className="text-xs text-gray-600">Chemicals Applied</p>
          </div>

          {/* Treated Areas */}
          {fumigationData?.treated_areas && fumigationData.treated_areas.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-900 mb-2">Areas Treated:</h4>
              <div className="flex flex-wrap gap-1">
                {fumigationData.treated_areas.map(area => (
                  <span key={area} className="px-1 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                    {area.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Target Pests */}
          {fumigationData?.treated_for && fumigationData.treated_for.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-900 mb-2">Target Pests:</h4>
              <div className="flex flex-wrap gap-1">
                {fumigationData.treated_for.map(pest => (
                  <span key={pest} className="px-1 py-0.5 text-xs bg-orange-100 text-orange-800 rounded">
                    {pest.replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Insect Monitor */}
          {fumigationData?.insect_monitor_replaced === 1 && (
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-800">Insect monitor was replaced during treatment</span>
            </div>
          )}

          {fumigationChemicals.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-900">Chemical Details:</h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {fumigationChemicals.map((chemical, index) => (
                  <div key={chemical.chemical_id || index} className="p-2 bg-gray-50 rounded text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">{chemical.name || 'Unknown Chemical'}</span>
                      <span className="px-1 py-0.5 bg-gray-100 text-gray-800 rounded">
                        {chemical.quantity} {chemical.unit || 'ml'}
                      </span>
                    </div>
                    {chemical.batch_number && (
                      <div className="text-xs text-gray-600">
                        <span>Batch: {chemical.batch_number}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {fumigationData?.general_remarks && (
            <div>
              <h4 className="text-xs font-medium text-gray-900 mb-2">Treatment Remarks:</h4>
              <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
                {fumigationData.general_remarks}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Overall Assessment */}
      <div className="bg-white rounded p-3 space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-500" />
          <h2 className="text-sm font-medium text-gray-900">Overall Assessment</h2>
        </div>

        {currentReport.overall_remarks && (
          <div>
            <h4 className="text-xs font-medium text-gray-900 mb-2">Overall Remarks:</h4>
            <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
              {currentReport.overall_remarks}
            </p>
          </div>
        )}

        {currentReport.recommendations && (
          <div>
            <h4 className="text-xs font-medium text-gray-900 mb-2">Recommendations:</h4>
            <p className="text-xs text-gray-700 bg-blue-50 p-2 rounded">
              {currentReport.recommendations}
            </p>
          </div>
        )}

        {currentReport.next_service_date && (
          <div>
            <h4 className="text-xs font-medium text-gray-900 mb-2">Next Service Date:</h4>
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
              <Calendar className="w-3 h-3 text-green-600" />
              <span className="text-xs text-green-800">
                {format(new Date(currentReport.next_service_date), 'MMM dd, yyyy')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Final Step Preview */}
      <div className="bg-green-50 border border-green-200 rounded p-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-xs">
            7
          </div>
          <div>
            <h3 className="text-sm font-medium text-green-900">Final Step: Digital Signature</h3>
            <p className="text-xs text-green-700">Add your signature to complete the report</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-2 pt-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded text-sm hover:bg-gray-50 flex-1 justify-center"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Edit
        </button>
        <button
          onClick={handleNext}
          disabled={isLoading}
          className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex-1 justify-center disabled:opacity-50"
        >
          Continue to Signature
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
