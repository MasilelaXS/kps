// Types for the mobile PCO application - Following mobile-f    activity_type: 'droppings' | 'gnawing' | 'tracks' | 'other' | null;ontend-revisit.md exactly

// Mobile User Interface
export interface MobileUser {
  id: number;
  name: string;
  pco_number: string;
  email: string;
  role: 'pco';
}

// Dashboard Data Types - Based on actual API response
export interface DashboardStats {
  draft_reports: number;
  in_progress_reports: number;
  completed_reports: number;
  pending_reports: number;
  assigned_clients: number;
  reports_today: number;
}

export interface RecentReport {
  id: number;
  report_type: 'inspection' | 'fumigation' | 'both';
  status: 'draft' | 'completed' | 'pending' | 'in_progress';
  date_of_service: string;
  created_at: string;
  client_name: string;
  client_address: string;
}

export interface UpcomingService {
  id: number;
  client_name: string;
  client_address: string;
  next_service_date: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recent_reports: RecentReport[];
  upcoming_services: UpcomingService[];
}

// Client Data Types - Only assigned clients for mobile
export interface AssignedClient {
  id: number;
  name: string;
  address: string;
  last_service_date?: string;
  next_service_date?: string;
  status: 'active' | 'inactive';
  contact_person?: string; // Add missing property
  phone?: string; // Add missing property
}

// Client Details extends AssignedClient
export interface ClientDetails extends AssignedClient {
  contact_person?: string;
  phone?: string;
  additional_notes?: string;
  service_frequency?: string;
}

// Report Data Types - Following mobile-report.md API specification exactly
export interface InspectionStation {
  station_number: number;
  location: 'inside' | 'outside';
  is_accessible: boolean;
  access_reason?: string;
  has_activity: boolean;
  activity_type?: 'droppings' | 'gnawing' | 'tracks' | 'other';
  activity_type_other?: string;
  activity_description?: string;
  station_condition?: string[]; // Array like ["good", "needs_repair", "damaged", "missing"]
  bait_status: 'eaten' | 'partially_eaten' | 'untouched' | 'moldy';
  rodent_box_replaced?: boolean;
  poison_used_id?: number; // Must be from GET /pco/chemicals with category "inspection" or "both"
  poison_quantity?: number;
  batch_number?: string;
  batch_number_note?: string;
  station_remarks?: string;
}

export interface FumigationChemical {
  chemical_id: number;
  quantity: number;
  batch_number: string;
  batch_number_note?: string;
  // Additional properties used by components
  id?: number;
  name?: string;
  unit?: string;
  chemical_name?: string;
  quantity_used?: number;
  application_method?: string;
  target_areas?: string;
}

// Form state interface with required name
export interface FumigationChemicalForm {
  chemical_id: number;
  name: string;
  quantity: number;
  unit: string;
  batch_number: string;
}

// Report Data Structure - Extended to match component usage
export interface ReportData {
  // Basic Info
  id?: string; // Add for draft ID
  report_id?: string; // Generated 6-digit report ID for display
  client_id: number;
  pco_id: number;
  report_type: 'inspection' | 'fumigation' | 'both';
  report_types?: string[]; // Add for compatibility with existing code
  date_of_service: string;
  service_date?: string; // Alternative field name used in some components
  
  // Client info for display
  client?: {
    id: number;
    name: string;
    address: string;
  };
  assigned_pco?: string;
  
  // Inspection Data
  inspection_stations: InspectionStation[];
  inspection_remarks: {
    warning_signs_replaced: boolean;
    warning_signs_qty: number;
    inspection_notes: string;
  };
  inspection_summary?: string; // Used in components
  recommendations?: string; // Used in components
  next_visit_notes?: string; // Used in components
  
  // Fumigation Data
  fumigation: {
    treated_areas: string[];
    target_pests: string[]; // Legacy field name
    treated_for?: string[]; // API field name
    chemicals_used: FumigationChemical[];
    application_method: string;
    fumigation_notes: string;
    insect_monitor_replaced?: number; // API field (0 or 1)
    general_remarks?: string; // API field
  };
  fumigation_notes?: string; // Direct field used in components
  fumigation_chemicals?: FumigationChemical[]; // Alternative field name
  weather_conditions?: string; // Used in components
  safety_measures?: string; // Used in components
  
