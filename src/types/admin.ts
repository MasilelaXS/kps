// Admin-related TypeScript interfaces and types
export interface DashboardSummary {
  users: {
    total_users: number;
    admin_count: string;
    pco_count: string;
    active_users: string;
    active_last_week: string;
  };
  clients: {
    total_clients: number;
    active_clients: string;
    new_clients_30days: number;
  };
  reports: {
    total_reports: number;
    pending_reports: string;
    approved_reports: string;
    declined_reports: string;
    reports_this_week: string;
    reports_this_month: string;
  };
  assignments: {
    total_assignments: number;
    assigned_clients: number;
    pcos_with_assignments: number;
  };
  chemicals: {
    total_chemicals: number;
    inspection_chemicals: string;
    fumigation_chemicals: string;
  };
}

export interface RecentActivity {
  id: number;
  report_type: string;
  status: string;
  created_at: string;
  client_name: string;
  pco_name: string;
  pco_number: string;
}

export interface TopPCO {
  id: number;
  name: string;
  pco_number: string;
  total_reports: number;
  approved_reports: string;
  approval_rate: string;
}

export interface MonthlyTrend {
  month: string;
  report_count: number;
  approved_count: string;
}

export interface AssignedClient {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  assigned_pco: string;
  pco_number: string;
  last_report_date: string | null;
  total_reports: number;
}

export interface UpcomingServiceClient {
  id: number;
  name: string;
  email: string;
  next_service_date: string;
  days_until_service: number;
  assigned_pco: string;
  pco_number: string;
}

export interface AdminDashboardData {
  summary: DashboardSummary;
  recent_activity: RecentActivity[];
  top_pcos: TopPCO[];
  monthly_trends: MonthlyTrend[];
  assigned_clients: AssignedClient[];
  upcoming_service_clients: UpcomingServiceClient[];
  generated_at: string;
}

export interface Client {
  id: number;
  name: string;
  address: string;
  email: string;
  phone: string;
  contact?: Array<{
    name: string;
    number: string;
  }>;
  contact_person?: string; // Keep for backward compatibility
  status: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  assigned_pco_name?: string | null;
  assigned_pco_number?: string | null;
  assigned_at?: string | null;
  total_reports: number;
  last_service_date: string | null;
  pending_reports: number;
  // For backward compatibility with UI components
  assigned_pco?: {
    id: number;
    name: string;
    pco_number: string;
  } | null;
}

export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_records: number;
  per_page: number;
}

export interface AdminClientsResponse {
  clients: Client[];
  pagination: PaginationInfo;
}

export interface Report {
  id: number;
  // Client info as flat fields from API
  client_name?: string;
  client_address?: string;
  client_phone?: string;
  client_email?: string;
  // PCO info as flat fields from API
  pco_name?: string;
  pco_number?: string;
  pco_email?: string;
  pco_phone?: string;
  // Legacy nested structure for backward compatibility
  client?: {
    id: number;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  pco?: {
    id: number;
    name: string;
    pco_number: string;
    email?: string;
    phone?: string;
  };
  report_type: string;
  status: string;
  date_of_service?: string;
  next_service_date?: string;
  overall_remarks?: string;
  recommendations?: string;
  completion_status?: string;
  warning_signs_replaced?: number;
  warning_signs_quantity?: number;
  created_at: string;
  updated_at?: string;
  reviewed_at?: string | null;
  reviewed_by_name?: string | null;
  admin_notes?: string | null;
  has_missing_batch_numbers: boolean;
  station_count: number;
  fumigation_count?: number;
  chemicals_used: number;
}

export interface DetailedReport {
  id: number;
  client_id: number;
  pco_id: number;
  report_type: string;
  status: string;
  date_of_service?: string;
  overall_remarks: string;
  warning_signs_replaced: boolean;
  warning_signs_quantity: number;
  recommendations: string;
  next_service_date: string;
  fumigation_remarks?: string;
  created_at: string;
  updated_at: string;
  reviewed_by_name?: string;
  reviewed_at?: string;
  admin_notes?: string;
  client: {
    id: number;
    name: string;
    address: string;
  };
  pco: {
    id: number;
    name: string;
    pco_number: string;
  };
  // API returns 'stations' for regular endpoints, 'inspection_stations' for admin endpoints
  stations?: Array<{
    id: number;
    station_number: string;
    location: string;
    is_accessible: boolean;
    has_activity: boolean;
    activity_type: string | null;
    station_condition: string[];
    bait_status: string;
    rodent_box_replaced: boolean;
    poison_used_id: number;
    poison_quantity: number;
    batch_number: string;
    station_remarks: string;
  }>;
  // Admin API returns inspection_stations
  inspection_stations?: Array<{
    id: number;
    station_number: number;
    location: 'inside' | 'outside';
    is_accessible: boolean;
    has_activity: boolean;
    activity_type: 'droppings' | 'gnawing' | 'tracks' | 'other' | null;
    activity_description?: string;
    bait_status: 'eaten' | 'partially_eaten' | 'untouched' | 'moldy';
    poison_used_id: number;
    poison_quantity: number;
    batch_number: string;
    station_remarks: string;
    chemical_name?: string;
    l_number?: string;
  }>;
  fumigation_treatments: Array<{
    id?: number;
    treated_areas: string[];
    treated_for: string[];
    insect_monitor_replaced: boolean;
    general_remarks: string;
    chemicals: Array<{
      id?: number;
      chemical_id: number;
      quantity: number;
      batch_number: string;
      batch_number_note?: string | null;
      chemical_name?: string;
      l_number?: string;
    }>;
  }>;
}

export interface ReportsSummary {
  total: number;
  pending: number;
  approved: number;
  declined: number;
  archived: number;
}

export interface AdminReportsResponse {
  reports: Report[];
  summary: ReportsSummary;
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface ClientNote {
  id: number;
  client_id: number;
  user_id: number;
  note_text: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  client_name?: string;
  created_by_name: string;
  created_by_role: string;
}

export interface Assignment {
  id: number;
  client_id: number;
  pco_id: number;
  assigned_by: number;
  assigned_at: string;
  client_name: string;
  client_address: string;
  pco_name: string;
  pco_number: string;
  assigned_by_name: string;
}

export interface User {
  id: number;
  pco_number: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

export interface Chemical {
  id: number;
  l_number: string;
  name: string;
  type?: string;
  category: 'inspection' | 'fumigation' | 'both';
  quantity_unit: string;
  is_active: number;
  created_at: string;
  // For inactive chemicals endpoint
  inspection_usage_count?: number;
  fumigation_usage_count?: number;
  total_usage_count?: number;
  last_used_date?: string;
  last_used_formatted?: string;
  // For active chemicals with detailed stats
  usage_stats?: {
    inspection_usage_count: number;
    fumigation_usage_count: number;
    total_inspection_quantity: number | null;
    total_fumigation_quantity: number | null;
  };
}

export interface ChemicalStats {
  summary: {
    total_chemicals: number;
    active_chemicals: number;
    inspection_chemicals: number;
    fumigation_chemicals: number;
    both_chemicals: number;
  };
  top_used_chemicals: Array<{
    id: number;
    name: string;
    l_number: string;
    total_usage: number;
    inspection_usage: number;
    fumigation_usage: number;
    last_used: string;
  }>;
}
