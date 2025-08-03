import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, PenTool, RotateCcw, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMobileStore } from '../../../../stores/mobileStore';
import SignatureCanvas from 'react-signature-canvas';

export const SignatureScreen: React.FC = () => {
  const navigate = useNavigate();
  const { 
    currentReport, 
    reportInProgress,
    setCurrentStep,
    updateReportData,
    submitReport,
    clearCurrentReport
  } = useMobileStore();

  const sigCanvasRef = useRef<SignatureCanvas>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [signatureName, setSignatureName] = useState('');
  const [hasSignature, setHasSignature] = useState(false);
  const [preventNavigation, setPreventNavigation] = useState(false);

  useEffect(() => {
    setCurrentStep('signature');
  }, [setCurrentStep]);

  useEffect(() => {
    // Don't redirect if we're showing the success modal, currently submitting, or preventing navigation
    if (showSuccess || isSubmitting || preventNavigation) return;
    
    if (!reportInProgress || !currentReport) {
      navigate('/mobile/schedule');
      return;
    }

    // Pre-fill signature name if available (API only needs client_name, not title)
    setSignatureName(currentReport.signature_name || '');
  }, [reportInProgress, currentReport, navigate, showSuccess, isSubmitting, preventNavigation]);

  const handleClearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
      setHasSignature(false);
    }
  };

  const handleSignatureEnd = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      setHasSignature(true);
    }
  };

  const handleBack = () => {
    // Save current signature data before going back (API structure)
    if (sigCanvasRef.current && hasSignature) {
      const signatureData = sigCanvasRef.current.toDataURL();
      updateReportData({
        client_signature: {
          client_name: signatureName.trim(),
          signature_data: signatureData,
          signed_at: new Date().toISOString()
        }
      });
    }
    navigate('/mobile/reports/new?step=verify');
  };

  const handleBackToSchedule = () => {
    clearCurrentReport();
    navigate('/mobile/schedule');
  };

  const handleSubmit = async () => {
    if (!sigCanvasRef.current || sigCanvasRef.current.isEmpty()) {
      alert('Please provide a signature before submitting.');
      return;
    }

    if (!signatureName.trim()) {
      alert('Please enter the client name for the signature.');
      return;
    }

    setIsSubmitting(true);
    setPreventNavigation(true); // Prevent any navigation during submission

    try {
      // Get signature data
      const signatureData = sigCanvasRef.current?.toDataURL() || '';
      
      // Update report with signature data according to mobile-report.md API
      updateReportData({
        client_signature: {
          client_name: signatureName.trim(),
          signature_data: signatureData,
          signed_at: new Date().toISOString()
        }
      });

      // DEBUG: Log the complete report data being submitted
      console.log('=== REPORT SUBMISSION DEBUG ===');
      console.log('Complete report data being submitted:', JSON.stringify(currentReport, null, 2));
      console.log('Signature data length:', signatureData.length);
      console.log('Client signature details:', {
        client_name: signatureName.trim(),
        signature_data: signatureData.substring(0, 50) + '...' // Show first 50 chars
      });

      // Submit the report
      const result = await submitReport();

      console.log('Submit result:', result, 'Type of success:', typeof result.success);

      if (result.success === true) {
        console.log('Report submitted successfully:', result);
        setShowSuccess(true);
        
        // Don't auto-redirect - let user click to go to schedule manually
      } else {
        throw new Error(result.message || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert(`Failed to submit report: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setPreventNavigation(false); // Re-enable navigation on error
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show full-screen success page when report is submitted successfully
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-6 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8" />
          </div>
          
          {/* Success Message */}
          <h1 className="text-lg font-bold text-gray-900 mb-3">
            Report Submitted Successfully!
          </h1>
          
          <p className="text-sm text-gray-600 mb-6">
            Your pest control report has been submitted and saved to the system.
          </p>
          
          {/* Report Info */}
          <div className="bg-gray-50 rounded p-3 mb-6">
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Report ID:</span>
                <span className="font-bold text-blue-600">{currentReport?.report_id || 'AUTO-GENERATED'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Client:</span>
                <span className="font-medium text-gray-900">{currentReport?.client?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Service Date:</span>
                <span className="font-medium text-gray-900">
                  {currentReport?.service_date ? new Date(currentReport.service_date).toLocaleDateString() : 'Today'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Report Types:</span>
                <span className="font-medium text-gray-900">
                  {currentReport?.report_types?.join(', ') || 'N/A'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Action Button */}
          <button
            className="w-full px-4 py-3 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
            onClick={() => {
              clearCurrentReport();
              navigate('/mobile/schedule');
            }}
          >
            Back to Schedule
          </button>
        </div>
      </div>
    );
  }

  if (!reportInProgress || !currentReport) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">No report in progress</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            onClick={handleBackToSchedule}
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
          <h1 className="text-base font-medium text-gray-900">Digital Signature</h1>
          <p className="text-xs text-gray-500">Step 7 of 7 - Sign to complete the report</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-700">Progress</span>
          <span className="text-xs text-gray-500">7/7</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div className="bg-green-500 h-1 rounded-full" style={{ width: '100%' }}></div>
        </div>
      </div>

      {/* Report Summary */}
      <div className="bg-white rounded p-3 space-y-3">
        <h2 className="text-sm font-medium text-gray-900">Report Summary</h2>
        
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-gray-500">Client</p>
            <p className="font-medium text-gray-900">{currentReport.client?.name}</p>
          </div>
          <div>
            <p className="text-gray-500">Report ID</p>
            <p className="font-medium text-gray-900">{currentReport.id || 'AUTO-GENERATED'}</p>
          </div>
          <div>
            <p className="text-gray-500">Service Date</p>
            <p className="font-medium text-gray-900">
              {currentReport.service_date ? new Date(currentReport.service_date).toLocaleDateString() : 'Today'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Report Types</p>
            <div className="flex gap-1 mt-1">
              {currentReport.report_types?.map(type => (
                <span key={type} className="px-1 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Signature Details */}
      <div className="bg-white rounded p-3 space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Client Signature Details</h3>
        
        <div>
          <label className="block text-xs text-gray-500 mb-1">Client Name *</label>
          <input
            type="text"
            placeholder="Enter client representative's full name"
            value={signatureName}
            onChange={(e) => setSignatureName(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded text-sm"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Name of the client representative who will sign the report
          </p>
        </div>
      </div>

      {/* Signature Pad */}
      <div className="bg-white rounded p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PenTool className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-medium text-gray-900">Client Signature</h3>
          </div>
          <button
            onClick={handleClearSignature}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 rounded"
          >
            <RotateCcw className="w-3 h-3" />
            Clear
          </button>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded bg-white p-2">
          <div className="relative w-full">
            <SignatureCanvas
              ref={sigCanvasRef}
              canvasProps={{
                className: 'signature-canvas w-full h-32 max-w-full',
                style: { 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '4px',
                  width: '100%',
                  height: '128px'
                }
              }}
              onEnd={handleSignatureEnd}
            />
            {!hasSignature && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-gray-400 text-xs text-center">
                  Client signature here
                </p>
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-500">
          The client representative should sign above to acknowledge the service completion.
        </p>
      </div>

      {/* Legal Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded p-3">
        <h4 className="text-xs font-medium text-blue-900 mb-2">Legal Notice</h4>
        <p className="text-xs text-blue-800">
          This digital signature has the same legal validity as a handwritten signature. 
          By submitting this report, you certify that all services were performed according 
          to industry standards and regulations.
        </p>
      </div>

      {/* Navigation */}
      <div className="space-y-2 pt-4">
        <div className="flex gap-2">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded text-sm hover:bg-gray-50 flex-1 justify-center"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Review
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !hasSignature || !signatureName.trim()}
            className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex-1 justify-center disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
            <Check className="w-3 h-3" />
          </button>
        </div>
        <button
          onClick={handleBackToSchedule}
          className="w-full px-3 py-2 text-red-600 border border-red-200 rounded text-sm hover:bg-red-50"
        >
          Cancel Report
        </button>
      </div>
    </div>
  );
};