  // Overall Assessment
  overall_remarks: string;
  next_service_date: string;
  pest_rating?: number; // Used in components (1-5 scale)
  risk_level?: 'low' | 'medium' | 'high'; // Used in components
  follow_up_required?: boolean; // Used in components
  follow_up_notes?: string; // Used in components
  
  // Signature
  client_signature: {
    client_name: string;
    client_title?: string;
    signature_data: string; // Base64 image
    signed_at: string;
  };
  signature_name?: string; // Used in signature screen
  signature_title?: string; // Used in signature screen
  signature_data?: string; // Direct field used in components
}

// API Submission Format - Exact match to backend specification
export interface ReportSubmission {
  report_id: number; // Auto-generated 6-digit number
  client_id: number;
  report_type: 'inspection' | 'fumigation' | 'both';
  date_of_service: string;
  overall_remarks: string;
  warning_signs_replaced: number; // 0 or 1 (boolean as int)
  warning_signs_quantity: number;
  recommendations: string;
  next_service_date: string;
  client_name: string;
  client_signature: string; // Base64 image data
  
  // Inspection stations array (matches backend structure)
  stations: {
    station_number: number; // INTEGER as per API spec
    location: 'inside' | 'outside';
    is_accessible: number; // 0 or 1
    access_reason?: string;
    has_activity: number; // 0 or 1
    activity_type: 'droppings' | 'gnawing' | 'tracks' | 'other' | null;
    activity_type_other?: string;
    activity_description: string;
    station_condition: string[]; // Array: ["good", "needs_repair", "damaged", "missing"]
    bait_status: 'eaten' | 'partially_eaten' | 'untouched' | 'moldy';
    rodent_box_replaced: number; // 0 or 1
    poison_used_id: number;
    poison_quantity: number; // float
    batch_number: string;
    batch_number_note?: string;
    station_remarks: string;
  }[];
  
  // Fumigation data (matches backend structure)
  fumigation: {
    treated_areas: string[]; // JSON array
    treated_for: string[]; // JSON array
    insect_monitor_replaced: number; // 0 or 1
    general_remarks: string;
    chemicals: {
      chemical_id: number;
      quantity: number; // float
      batch_number: string;
      batch_number_note?: string;
    }[];
  };
}

// Chemical list for dropdowns - matches GET /pco/chemicals response
export interface Chemical {
  id: number;
  name: string;
  type?: string;
  category: 'inspection' | 'fumigation' | 'both';
  l_number?: string;
  quantity_unit: string; // Unit for the chemical (e.g., "50 ml", "ml", "L")
  active_ingredient?: string;
  concentration?: string;
  is_active: number; // 0 or 1
  created_at?: string;
  updated_at?: string;
}

// Draft storage for offline support
export interface ReportDraft {
  id: string; // Used by the service
  report_id?: string; // Alternative field name
  client_id: number;
  data: Partial<ReportData>;
  current_step: string; // Used by the store
  step?: string; // Alternative field name
  last_updated: string;
  created_at?: string; // Used by the service
  updated_at?: string; // Used by the service
}

// Mobile Store State
export interface MobileState {
  user: MobileUser | null;
  dashboardData: DashboardData | null;
  assignedClients: AssignedClient[];
  currentReport: ReportData | null;
  reportInProgress: boolean;
  currentStep: string;
  chemicals: Chemical[];
  loading: boolean;
  error: string | null;
}

// Change password request
export interface ChangePasswordRequest {
  user_id: number;
  current_password: string;
  new_password: string;
}

// Legacy types for compatibility
export interface Station {
  station_number: number;
  location: 'inside' | 'outside';
  is_accessible: 0 | 1;
  access_reason: string;
  has_activity: 0 | 1;
  activity_type: 'droppings' | 'gnawing' | 'tracks' | 'other' | '';
  activity_description: string;
  bait_status: 'eaten' | 'partially_eaten' | 'untouched' | 'moldy';
  poison_used_id: number;
  poison_quantity: number;
  batch_number: string;
  station_remarks: string;
}

export interface Fumigation {
  chemical_used_id: number;
  quantity_used: number;
  concentration: number;
  exposure_time: number;
  temperature: number;
  humidity: number;
  area_treated: number;
  fumigation_remarks: string;
  safety_measures: string;
}

export interface ReportFilters {
  status?: string;
  client_id?: number;
  date_from?: string;
  date_to?: string;
}

export interface Signatures {
  client_signature: string;
  pco_signature?: string;
}
