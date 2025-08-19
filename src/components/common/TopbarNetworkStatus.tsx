import React from 'react';
import { Wifi, WifiOff, Signal, Clock } from 'lucide-react';
import { useNetworkStatus } from '../../utils/networkUtils';
import { OfflineStorageService } from '../../services/offlineStorage';
import { useAuthStore } from '../../stores/authStore';

export const TopbarNetworkStatus: React.FC = () => {
  const { isOnline, isConnected } = useNetworkStatus();
  const { user } = useAuthStore();
  const pendingCount = user ? OfflineStorageService.getPendingCount(user.id) : 0;

  const getNetworkIcon = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        color: 'text-red-500',
        title: 'Offline - No internet connection'
      };
    }
    
    if (isOnline && !isConnected) {
      return {
        icon: Signal,
        color: 'text-yellow-500',
        title: 'Limited connectivity - Some features may not work'
      };
    }
    
    return {
      icon: Wifi,
      color: 'text-green-500',
      title: 'Online - Connected to internet'
    };
  };

  const networkStatus = getNetworkIcon();
  const NetworkIcon = networkStatus.icon;

  return (
    <div className="flex items-center gap-3">
      {/* Network Status Icon */}
      <div className="relative group" title={networkStatus.title}>
        <NetworkIcon className={`w-5 h-5 ${networkStatus.color} transition-colors duration-200`} />
      </div>

      {/* Pending Reports Icon with Badge */}
      {pendingCount > 0 && (
        <div 
          className="relative group" 
          title={`${pendingCount} pending report${pendingCount > 1 ? 's' : ''} waiting to sync`}
        >
          <Clock className="w-5 h-5 text-blue-500 transition-colors duration-200" />
          <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full min-w-4 h-4 flex items-center justify-center px-1 animate-pulse">
            {pendingCount > 9 ? '9+' : pendingCount}
          </div>
        </div>
      )}
    </div>
  );
};
