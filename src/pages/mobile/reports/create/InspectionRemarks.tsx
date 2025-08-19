import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMobileStore } from '../../../../stores/mobileStore';

export const InspectionRemarks: React.FC = () => {
  const navigate = useNavigate();
  const { 
    currentReport, 
    reportInProgress,
    setCurrentStep,
    updateReportData
  } = useMobileStore();

  // Fields according to mobile-report.md API
  const [warningSignsReplaced, setWarningSignsReplaced] = useState(false);
  const [warningSignsQuantity, setWarningSignsQuantity] = useState<number>(0);
  const [overallRemarks, setOverallRemarks] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [nextServiceDate, setNextServiceDate] = useState('');

  useEffect(() => {
    setCurrentStep('inspection-remarks');
  }, [setCurrentStep]);

  useEffect(() => {
    if (!reportInProgress || !currentReport) {
      navigate('/mobile/schedule');
      return;
    }

    // Load existing data - map from current structure to API structure
    setWarningSignsReplaced(currentReport.inspection_remarks?.warning_signs_replaced || false);
    setWarningSignsQuantity(currentReport.inspection_remarks?.warning_signs_qty || 0);
    setOverallRemarks(currentReport.overall_remarks || '');
    setRecommendations(currentReport.recommendations || '');
    setNextServiceDate(currentReport.next_service_date || '');
  }, [reportInProgress, currentReport, navigate]);

  const handleSave = () => {
    // Save data according to mobile-report.md API structure
    updateReportData({
      // Update inspection_remarks structure
      inspection_remarks: {
        warning_signs_replaced: warningSignsReplaced,
        warning_signs_qty: warningSignsQuantity,
        inspection_notes: '' // Not used in API but kept for compatibility
      },
      // API fields
      overall_remarks: overallRemarks.trim(),
      recommendations: recommendations.trim(),
      next_service_date: nextServiceDate || undefined
    });
  };

  const handleNext = () => {
    handleSave();
    
    // Check if fumigation is included
    const includesFumigation = currentReport?.report_types?.includes('fumigation');
    if (includesFumigation) {
      navigate('/mobile/reports/new?step=fumigation');
    } else {
      navigate('/mobile/reports/new?step=overall');
    }
  };

  const handleBack = () => {
    handleSave();
    navigate('/mobile/reports/new?step=stations');
  };

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

  const stations = currentReport.inspection_stations || [];
  const accessibleStations = stations.filter(s => s.is_accessible);
  const stationsWithActivity = stations.filter(s => s.has_activity);
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
          <h1 className="text-base font-medium text-gray-900">Inspection Remarks</h1>
          <p className="text-xs text-gray-500">Step 3 of 7 - Summary and recommendations</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-700">Progress</span>
          <span className="text-xs text-gray-500">3/7</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div className="bg-blue-500 h-1 rounded-full" style={{ width: '42.9%' }}></div>
        </div>
      </div>

      {/* Inspection Summary */}
      <div className="bg-white rounded p-3 space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-500" />
          <h2 className="text-sm font-medium text-gray-900">Inspection Overview</h2>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-50 rounded p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Stations</p>
                <p className="text-lg font-bold text-blue-600">{stations.length}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-blue-500" />
            </div>
          </div>

          <div className="bg-green-50 rounded p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Accessible</p>
                <p className="text-lg font-bold text-green-600">{accessibleStations.length}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          </div>

          <div className="bg-orange-50 rounded p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">With Activity</p>
                <p className="text-lg font-bold text-orange-600">{stationsWithActivity.length}</p>
              </div>
              <AlertCircle className="w-5 h-5 text-orange-500" />
            </div>
          </div>

          <div className="bg-purple-50 rounded p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Types</p>
                <div className="flex gap-1 mt-1">
                  {currentReport.report_types?.map(type => (
                    <span key={type} className="px-1 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {stationsWithActivity.length > 0 && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-orange-800 mb-1">Activity Detected</h3>
                <div className="space-y-1">
                  {stationsWithActivity.map(station => (
                    <div key={station.station_number} className="text-xs text-orange-700">
                      <span className="font-medium">Station {station.station_number}:</span> {station.activity_type} - {station.activity_description}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Warning Signs Section */}
      <div className="bg-white rounded p-3 space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Warning Signs</h3>
        
        <div>
          <p className="text-xs text-gray-500 mb-2">Were warning signs replaced?</p>
          <div className="space-y-1">
            <label className="flex items-center gap-2 p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="warningSignsReplaced"
                value="no"
                checked={!warningSignsReplaced}
                onChange={() => setWarningSignsReplaced(false)}
              />
              <span className="text-sm">No</span>
            </label>
            <label className="flex items-center gap-2 p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="warningSignsReplaced"
                value="yes"
                checked={warningSignsReplaced}
                onChange={() => setWarningSignsReplaced(true)}
              />
              <span className="text-sm">Yes</span>
            </label>
          </div>
        </div>

        {warningSignsReplaced && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Number of warning signs replaced</label>
            <input
              type="number"
              value={warningSignsQuantity.toString()}
              onChange={(e) => setWarningSignsQuantity(parseInt(e.target.value) || 0)}
              min={0}
              className="w-full p-2 border border-gray-200 rounded text-sm"
              placeholder="Enter quantity"
            />
          </div>
        )}
      </div>

      {/* Overall Remarks */}
      <div className="bg-white rounded p-3 space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Overall Remarks</h3>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Service summary and observations</label>
          <textarea
            value={overallRemarks}
            onChange={(e) => setOverallRemarks(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded text-sm"
            rows={4}
            placeholder="Provide overall remarks about the service, general findings, and any important observations..."
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Document the overall service results and key observations from today's visit.
          </p>
        </div>
      </div>

      {/* Conditional: Show recommendations and next service date only if NOT fumigation */}
      {!includesFumigation && (
        <>
          <div className="bg-white rounded p-3 space-y-3">
            <h3 className="text-sm font-medium text-gray-900">Recommendations</h3>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Treatment and prevention recommendations</label>
              <textarea
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded text-sm"
                rows={4}
                placeholder="Based on the inspection findings, provide specific recommendations for pest control measures, prevention strategies, and any immediate actions required..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Include specific treatment recommendations, prevention measures, and any follow-up actions needed.
              </p>
            </div>
          </div>

          <div className="bg-white rounded p-3 space-y-3">
            <h3 className="text-sm font-medium text-gray-900">Next Service Date</h3>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Next recommended service date (optional)</label>
              <input
                type="date"
                value={nextServiceDate}
                onChange={(e) => setNextServiceDate(e.target.value)}
                min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                className="w-full p-2 border border-gray-200 rounded text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">
                Next service date cannot be earlier than tomorrow.
              </p>
            </div>
          </div>
        </>
      )}

      {/* Next Step Preview */}
      {includesFumigation && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
              4
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-900">Next: Fumigation Details</h3>
              <p className="text-xs text-blue-700">Record fumigation procedures and chemical usage</p>
            </div>
          </div>
        </div>
      )}

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
          className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex-1 justify-center"
        >
          {includesFumigation ? 'Continue to Fumigation' : 'Continue to Remarks'}
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
