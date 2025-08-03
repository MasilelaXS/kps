import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { BasicInfoStep } from './create/BasicInfoStep';
import { InspectionStations } from './create/InspectionStations';
import { InspectionRemarks } from './create/InspectionRemarks';
import { FumigationForm } from './create/FumigationForm';
import { OverallRemarks } from './create/OverallRemarks';
import { VerificationScreen } from './create/VerificationScreen';
import { SignatureScreen } from './create/SignatureScreen';

export const ReportCreation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const step = searchParams.get('step') || 'basic-info';

  const renderStep = () => {
    switch (step) {
      case 'basic-info':
        return <BasicInfoStep />;
      case 'stations':
        return <InspectionStations />;
      case 'inspection-remarks':
        return <InspectionRemarks />;
      case 'fumigation':
        return <FumigationForm />;
      case 'overall':
        return <OverallRemarks />;
      case 'verify':
        return <VerificationScreen />;
      case 'signature':
        return <SignatureScreen />;
      default:
        return <BasicInfoStep />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {renderStep()}
    </div>
  );
};
