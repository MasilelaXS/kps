import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

// Report data interfaces
export interface InspectionStation {
  id: string;
  station_number: number;
  location: 'inside' | 'outside';
  is_accessible: boolean;
  access_reason?: string;
  has_activity: boolean;
  activity_type?: 'droppings' | 'gnawing' | 'tracks' | 'other';
  activity_type_other?: string;
  activity_description?: string;
  station_condition?: string[];
  bait_status: 'eaten' | 'clean' | 'wet';
  rodent_box_replaced: boolean;
  poison_used_id?: number;
  poison_quantity?: number;
  batch_number?: string;
  batch_number_note?: string;
  station_remarks?: string;
}

export interface FumigationTreatment {
  treated_areas: string[];
  treated_for: string[];
  general_remarks?: string;
  chemicals: Array<{
    chemical_id: number;
    quantity: number;
    batch_number: string;
    application_notes?: string;
  }>;
}

export interface ReportData {
  // Basic info
  clientId: number;
  reportType: 'inspection' | 'fumigation' | 'both';
  dateOfService: string;
  
  // Inspection data
  inspectionStations: InspectionStation[];
  overall_remarks?: string;
  warning_signs_replaced?: number;
  warning_signs_quantity?: number;
  recommendations?: string;
  next_service_date?: string;
  
  // Fumigation data
  fumigationTreatment?: FumigationTreatment;
  
  // Signature
  client_signature?: string;
  client_name?: string;
}

interface ReportContextType {
  reportData: ReportData;
  updateReportData: (data: Partial<ReportData>) => void;
  updateInspectionStations: (stations: InspectionStation[]) => void;
  addInspectionStation: (station: InspectionStation) => void;
  updateInspectionStation: (stationId: string, updates: Partial<InspectionStation>) => void;
  removeInspectionStation: (stationId: string) => void;
  resetReport: () => void;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const useReportContext = () => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReportContext must be used within a ReportProvider');
  }
  return context;
};

interface ReportProviderProps {
  children: ReactNode;
  initialData?: Partial<ReportData>;
}

export const ReportProvider: React.FC<ReportProviderProps> = ({ children, initialData }) => {
  const [reportData, setReportData] = useState<ReportData>({
    clientId: 0,
    reportType: 'inspection',
    dateOfService: new Date().toISOString().split('T')[0],
    inspectionStations: [],
    ...initialData,
  });

  const updateReportData = (data: Partial<ReportData>) => {
    setReportData(prev => ({ ...prev, ...data }));
  };

  const updateInspectionStations = (stations: InspectionStation[]) => {
    setReportData(prev => ({ ...prev, inspectionStations: stations }));
  };

  const addInspectionStation = (station: InspectionStation) => {
    setReportData(prev => ({
      ...prev,
      inspectionStations: [...prev.inspectionStations, station]
    }));
  };

  const updateInspectionStation = (stationId: string, updates: Partial<InspectionStation>) => {
    setReportData(prev => ({
      ...prev,
      inspectionStations: prev.inspectionStations.map(station =>
        station.id === stationId ? { ...station, ...updates } : station
      )
    }));
  };

  const removeInspectionStation = (stationId: string) => {
    setReportData(prev => ({
      ...prev,
      inspectionStations: prev.inspectionStations.filter(station => station.id !== stationId)
    }));
  };

  const resetReport = () => {
    setReportData({
      clientId: 0,
      reportType: 'inspection',
      dateOfService: new Date().toISOString().split('T')[0],
      inspectionStations: [],
    });
  };

  return (
    <ReportContext.Provider value={{
      reportData,
      updateReportData,
      updateInspectionStations,
      addInspectionStation,
      updateInspectionStation,
      removeInspectionStation,
      resetReport,
    }}>
      {children}
    </ReportContext.Provider>
  );
};
