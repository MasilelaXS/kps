import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2,
  Search,
  MoreHorizontal,
  Edit3,
  Trash2,
  Eye,
  AlertCircle,
  Users as UsersIcon,
  CheckCircle,
  UserCheck,
  ChevronDown,
  Plus,
  StickyNote,
  UserPlus,
  MapPin,
  Mail,
  X,
  Phone
} from 'lucide-react';
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Button,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip
} from '@heroui/react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import type { Client, User, ClientNote } from '../../services/adminService';

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<{
    total_clients: number;
    active_clients: number;
    assigned_clients: number;
    total_reports: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [hasInitialData, setHasInitialData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);

  // HeroUI disclosure hooks
  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  const { isOpen: isViewModalOpen, onOpen: onViewModalOpen, onClose: onViewModalClose } = useDisclosure();
  const { isOpen: isAssignModalOpen, onOpen: onAssignModalOpen, onClose: onAssignModalClose } = useDisclosure();
  const { isOpen: isNotesModalOpen, onOpen: onNotesModalOpen, onClose: onNotesModalClose } = useDisclosure();

  // Form state for creating client
  const [createForm, setCreateForm] = useState({
    name: '',
    address: '',
    email: '',
    phone: '',
    contact: [{ name: '', number: '' }],
    status: 'active' as 'active' | 'inactive'
  });

  // Form state for editing client
  const [editForm, setEditForm] = useState({
    name: '',
    address: '',
    email: '',
    phone: '',
    contact: [{ name: '', number: '' }],
    status: 'active' as 'active' | 'inactive'
  });

  // Selected client for modals
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Loading states
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  // Notes state
  const [clientNotes, setClientNotes] = useState('');
  const [isPrivateNote, setIsPrivateNote] = useState(false);
  const [existingNotes, setExistingNotes] = useState<ClientNote[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);

  // PCOs for assignment
  const [pcos, setPcos] = useState<Array<{id: string, name: string}>>([]);
  const [selectedPcoId, setSelectedPcoId] = useState('');

  const loadClients = useCallback(async (isInitialLoad = false) => {
    try {
      // Use skeleton loading for initial load, dialog for subsequent loads
      if (isInitialLoad || !hasInitialData) {
        setIsLoading(true);
      } else {
        setIsSearching(true);
      }
      setError(null);
      const response = await adminService.getClients({
        page: 1,
        limit: 100,
        search: searchTerm || undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined
      });
      
      if (response.success && response.data) {
        let clientsData: Client[] = [];
        
        if (Array.isArray(response.data)) {
          clientsData = response.data;
        } else {
          clientsData = response.data.clients || [];
        }
        
        setClients(clientsData);
        if (!hasInitialData) {
          setHasInitialData(true);
        }
      } else {
        setError('Failed to load clients');
      }
    } catch (error) {
      console.error('Clients load error:', error);
      setError('Failed to load clients');
    } finally {
      if (isInitialLoad || !hasInitialData) {
        setIsLoading(false);
      } else {
        setIsSearching(false);
      }
    }
  }, [hasInitialData, searchTerm, filterStatus]);

  const loadStats = useCallback(async () => {
    try {
      const totalClients = clients.length;
      const activeClients = clients.filter(c => c.status === 'active').length;
      const assignedClients = clients.filter(c => c.assigned_pco).length;
      const totalReports = clients.reduce((sum, c) => sum + (c.total_reports || 0), 0);
      
      setStats({
        total_clients: totalClients,
        active_clients: activeClients,
        assigned_clients: assignedClients,
        total_reports: totalReports
      });
    } catch (error) {
      console.error('Stats load error:', error);
    }
  }, [clients]);

  const loadPCOs = useCallback(async () => {
    try {
      const response = await adminService.getUsers();
      if (response.success && response.data) {
        const pcoUsers = response.data.filter((user: User) => user.role === 'pco');
        setPcos(pcoUsers.map((user: User) => ({ id: user.id.toString(), name: user.name })));
      }
    } catch (error) {
      console.error('PCOs load error:', error);
    }
  }, []);

  useEffect(() => {
    loadClients(true); // Initial load
    loadPCOs();
  }, [loadClients, loadPCOs]);

  useEffect(() => {
    if (clients.length > 0) {
      loadStats();
    }
  }, [clients, loadStats]);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsCreating(true);
      const response = await adminService.createClient(createForm);
      
      if (response.success) {
        await loadClients(false);
        onCreateModalClose();
        setCreateForm({
          name: '',
          address: '',
          email: '',
          phone: '',
          contact: [{ name: '', number: '' }],
          status: 'active'
        });
        toast.success('Client created successfully!');
      } else {
        toast.error('Failed to create client. Please check the details and try again.');
      }
    } catch (error) {
      console.error('Create client error:', error);
      toast.error('An error occurred while creating the client.');
    } finally {
      setIsCreating(false);
    }
  };

  // Contact management functions
  const addContactToCreateForm = () => {
    setCreateForm({
      ...createForm,
      contact: [...createForm.contact, { name: '', number: '' }]
    });
  };

  const removeContactFromCreateForm = (index: number) => {
    if (createForm.contact.length > 1) {
      const newContacts = createForm.contact.filter((_, i) => i !== index);
      setCreateForm({
        ...createForm,
        contact: newContacts
      });
    }
  };

  const updateContactInCreateForm = (index: number, field: 'name' | 'number', value: string) => {
    const newContacts = [...createForm.contact];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setCreateForm({
      ...createForm,
      contact: newContacts
    });
  };

  const addContactToEditForm = () => {
    setEditForm({
      ...editForm,
      contact: [...editForm.contact, { name: '', number: '' }]
    });
  };

  const removeContactFromEditForm = (index: number) => {
    if (editForm.contact.length > 1) {
      const newContacts = editForm.contact.filter((_, i) => i !== index);
      setEditForm({
        ...editForm,
        contact: newContacts
      });
    }
  };

  const updateContactInEditForm = (index: number, field: 'name' | 'number', value: string) => {
    const newContacts = [...editForm.contact];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setEditForm({
      ...editForm,
      contact: newContacts
    });
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setEditForm({
      name: client.name,
      address: client.address,
      email: client.email,
      phone: client.phone || '',
      contact: client.contact || [{ name: '', number: '' }],
      status: client.status as 'active' | 'inactive'
    });
    onEditModalOpen();
  };

  const handleDeleteClick = (client: Client) => {
    setSelectedClient(client);
    onDeleteModalOpen();
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    onViewModalOpen();
  };

  const handleNotesClick = async (client: Client) => {
    setSelectedClient(client);
    setClientNotes(''); 
    setIsPrivateNote(false);
    setExistingNotes([]);
    
    // Load existing notes
    setIsLoadingNotes(true);
    try {
      const response = await adminService.getClientNotes(client.id, 'admin');
      if (response.success && response.data) {
        setExistingNotes(response.data);
      }
    } catch (error) {
      console.error('Load notes error:', error);
    } finally {
      setIsLoadingNotes(false);
    }
    
    onNotesModalOpen();
  };

  const handleAssignClick = (client: Client) => {
    setSelectedClient(client);
    setSelectedPcoId('');
    onAssignModalOpen();
  };

  const handleUnassignClick = async (client: Client) => {
    if (!client.assigned_pco) {
      toast.error('Client is not assigned to any PCO');
      return;
    }

    console.log('Unassigning client:', client);
    console.log('Assigned PCO data:', client.assigned_pco);

    try {
      setIsAssigning(true);
      
      // First, get all assignments to find the assignment ID
      const assignmentsResponse = await adminService.getAllAssignments();
      
      if (!assignmentsResponse.success || !assignmentsResponse.data) {
        toast.error('Failed to retrieve assignments');
        return;
      }

      // Find the assignment for this client
      const assignment = assignmentsResponse.data.find(a => a.client_id === client.id);
      
      if (!assignment) {
        toast.error('Assignment not found for this client');
        console.error('No assignment found for client ID:', client.id);
        return;
      }

      console.log('Found assignment to delete:', assignment);
      
      // Delete the specific assignment
      const deleteResponse = await adminService.deleteAssignment(assignment.id);
      
      if (deleteResponse.success) {
        await loadClients(false);
        toast.success('PCO unassigned successfully!');
      } else {
        toast.error('Failed to unassign PCO. Please try again.');
      }
    } catch (error) {
      console.error('Unassign PCO error:', error);
      toast.error('An error occurred while unassigning the PCO.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    
    try {
      setIsEditing(true);
      const response = await adminService.updateClient(selectedClient.id, editForm);
      
      if (response.success) {
        await loadClients(false);
        onEditModalClose();
        toast.success('Client updated successfully!');
      } else {
        toast.error('Failed to update client. Please try again.');
      }
    } catch (error) {
      console.error('Update client error:', error);
      toast.error('An error occurred while updating the client.');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedClient) return;
    
    try {
      setIsDeleting(true);
      const response = await adminService.deleteClient(selectedClient.id);
      
      if (response.success) {
        await loadClients(false);
        onDeleteModalClose();
        toast.success('Client deleted successfully!');
      } else {
        toast.error('Failed to delete client. Please try again.');
      }
    } catch (error) {
      console.error('Delete client error:', error);
      toast.error('An error occurred while deleting the client.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !selectedPcoId) return;
    
    try {
      setIsAssigning(true);
      const response = await adminService.assignClientsToPC0({
        client_ids: [selectedClient.id],
        action: 'assign',
        pco_id: parseInt(selectedPcoId),
        assigned_by: 1 // TODO: Get current admin user ID
      });
      
      if (response.success) {
        await loadClients(false);
        onAssignModalClose();
        toast.success('PCO assigned successfully!');
      } else {
        toast.error('Failed to assign PCO. Please try again.');
      }
    } catch (error) {
      console.error('Assign PCO error:', error);
      toast.error('An error occurred while assigning the PCO.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUpdateNotes = async () => {
    if (!selectedClient || !clientNotes.trim()) return;
    
    try {
      // Create a new note for the client
      const response = await adminService.createClientNote({
        client_id: selectedClient.id,
        user_id: 1, // TODO: Get current admin user ID
        note_text: clientNotes,
        is_private: isPrivateNote
      });
      
      if (response.success) {
        // Reload notes to show the new one
        const notesResponse = await adminService.getClientNotes(selectedClient.id, 'admin');
        if (notesResponse.success && notesResponse.data) {
          setExistingNotes(notesResponse.data);
        }
        setClientNotes(''); // Clear the input
        toast.success('Note added successfully!');
      } else {
        toast.error('Failed to add note. Please try again.');
      }
    } catch (error) {
      console.error('Add note error:', error);
      toast.error('An error occurred while adding the note.');
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading && !hasInitialData) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        {/* Freshdesk-style Navigation Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
                <p className="text-sm text-gray-500">Manage pest control clients</p>
              </div>
            </div>
            <div className="w-32 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto px-8 py-6">
            {/* Skeleton Stats Overview */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse mr-4"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skeleton Main Content */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              {/* Skeleton Toolbar */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-1 max-w-md h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="w-32 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                  <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>

              {/* Skeleton Client List */}
              <div className="divide-y divide-gray-100">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                        <div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-32"></div>
                          <div className="flex items-center space-x-3">
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                            <div className="h-6 bg-gray-200 rounded animate-pulse w-24"></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse mb-1 w-16"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
                        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load clients</h3>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button
            onClick={() => {
              setHasInitialData(false);
              loadClients(true);
            }}
            className="inline-flex items-center px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Small Loading Dialog */}
      {isSearching && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 px-6 py-4 flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-gray-700">Please wait...</span>
          </div>
        </div>
      )}

      {/* Freshdesk-style Navigation Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
              <p className="text-sm text-gray-500">Manage pest control clients</p>
            </div>
          </div>
          <Button 
            onClick={onCreateModalOpen}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-2.5 rounded-xl shadow-sm"
            startContent={<Plus className="h-4 w-4" />}
          >
            Add Client
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto px-8 py-6">
          {/* Freshdesk-style Stats Overview */}
          {stats && (
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                      <Building2 className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Clients</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total_clients}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.active_clients}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <UserCheck className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">With PCO</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.assigned_clients}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                      <UsersIcon className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Reports</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total_reports}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Freshdesk-style Main Content */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            {/* Toolbar */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search clients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-500 bg-white focus:outline-none focus:ring-0 focus:border-purple-500 hover:border-gray-400 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="relative w-32">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-0 focus:border-purple-500 hover:border-gray-400 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {filteredClients.length} items
                </div>
              </div>
            </div>

            {/* Client List */}
            <div className="divide-y divide-gray-100">
              {filteredClients.map((client) => (
                <div key={client.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{client.name}</h3>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-gray-500 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {client.address}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {client.email}
                          </span>
                          {client.assigned_pco && (
                            <Chip
                              size="sm"
                              variant="flat"
                              className="bg-blue-100 text-blue-800"
                            >
                              PCO: {typeof client.assigned_pco === 'object' ? client.assigned_pco.name : client.assigned_pco}
                            </Chip>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {client.total_reports || 0} reports
                        </p>
                        <p className="text-xs text-gray-500">
                          {client.phone || 'No phone'}
                        </p>
                      </div>
                      <Chip
                        size="sm"
                        variant="flat"
                        classNames={{
                          base: client.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800',
                        }}
                      >
                        {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                      </Chip>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button variant="light" size="sm" isIconOnly>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                          <DropdownItem 
                            key="view" 
                            startContent={<Eye className="h-4 w-4" />}
                            onPress={() => handleViewClient(client)}
                          >
                            View Details
                          </DropdownItem>
                          <DropdownItem 
                            key="edit" 
                            startContent={<Edit3 className="h-4 w-4" />}
                            onPress={() => handleEditClient(client)}
                          >
                            Edit
                          </DropdownItem>
                          {!client.assigned_pco ? (
                            <DropdownItem 
                              key="assign" 
                              startContent={<UserPlus className="h-4 w-4" />}
                              onPress={() => handleAssignClick(client)}
                            >
                              Assign PCO
                            </DropdownItem>
                          ) : (
                            <DropdownItem 
                              key="unassign" 
                              startContent={<UserCheck className="h-4 w-4" />}
                              onPress={() => handleUnassignClick(client)}
                              className="text-warning"
                              color="warning"
                            >
                              Unassign PCO
                            </DropdownItem>
                          )}
                          <DropdownItem 
                            key="notes" 
                            startContent={<StickyNote className="h-4 w-4" />}
                            onPress={() => handleNotesClick(client)}
                          >
                            Notes
                          </DropdownItem>
                          <DropdownItem 
                            key="delete" 
                            className="text-danger" 
                            color="danger"
                            startContent={<Trash2 className="h-4 w-4" />}
                            onPress={() => handleDeleteClick(client)}
                          >
                            Delete
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredClients.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
                <p className="text-gray-500 text-sm mb-6">
                  {searchTerm || filterStatus !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Get started by adding your first client'}
                </p>
                {!searchTerm && filterStatus === 'all' && (
                  <Button 
                    onClick={onCreateModalOpen}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                    startContent={<Plus className="h-4 w-4" />}
                  >
                    Add Client
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Client Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={onCreateModalClose} size="lg">
        <ModalContent>
          <form onSubmit={handleCreateClient}>
            <ModalHeader>Add New Client</ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={createForm.address}
                    onChange={(e) => setCreateForm({...createForm, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({...createForm, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-purple-500"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Contact Information
                    </label>
                    <button
                      type="button"
                      onClick={addContactToCreateForm}
                      className="flex items-center text-sm text-purple-600 hover:text-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Contact
                    </button>
                  </div>
                  <div className="space-y-3">
                    {createForm.contact.map((contact, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">
                            Contact {index + 1}
                          </span>
                          {createForm.contact.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeContactFromCreateForm(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">
                              Contact Name
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., John Doe"
                              value={contact.name}
                              onChange={(e) => updateContactInCreateForm(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-purple-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              placeholder="e.g., +27123456789"
                              value={contact.number}
                              onChange={(e) => updateContactInCreateForm(index, 'number', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-purple-500 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({...createForm, status: e.target.value as 'active' | 'inactive'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-purple-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onCreateModalClose} disabled={isCreating}>
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                isLoading={isCreating}
              >
                Create Client
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Edit Client Modal */}
      <Modal isOpen={isEditModalOpen} onClose={onEditModalClose} size="lg">
        <ModalContent>
          <form onSubmit={handleEditSubmit}>
            <ModalHeader>Edit Client</ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-purple-500"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Contact Information
                    </label>
                    <button
                      type="button"
                      onClick={addContactToEditForm}
                      className="flex items-center text-sm text-purple-600 hover:text-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Contact
                    </button>
                  </div>
                  <div className="space-y-3">
                    {editForm.contact.map((contact, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">
                            Contact {index + 1}
                          </span>
                          {editForm.contact.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeContactFromEditForm(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">
                              Contact Name
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., John Doe"
                              value={contact.name}
                              onChange={(e) => updateContactInEditForm(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-purple-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              placeholder="e.g., +27123456789"
                              value={contact.number}
                              onChange={(e) => updateContactInEditForm(index, 'number', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-purple-500 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value as 'active' | 'inactive'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-purple-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onEditModalClose} disabled={isEditing}>
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                isLoading={isEditing}
              >
                Update Client
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose} size="md">
        <ModalContent>
          <ModalHeader className="text-red-600">Delete Client</ModalHeader>
          <ModalBody>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete "{selectedClient?.name}"?
              </h3>
              <p className="text-gray-500 text-sm">
                This action cannot be undone. All associated data including reports and history will be permanently removed.
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onDeleteModalClose} disabled={isDeleting}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
              isLoading={isDeleting}
            >
              Delete Client
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Client Details Modal */}
      <Modal isOpen={isViewModalOpen} onClose={onViewModalClose} size="lg">
        <ModalContent>
          <ModalHeader>Client Details</ModalHeader>
          <ModalBody>
            {selectedClient && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedClient.name}</h3>
                    <Chip
                      size="sm"
                      variant="flat"
                      classNames={{
                        base: selectedClient.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800',
                      }}
                    >
                      {selectedClient.status.charAt(0).toUpperCase() + selectedClient.status.slice(1)}
                    </Chip>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {selectedClient.address}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        {selectedClient.email}
                      </div>
                      {selectedClient.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="h-4 w-4 mr-2">📞</span>
                          {selectedClient.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Service Information</h4>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Reports:</span> {selectedClient.total_reports || 0}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Assigned PCO:</span> {
                          selectedClient.assigned_pco 
                            ? (typeof selectedClient.assigned_pco === 'object' ? selectedClient.assigned_pco.name : selectedClient.assigned_pco)
                            : 'Not assigned'
                        }
                      </div>
                      {selectedClient.created_at && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Created:</span> {new Date(selectedClient.created_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedClient.contact && selectedClient.contact.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Contact Information
                      {selectedClient.contact.length > 1 && (
                        <span className="text-sm text-gray-500 ml-2">
                          ({selectedClient.contact.length} contacts)
                        </span>
                      )}
                    </h4>
                    <div className="space-y-2">
                      {selectedClient.contact.map((contact, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                          <div className="text-sm">
                            {contact.name && (
                              <div className="font-medium text-gray-900">
                                {contact.name}
                              </div>
                            )}
                            {contact.number && (
                              <div className="text-gray-600 flex items-center mt-1">
                                <Phone className="w-4 h-4 mr-1" />
                                {contact.number}
                              </div>
                            )}
                            {!contact.name && !contact.number && (
                              <div className="text-gray-400 italic">
                                Contact {index + 1} - No information provided
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onViewModalClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Assign PCO Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={onAssignModalClose} size="md">
        <ModalContent>
          <form onSubmit={handleAssignSubmit}>
            <ModalHeader>Assign PCO</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Client</h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{selectedClient?.name}</p>
                        <p className="text-sm text-gray-500">{selectedClient?.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select PCO
                  </label>
                  <select
                    value={selectedPcoId}
                    onChange={(e) => setSelectedPcoId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-purple-500"
                    required
                  >
                    <option value="">Choose a PCO...</option>
                    {pcos.map((pco) => (
                      <option key={pco.id} value={pco.id}>
                        {pco.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    PCO will be responsible for this client's pest control services
                  </p>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onAssignModalClose} disabled={isAssigning}>
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                isLoading={isAssigning}
              >
                Assign PCO
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Notes Modal */}
      <Modal isOpen={isNotesModalOpen} onClose={onNotesModalClose} size="lg">
        <ModalContent>
          <ModalHeader>Client Notes</ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Client</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedClient?.name}</p>
                      <p className="text-sm text-gray-500">{selectedClient?.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Existing Notes */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Existing Notes</h4>
                <div className="max-h-60 overflow-y-auto space-y-3">
                  {isLoadingNotes ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="ml-2 text-sm text-gray-500">Loading notes...</span>
                    </div>
                  ) : existingNotes.length > 0 ? (
                    existingNotes.map((note) => (
                      <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">{note.created_by_name}</span>
                            <span className="text-xs text-gray-500">({note.created_by_role})</span>
                            {note.is_private && (
                              <Chip size="sm" variant="flat" className="bg-red-100 text-red-800 text-xs">
                                Private
                              </Chip>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(note.created_at).toLocaleDateString()} {new Date(note.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.note_text}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <StickyNote className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No notes found for this client</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Add New Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add New Note
                </label>
                <textarea
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-purple-500 resize-none"
                  placeholder="Add notes about this client, special instructions, preferences, etc..."
                />
                
                {/* Privacy Toggle */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="privateNote"
                      checked={isPrivateNote}
                      onChange={(e) => setIsPrivateNote(e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="privateNote" className="text-sm text-gray-700">
                      Private note (visible to admins only)
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    {isPrivateNote ? 'Only admins can see this note' : 'PCOs and admins can see this note'}
                  </p>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onNotesModalClose}>
              Close
            </Button>
            <Button 
              onClick={handleUpdateNotes}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
              isDisabled={!clientNotes.trim()}
            >
              Add Note
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
