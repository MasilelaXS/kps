// Network detection utility
export class NetworkUtils {
  /**
   * Check if the device is currently online
   */
  static isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Test actual connectivity by making a request to the server
   */
  static async testConnectivity(timeout: number = 5000): Promise<boolean> {
    // First check basic online status
    if (!navigator.onLine) {
      return false;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      // Use GET request to /api/health which we know exists and returns JSON
      const response = await fetch('/api/health', {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-cache',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      // Check if we got a successful response
      if (response.ok) {
        try {
          const data = await response.json();
          // Check if it's the health endpoint response format
          return data.success === true && data.data?.status === 'healthy';
        } catch {
          // If we can't parse JSON, but got 200, still consider it connected
          return true;
        }
      }
      
      // Consider 4xx errors as "connected but unauthorized/not found"
      // Only 5xx errors or network errors are "not connected"
      return response.status < 500;
      
    } catch (error) {
      console.log('Connectivity test failed:', error);
      // If connectivity test fails, return false
      return false;
    }
  }

  /**
   * Listen for online/offline events
   */
  static addNetworkListener(
    onOnline: () => void,
    onOffline: () => void
  ): () => void {
    const handleOnline = () => onOnline();
    const handleOffline = () => onOffline();
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }
}

// Network status hook
import { useState, useEffect } from 'react';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(NetworkUtils.isOnline());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initial connectivity test
    NetworkUtils.testConnectivity().then(setIsConnected);

    // Listen for network events
    const cleanup = NetworkUtils.addNetworkListener(
      async () => {
        setIsOnline(true);
        const connected = await NetworkUtils.testConnectivity();
        setIsConnected(connected);
      },
      () => {
        setIsOnline(false);
        setIsConnected(false);
      }
    );

    return cleanup;
  }, []);

  return { isOnline, isConnected };
};
