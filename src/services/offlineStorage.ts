import type { ReportSubmission } from '../types/mobile';

export interface OfflineReport {
  id: string; // Local unique ID
  reportData: ReportSubmission; // Use full ReportSubmission instead of ReportSubmissionData
  createdAt: string;
  attempts: number;
  lastAttempt?: string;
  error?: string;
  userId: number;
}

export class OfflineStorageService {
  private static readonly STORAGE_KEY = 'kps_offline_reports';
  private static readonly MAX_RETRY_ATTEMPTS = 3;

  /**
   * Save a report to offline storage
   */
  static saveOfflineReport(reportData: ReportSubmission, userId: number): string {
    const reports = this.getOfflineReports();
    const reportId = this.generateReportId();
    
    const offlineReport: OfflineReport = {
      id: reportId,
      reportData,
      createdAt: new Date().toISOString(),
      attempts: 0,
      userId
    };
    
    reports.push(offlineReport);
    this.saveReports(reports);
    
    return reportId;
  }

  /**
   * Get all offline reports
   */
  static getOfflineReports(): OfflineReport[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading offline reports:', error);
      return [];
    }
  }

  /**
   * Get offline reports for a specific user
   */
  static getUserOfflineReports(userId: number): OfflineReport[] {
    return this.getOfflineReports().filter(report => report.userId === userId);
  }

  /**
   * Remove a report from offline storage
   */
  static removeOfflineReport(reportId: string): void {
    const reports = this.getOfflineReports().filter(report => report.id !== reportId);
    this.saveReports(reports);
  }

  /**
   * Update a report's sync attempt info
   */
  static updateSyncAttempt(reportId: string, error?: string): void {
    const reports = this.getOfflineReports();
    const reportIndex = reports.findIndex(report => report.id === reportId);
    
    if (reportIndex >= 0) {
      reports[reportIndex].attempts += 1;
      reports[reportIndex].lastAttempt = new Date().toISOString();
      if (error) {
        reports[reportIndex].error = error;
      }
      this.saveReports(reports);
    }
  }

  /**
   * Check if a report should be retried
   */
  static shouldRetry(report: OfflineReport): boolean {
    return report.attempts < this.MAX_RETRY_ATTEMPTS;
  }

  /**
   * Get count of pending reports for a user
   */
  static getPendingCount(userId: number): number {
    return this.getUserOfflineReports(userId).length;
  }

  /**
   * Clear all offline reports (for testing/cleanup)
   */
  static clearAllReports(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Generate a unique report ID
   */
  private static generateReportId(): string {
    return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save reports to localStorage
   */
  private static saveReports(reports: OfflineReport[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reports));
    } catch (error) {
      console.error('Error saving offline reports:', error);
      throw new Error('Failed to save report offline. Storage may be full.');
    }
  }

  /**
   * Get storage usage info
   */
  static getStorageInfo(): { used: number; available: number } {
    const data = localStorage.getItem(this.STORAGE_KEY) || '[]';
    const used = new Blob([data]).size;
    
    // Estimate available space (browsers typically allow 5-10MB for localStorage)
    const estimated = 5 * 1024 * 1024; // 5MB
    
    return {
      used,
      available: Math.max(0, estimated - used)
    };
  }
}
