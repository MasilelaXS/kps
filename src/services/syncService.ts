import { mobileService } from './mobileService';
import { OfflineStorageService, type OfflineReport } from './offlineStorage';
import { NetworkUtils } from '../utils/networkUtils';
import toast from 'react-hot-toast';

export interface SyncResult {
  success: boolean;
  reportId: string;
  serverReportId?: number;
  error?: string;
}

export class SyncService {
  private static issyncing = false;
  private static syncCallbacks: Array<(results: SyncResult[]) => void> = [];

  /**
   * Sync all pending offline reports
   */
  static async syncOfflineReports(userId: number, showToast = true): Promise<SyncResult[]> {
    if (this.issyncing) {
      console.log('Sync already in progress');
      return [];
    }

    // Check network connectivity
    const isConnected = await NetworkUtils.testConnectivity();
    if (!isConnected) {
      if (showToast) {
        toast.error('No internet connection available');
      }
      return [];
    }

    this.issyncing = true;
    const results: SyncResult[] = [];
    const pendingReports = OfflineStorageService.getUserOfflineReports(userId);

    if (pendingReports.length === 0) {
      this.issyncing = false;
      return results;
    }

    if (showToast) {
      toast.loading(`Syncing ${pendingReports.length} pending report(s)...`, { id: 'sync-toast' });
    }

    try {
      for (const report of pendingReports) {
        if (!OfflineStorageService.shouldRetry(report)) {
          console.log(`Skipping report ${report.id} - max attempts reached`);
          continue;
        }

        const result = await this.syncSingleReport(report);
        results.push(result);

        if (result.success) {
          // Remove successfully synced report
          OfflineStorageService.removeOfflineReport(report.id);
        } else {
          // Update attempt count
          OfflineStorageService.updateSyncAttempt(report.id, result.error);
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (showToast) {
        toast.dismiss('sync-toast');
        
        if (successCount > 0 && failCount === 0) {
          toast.success(`Successfully synced ${successCount} report(s)`);
        } else if (successCount > 0 && failCount > 0) {
          toast.success(`Synced ${successCount} report(s), ${failCount} failed`);
        } else if (failCount > 0) {
          toast.error(`Failed to sync ${failCount} report(s)`);
        }
      }

      // Notify listeners
      this.notifySyncComplete(results);

    } catch (error) {
      console.error('Sync error:', error);
      if (showToast) {
        toast.dismiss('sync-toast');
        toast.error('Sync failed due to an unexpected error');
      }
    } finally {
      this.issyncing = false;
    }

    return results;
  }

  /**
   * Sync a single report
   */
  private static async syncSingleReport(offlineReport: OfflineReport): Promise<SyncResult> {
    try {
      console.log(`Syncing report ${offlineReport.id}`);
      
      const response = await mobileService.createReport(offlineReport.reportData);
      
      if (response.success && response.report_id) {
        return {
          success: true,
          reportId: offlineReport.id,
          serverReportId: response.report_id
        };
      } else {
        throw new Error(response.message || 'No report ID returned from server');
      }
    } catch (error) {
      console.error(`Failed to sync report ${offlineReport.id}:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        success: false,
        reportId: offlineReport.id,
        error: errorMessage
      };
    }
  }

  /**
   * Check for duplicate reports based on client_id, date, and report_type
   */
  static async checkForDuplicates(
    clientId: number, 
    dateOfService: string, 
    reportType: string,
    excludeOfflineId?: string
  ): Promise<{ hasDuplicates: boolean; duplicateCount: number }> {
    try {
      // Check offline reports
      const offlineReports = OfflineStorageService.getOfflineReports().filter(report => 
        report.id !== excludeOfflineId &&
        report.reportData.client_id === clientId &&
        report.reportData.date_of_service === dateOfService &&
        report.reportData.report_type === reportType
      );

      // TODO: Check server for existing reports (would need an API endpoint)
      // For now, we'll just check offline duplicates
      const hasDuplicates = offlineReports.length > 0;
      
      return {
        hasDuplicates,
        duplicateCount: offlineReports.length
      };
    } catch (error) {
      console.error('Error checking duplicates:', error);
      return { hasDuplicates: false, duplicateCount: 0 };
    }
  }

  /**
   * Register a callback for sync completion
   */
  static onSyncComplete(callback: (results: SyncResult[]) => void): () => void {
    this.syncCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.syncCallbacks.indexOf(callback);
      if (index > -1) {
        this.syncCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of sync completion
   */
  private static notifySyncComplete(results: SyncResult[]): void {
    this.syncCallbacks.forEach(callback => {
      try {
        callback(results);
      } catch (error) {
        console.error('Error in sync callback:', error);
      }
    });
  }

  /**
   * Auto-sync when network becomes available
   */
  static setupAutoSync(userId: number): () => void {
    return NetworkUtils.addNetworkListener(
      async () => {
        // Wait a bit for the connection to stabilize
        setTimeout(() => {
          this.syncOfflineReports(userId, false);
        }, 2000);
      },
      () => {
        // Network went offline - nothing to do
      }
    );
  }

  /**
   * Get sync status
   */
  static isSyncing(): boolean {
    return this.issyncing;
  }
}
