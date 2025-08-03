import React, { useEffect, useState } from 'react';
import { Input } from '@heroui/react';
import { Search, MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMobileStore } from '../../../stores/mobileStore';
import type { AssignedClient } from '../../../types/mobile';

export const ClientList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { 
    assignedClients, 
    isClientsLoading, 
    loadClients, 
    error 
  } = useMobileStore();

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const filteredClients = assignedClients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClientSelect = (client: AssignedClient) => {
    navigate(`/mobile/schedule/${client.id}`);
  };

  if (isClientsLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
          <span className="text-sm text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center max-w-xs">
          <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-gray-900 font-medium mb-1">Connection failed</p>
          <p className="text-xs text-gray-500 mb-3">{error}</p>
          <button
            onClick={() => loadClients()}
            className="text-xs text-blue-600 font-medium hover:text-blue-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 pb-3">
        <h1 className="text-base font-semibold text-gray-900 mb-3">Clients</h1>
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          startContent={<Search className="w-4 h-4 text-gray-400" />}
          variant="flat"
          size="sm"
          classNames={{
            input: "text-sm",
            inputWrapper: "bg-gray-100 border-0 h-10"
          }}
        />
      </div>

      {/* Client List */}
      <div className="flex-1 overflow-y-auto px-4">
        {filteredClients.length > 0 ? (
          <div className="space-y-2 pb-4">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                onClick={() => handleClientSelect(client)}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 active:bg-gray-50 transition-colors cursor-pointer"
              >
                {/* Initial Circle */}
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-medium">
                    {client.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate pr-2">
                      {client.name}
                    </h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      client.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {client.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{client.address}</span>
                  </div>
                  
                  {client.last_service_date && (
                    <div className="text-xs text-gray-400 mt-1">
                      Last: {new Date(client.last_service_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-xs">
              {searchTerm ? (
                <>
                  <Search className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">No matches</p>
                  <p className="text-xs text-gray-400">Try a different search</p>
                </>
              ) : (
                <>
                  <div className="w-6 h-6 rounded bg-gray-200 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600 mb-1">No clients</p>
                  <p className="text-xs text-gray-400">Contact admin for assignments</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
