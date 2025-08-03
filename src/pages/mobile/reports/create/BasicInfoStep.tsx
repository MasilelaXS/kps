import React, { useEffect } from 'react';
import { ArrowLeft, ArrowRight, Calendar, User, Building, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMobileStore } from '../../../../stores/mobileStore';
import { useAuthStore } from '../../../../stores/authStore';

export const BasicInfoStep: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    currentReport, 
    reportInProgress,
    setCurrentStep,
    updateReportData,
    clearCurrentReport
  } = useMobileStore();

  useEffect(() => {
    console.log('BasicInfoStep mounted - checking report state:', { 
      reportInProgress, 
      currentReport: currentReport ? 'exists' : 'null',
      currentReportId: currentReport?.id,
      clientName: currentReport?.client?.name 
    });
    
    setCurrentStep('basic-info');
  }, [setCurrentStep, reportInProgress, currentReport]);

  useEffect(() => {
    console.log('BasicInfoStep - useEffect check:', { 
      reportInProgress, 
      currentReport: currentReport ? 'exists' : 'null',
      currentReportId: currentReport?.id,
      redirecting: !reportInProgress || !currentReport,
      currentReportData: currentReport
    });
    
    // If there's no report in progress, redirect back to schedule
    if (!reportInProgress || !currentReport) {
      console.log('No report in progress, redirecting to schedule', { reportInProgress, currentReport });
      navigate('/mobile/schedule');
      return;
    }

    // Update the PCO ID in the report data
    if (user?.id && currentReport.pco_id !== user.id) {
      updateReportData({ pco_id: user.id });
    }
  }, [reportInProgress, currentReport, navigate, user, updateReportData]);

  const handleNext = () => {
    if (!currentReport) return;

    // Navigate to the appropriate next step based on report type using URL parameters
    if (currentReport.report_type === 'inspection') {
      navigate('/mobile/reports/new?step=stations');
    } else if (currentReport.report_type === 'fumigation') {
      navigate('/mobile/reports/new?step=fumigation');
    } else if (currentReport.report_type === 'both') {
      navigate('/mobile/reports/new?step=stations');
    }
  };

  const handleBack = () => {
    clearCurrentReport();
    navigate('/mobile/schedule');
  };

  if (!reportInProgress || !currentReport) {
    console.log('BasicInfoStep - rendering "No report in progress"', { reportInProgress, currentReport });
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">No report in progress</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleBack}
          >
            Back to Schedule
          </button>
        </div>
      </div>
    );
  }

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'inspection': return 'Inspection Only';
      case 'fumigation': return 'Fumigation Only';
      case 'both': return 'Inspection + Fumigation';
      default: return type;
    }
  };

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
          <h1 className="text-base font-medium text-gray-900">New Report</h1>
          <p className="text-xs text-gray-500">Step 1 of 7 - Basic Information</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-700">Progress</span>
          <span className="text-xs text-gray-500">1/7</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div className="bg-blue-500 h-1 rounded-full" style={{ width: '14.3%' }}></div>
        </div>
      </div>

      {/* Report Summary */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <h2 className="text-sm font-medium text-gray-900">Report Summary</h2>
        </div>
        
        <div className="space-y-2">
          {/* Client Information */}
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <Building className="w-3 h-3 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Client</p>
              <p className="text-sm text-gray-900">{currentReport.client?.name}</p>
              <p className="text-xs text-gray-600">{currentReport.client?.address}</p>
            </div>
          </div>

          {/* PCO Information */}
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <User className="w-3 h-3 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Assigned PCO</p>
              <p className="text-sm text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-600">PCO #{user?.pco_number}</p>
            </div>
          </div>

          {/* Service Date */}
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <Calendar className="w-3 h-3 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Service Date</p>
              <p className="text-sm text-gray-900">
                {currentReport.date_of_service ? new Date(currentReport.date_of_service).toLocaleDateString() : 'Today'}
              </p>
            </div>
          </div>

          {/* Report Type */}
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <CheckCircle className="w-3 h-3 text-gray-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">Report Type</p>
              <div className="mt-1">
                {currentReport.report_types?.map(type => (
                  <span
                    key={type}
                    className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded mr-1"
                  >
                    {getReportTypeLabel(type)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Steps Preview */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Workflow Steps</h3>
        <div className="space-y-2">
          {currentReport.report_type === 'inspection' && (
            <>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <span className="text-gray-600">Basic Information</span>
                <CheckCircle className="w-3 h-3 text-green-500 ml-auto" />
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <span className="text-gray-600">Inspection Stations</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <span className="text-gray-600">Inspection Remarks</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold">4</div>
                <span className="text-gray-600">Overall Remarks</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold">5</div>
                <span className="text-gray-600">Review & Verify</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold">6</div>
                <span className="text-gray-600">Client Signature</span>
              </div>
            </>
          )}

          {currentReport.report_type === 'fumigation' && (
            <>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <span className="text-gray-600">Basic Information</span>
                <CheckCircle className="w-3 h-3 text-green-500 ml-auto" />
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <span className="text-gray-600">Fumigation Details</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <span className="text-gray-600">Overall Remarks</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold">4</div>
                <span className="text-gray-600">Review & Verify</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold">5</div>
                <span className="text-gray-600">Client Signature</span>
              </div>
            </>
          )}

          {currentReport.report_type === 'both' && (
            <>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <span className="text-gray-600">Basic Information</span>
                <CheckCircle className="w-3 h-3 text-green-500 ml-auto" />
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <span className="text-gray-600">Inspection Stations</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <span className="text-gray-600">Inspection Remarks</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold">4</div>
                <span className="text-gray-600">Fumigation Details</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold">5</div>
                <span className="text-gray-600">Overall Remarks</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold">6</div>
                <span className="text-gray-600">Review & Verify</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold">7</div>
                <span className="text-gray-600">Client Signature</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Continue Button */}
      <button
        onClick={handleNext}
        className="w-full p-3 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
      >
        Start Report Creation
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
