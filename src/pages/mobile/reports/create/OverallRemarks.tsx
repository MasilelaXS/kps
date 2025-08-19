import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, FileText, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMobileStore } from '../../../../stores/mobileStore';

export const OverallRemarks: React.FC = () => {
  const navigate = useNavigate();
  const { 
    currentReport, 
    reportInProgress,
    setCurrentStep,
    updateReportData
  } = useMobileStore();

  // API-compliant fields according to mobile-report.md
  const [overallRemarks, setOverallRemarks] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [nextServiceDate, setNextServiceDate] = useState('');

  useEffect(() => {
    setCurrentStep('overall-remarks');
  }, [setCurrentStep]);

  useEffect(() => {
    if (!reportInProgress || !currentReport) {
      navigate('/mobile/schedule');
      return;
    }

    // Load existing data - map from current structure to API structure
    setOverallRemarks(currentReport.overall_remarks || '');
    setRecommendations(currentReport.recommendations || '');
    setNextServiceDate(currentReport.next_service_date || '');
  }, [reportInProgress, currentReport, navigate]);

  const handleSave = () => {
    updateReportData({
      overall_remarks: overallRemarks.trim(),
      recommendations: recommendations.trim(),
      next_service_date: nextServiceDate
    });
  };

  const handleNext = () => {
    if (!overallRemarks.trim()) {
      alert('Please provide overall remarks before continuing.');
      return;
    }
    
    handleSave();
    navigate('/mobile/reports/new?step=verify');
  };

  const handleBack = () => {
    handleSave();
    
    // Navigate back based on report types
    const includesFumigation = currentReport?.report_types?.includes('fumigation');
    if (includesFumigation) {
      navigate('/mobile/reports/new?step=fumigation');
    } else {
      navigate('/mobile/reports/new?step=inspection-remarks');
    }
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
  const includesFumigation = currentReport.report_types?.includes('fumigation');
  const fumigationChemicals = currentReport.fumigation_chemicals || [];

  const canContinue = overallRemarks.trim().length > 0;

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
          <h1 className="text-base font-medium text-gray-900">Overall Assessment</h1>
          <p className="text-xs text-gray-500">Step 5 of 7 - Final remarks and assessment</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-700">Progress</span>
          <span className="text-xs text-gray-500">5/7</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div className="bg-blue-500 h-1 rounded-full" style={{ width: '71.4%' }}></div>
        </div>
      </div>

      {/* Report Summary */}
      <div className="bg-white rounded p-3 space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-500" />
          <h2 className="text-sm font-medium text-gray-900">Report Summary</h2>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-50 rounded p-3">
            <div>
              <p className="text-xs text-gray-600">Report Types</p>
              <div className="flex gap-1 mt-1">
                {currentReport.report_types?.map(type => (
                  <span key={type} className="px-1 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded p-3">
            <div>
              <p className="text-xs text-gray-600">Stations Inspected</p>
              <p className="text-lg font-bold text-green-600">{stations.length}</p>
            </div>
          </div>

          <div className="bg-orange-50 rounded p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Activity Detected</p>
                <p className="text-lg font-bold text-orange-600">{stationsWithActivity.length}</p>
              </div>
              {stationsWithActivity.length > 0 && <AlertCircle className="w-4 h-4 text-orange-500" />}
            </div>
          </div>

          {includesFumigation && (
            <div className="bg-purple-50 rounded p-3">
              <div>
                <p className="text-xs text-gray-600">Chemicals Used</p>
                <p className="text-lg font-bold text-purple-600">{fumigationChemicals.length}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overall Remarks */}
      <div className="bg-white rounded p-3 space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Overall Remarks</h3>
        <div>
          <label className="block text-xs text-gray-500 mb-1">General service notes *</label>
          <textarea
            value={overallRemarks}
            onChange={(e) => setOverallRemarks(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded text-sm"
            rows={4}
            placeholder="Provide comprehensive assessment of the pest control service, including effectiveness of treatments, client cooperation, environmental factors, and overall site conditions..."
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            This section should provide a complete summary of the service visit and treatment effectiveness.
          </p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded p-3 space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Recommendations</h3>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Service recommendations</label>
          <textarea
            value={recommendations}
            onChange={(e) => setRecommendations(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded text-sm"
            rows={3}
            placeholder="Provide recommendations for future visits, preventive measures, or ongoing pest management strategies..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Include recommendations for ongoing pest management and future service considerations.
          </p>
        </div>
      </div>

      {/* Next Service Date */}
      <div className="bg-white rounded p-3 space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Next Service Date</h3>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Recommended next service date</label>
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

      {/* Next Step Preview */}
      <div className="bg-blue-50 border border-blue-200 rounded p-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
            6
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-900">Next: Verification</h3>
            <p className="text-xs text-blue-700">Review all details before final submission</p>
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
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!canContinue}
          className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex-1 justify-center disabled:opacity-50"
        >
          Continue to Verification
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
