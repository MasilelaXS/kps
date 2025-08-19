import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus,
  Search,
  MoreHorizontal,
  Edit3,
  Trash2,
  Eye,
  AlertCircle,
  Package,
  Activity,
  ChevronDown,
  Check,
  Archive
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
  Chip,
  Avatar,
  Tabs,
  Tab
} from '@heroui/react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import type { Chemical, ChemicalStats } from '../../services/adminService';

export const ChemicalsPage: React.FC = () => {
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [inactiveChemicals, setInactiveChemicals] = useState<Chemical[]>([]);
  const [stats, setStats] = useState<ChemicalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [hasInitialData, setHasInitialData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'active' | 'inactive'>('active');
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPermanentDeleting, setIsPermanentDeleting] = useState(false);

  // HeroUI disclosure hooks
  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
  const { isOpen: isViewModalOpen, onOpen: onViewModalOpen, onClose: onViewModalClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  const { isOpen: isPermanentDeleteModalOpen, onOpen: onPermanentDeleteModalOpen, onClose: onPermanentDeleteModalClose } = useDisclosure();
  
  const [chemicalToDelete, setChemicalToDelete] = useState<Chemical | null>(null);
  const [chemicalToPermanentDelete, setChemicalToPermanentDelete] = useState<Chemical | null>(null);
  const [selectedChemical, setSelectedChemical] = useState<Chemical | null>(null);

  // Form state for creating chemical
  const [createForm, setCreateForm] = useState({
    l_number: '',
    name: '',
    type: '',
    category: 'inspection' as 'inspection' | 'fumigation' | 'both',
    quantity_unit: ''
  });

  // Form state for editing chemical
  const [editForm, setEditForm] = useState({
    id: '',
    l_number: '',
    name: '',
    type: '',
    category: 'inspection' as 'inspection' | 'fumigation' | 'both',
    quantity_unit: ''
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadChemicals = useCallback(async (isInitialLoad = false) => {
    try {
      // Use skeleton loading for initial load, dialog for subsequent loads
      if (isInitialLoad || !hasInitialData) {
        setIsLoading(true);
      } else {
        setIsSearching(true);
      }
      setError(null);
      const categoryFilter = filterCategory !== 'all' ? filterCategory as 'inspection' | 'fumigation' | 'both' : undefined;
      const response = await adminService.getChemicals(categoryFilter);
      
      if (response.success && response.data) {
        setChemicals(response.data);
        if (!hasInitialData) {
          setHasInitialData(true);
        }
      } else {
        setError('Failed to load chemicals');
      }
    } catch (error) {
      console.error('Chemicals load error:', error);
      setError('Failed to load chemicals');
    } finally {
      if (isInitialLoad || !hasInitialData) {
        setIsLoading(false);
      } else {
        setIsSearching(false);
      }
    }
  }, [filterCategory, hasInitialData]);

  const loadInactiveChemicals = useCallback(async (isInitialLoad = false) => {
    try {
      // Use skeleton loading for initial load, dialog for subsequent loads
      if (isInitialLoad || !hasInitialData) {
        setIsLoading(true);
      } else {
        setIsSearching(true);
      }
      setError(null);
      const response = await adminService.getInactiveChemicals();
      
      if (response.success && response.data) {
        setInactiveChemicals(response.data);
        if (!hasInitialData) {
          setHasInitialData(true);
        }
      } else {
        setError('Failed to load inactive chemicals');
      }
    } catch (error) {
      console.error('Inactive chemicals load error:', error);
      setError('Failed to load inactive chemicals');
    } finally {
      if (isInitialLoad || !hasInitialData) {
        setIsLoading(false);
      } else {
        setIsSearching(false);
      }
    }
  }, [hasInitialData]);

  const loadStats = async () => {
    try {
      const response = await adminService.getChemicalStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Stats load error:', error);
    }
  };

  useEffect(() => {
    if (viewMode === 'active') {
      loadChemicals(true); // Initial load
    } else {
      loadInactiveChemicals(true); // Initial load
    }
  }, [viewMode, loadChemicals, loadInactiveChemicals]);

  useEffect(() => {
    if (hasInitialData && viewMode === 'active') { // Only trigger filter changes after initial data is loaded
      loadChemicals(false);
    }
  }, [filterCategory, loadChemicals, hasInitialData, viewMode]);

  const handleCreateChemical = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsCreating(true);
      const response = await adminService.createChemical(createForm);
      
      if (response.success) {
        await loadChemicals(false);
        await loadStats();
        onCreateModalClose();
        setCreateForm({
          l_number: '',
          name: '',
          type: '',
          category: 'inspection',
          quantity_unit: ''
        });
        toast.success('Chemical created successfully!');
      } else {
        toast.error('Failed to create chemical. Please check the details and try again.');
      }
    } catch (error) {
      console.error('Create chemical error:', error);
      toast.error('An error occurred while creating the chemical.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditChemical = (chemical: Chemical) => {
    setEditForm({
      id: chemical.id.toString(),
      l_number: chemical.l_number,
      name: chemical.name,
      type: chemical.type || '',
      category: chemical.category,
      quantity_unit: chemical.quantity_unit
    });
    onEditModalOpen();
  };

  const handleUpdateChemical = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsUpdating(true);
      
      const updateData = {
        l_number: editForm.l_number,
        name: editForm.name,
        type: editForm.type,
        category: editForm.category,
        quantity_unit: editForm.quantity_unit
      };
      
      const response = await adminService.updateChemical(parseInt(editForm.id), updateData);
      
      if (response.success) {
        await loadChemicals(false);
        await loadStats();
        onEditModalClose();
        toast.success('Chemical updated successfully!');
      } else {
        toast.error('Failed to update chemical. Please check the details and try again.');
      }
    } catch (error) {
      console.error('Update chemical error:', error);
      toast.error('An error occurred while updating the chemical.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteChemical = async () => {
    if (!chemicalToDelete) return;
    
    try {
      setIsDeleting(true);
      const response = await adminService.deleteChemical(chemicalToDelete.id);
      if (response.success) {
        await loadChemicals(false);
        await loadStats();
        toast.success('Chemical deactivated successfully!');
        onDeleteModalClose();
        setChemicalToDelete(null);
      } else {
        toast.error('Failed to deactivate chemical. Please try again.');
      }
    } catch (error) {
      console.error('Delete chemical error:', error);
      toast.error('An error occurred while deactivating the chemical.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePermanentDeleteChemical = async () => {
    if (!chemicalToPermanentDelete) return;
    
    try {
      setIsPermanentDeleting(true);
      const response = await adminService.permanentDeleteChemical(chemicalToPermanentDelete.id);
      if (response.success) {
        await loadInactiveChemicals(false);
        await loadStats();
        toast.success('Chemical permanently deleted successfully!');
        onPermanentDeleteModalClose();
        setChemicalToPermanentDelete(null);
      } else {
        toast.error('Failed to permanently delete chemical. Please try again.');
      }
    } catch (error) {
      console.error('Permanent delete chemical error:', error);
      toast.error('An error occurred while permanently deleting the chemical.');
    } finally {
      setIsPermanentDeleting(false);
    }
  };

  const handleDeleteClick = (chemical: Chemical) => {
    setChemicalToDelete(chemical);
    onDeleteModalOpen();
  };

  const handlePermanentDeleteClick = (chemical: Chemical) => {
    setChemicalToPermanentDelete(chemical);
    onPermanentDeleteModalOpen();
  };

  const handleViewChemical = (chemical: Chemical) => {
    setSelectedChemical(chemical);
    onViewModalOpen();
  };



  const currentChemicals = viewMode === 'active' ? chemicals : inactiveChemicals;
  
  const filteredChemicals = currentChemicals.filter(chemical => {
    const matchesSearch = chemical.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chemical.l_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (chemical.type && chemical.type.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // For inactive chemicals, don't apply category filter since they already have mixed categories
    if (viewMode === 'inactive') {
      return matchesSearch;
    }
    
    // For active chemicals, apply category filter
    const matchesCategory = filterCategory === 'all' || chemical.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (isLoading && !hasInitialData) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        {/* Freshdesk-style Navigation Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Chemicals</h1>
                <p className="text-sm text-gray-500">Manage your chemical inventory</p>
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
                    <div className="w-48 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                  <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>

              {/* Skeleton Chemical List */}
              <div className="divide-y divide-gray-100">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load chemicals</h3>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button
            onClick={() => {
              setHasInitialData(false);
              loadChemicals(true);
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
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Chemicals</h1>
              <p className="text-sm text-gray-500">Manage your chemical inventory</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Tabs 
              selectedKey={viewMode}
              onSelectionChange={(key) => {
                setViewMode(key as 'active' | 'inactive');
                setSearchTerm(''); // Clear search when switching
                setFilterCategory('all'); // Reset filter when switching
              }}
              classNames={{
                tabList: "bg-gray-100 p-1 rounded-lg",
                tab: "px-4 py-2 rounded-md text-sm font-medium",
                cursor: "bg-white shadow-sm",
              }}
            >
              <Tab key="active" title={
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4" />
                  <span>Active Chemicals</span>
                </div>
              } />
              <Tab key="inactive" title={
                <div className="flex items-center space-x-2">
                  <Archive className="h-4 w-4" />
                  <span>Inactive Chemicals</span>
                </div>
              } />
            </Tabs>
            {viewMode === 'active' && (
              <Button 
                onClick={onCreateModalOpen}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-2.5 rounded-xl shadow-sm"
                startContent={<Plus className="h-4 w-4" />}
              >
                Add Chemical
              </Button>
            )}
          </div>
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
                      <Package className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Chemicals</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.summary.total_chemicals}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <Check className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.summary.active_chemicals}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <Eye className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Inspection</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.summary.inspection_chemicals}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                      <Activity className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Fumigation</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.summary.fumigation_chemicals}</p>
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
                        placeholder="Search chemicals..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-500 bg-white focus:outline-none focus:ring-0 focus:border-purple-500 hover:border-gray-400 transition-colors"
                      />
                    </div>
                  </div>
                  {viewMode === 'active' && (
                    <div className="relative w-48">
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-0 focus:border-purple-500 hover:border-gray-400 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="all">All Categories</option>
                        <option value="inspection">Inspection</option>
                        <option value="fumigation">Fumigation</option>
                        <option value="both">Multi-Purpose</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {filteredChemicals.length} items
                </div>
              </div>
            </div>

            {/* Chemical List */}
            <div className="divide-y divide-gray-100">
              {filteredChemicals.map((chemical) => (
                <div key={chemical.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar
                        name={chemical.name.charAt(0).toUpperCase()}
                        className="w-10 h-10 bg-purple-600 text-white font-semibold"
                      />
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{chemical.name}</h3>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                            {chemical.l_number}
                          </span>
                          {chemical.type && (
                            <span className="text-xs text-gray-500">{chemical.type}</span>
                          )}
                          <Chip
                            size="sm"
                            variant="flat"
                            classNames={{
                              base: `${
                                chemical.category === 'inspection' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : chemical.category === 'fumigation'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`,
                            }}
                          >
                            {chemical.category.charAt(0).toUpperCase() + chemical.category.slice(1)}
                          </Chip>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        {viewMode === 'inactive' ? (
                          <>
                            <p className="text-sm font-medium text-gray-900">
                              {chemical.total_usage_count || 0} reports
                            </p>
                            <p className="text-xs text-gray-500">
                              {chemical.last_used_formatted || 'Never used'}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-medium text-gray-900">{chemical.quantity_unit}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(chemical.created_at).toLocaleDateString()}
                            </p>
                          </>
                        )}
                      </div>
                      <Chip
                        size="sm"
                        variant="flat"
                        classNames={{
                          base: viewMode === 'active' 
                            ? (chemical.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')
                            : 'bg-red-100 text-red-800',
                        }}
                      >
                        {viewMode === 'active' 
                          ? (chemical.is_active ? 'Active' : 'Inactive')
                          : 'Inactive'
                        }
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
                            onPress={() => handleViewChemical(chemical)}
                          >
                            View Details
                          </DropdownItem>
                          {viewMode === 'active' ? (
                            <>
                              <DropdownItem 
                                key="edit" 
                                startContent={<Edit3 className="h-4 w-4" />}
                                onPress={() => handleEditChemical(chemical)}
                              >
                                Edit
                              </DropdownItem>
                              <DropdownItem 
                                key="delete" 
                                className="text-danger" 
                                color="danger"
                                startContent={<Archive className="h-4 w-4" />}
                                onPress={() => handleDeleteClick(chemical)}
                              >
                                Deactivate
                              </DropdownItem>
                            </>
                          ) : (
                            <DropdownItem 
                              key="permanent-delete" 
                              className="text-danger" 
                              color="danger"
                              startContent={<Trash2 className="h-4 w-4" />}
                              onPress={() => handlePermanentDeleteClick(chemical)}
                              isDisabled={chemical.total_usage_count !== 0}
                            >
                              {chemical.total_usage_count === 0 ? 'Delete Permanently' : `Used in ${chemical.total_usage_count} reports`}
                            </DropdownItem>
                          )}
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredChemicals.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {viewMode === 'active' ? (
                    <Package className="h-8 w-8 text-gray-400" />
                  ) : (
                    <Archive className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {viewMode === 'active' ? 'No active chemicals found' : 'No inactive chemicals found'}
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  {searchTerm || (viewMode === 'active' && filterCategory !== 'all')
                    ? 'Try adjusting your search or filter criteria'
                    : viewMode === 'active'
                    ? 'Get started by adding your first chemical'
                    : 'All chemicals are currently active'
                  }
                </p>
                {!searchTerm && filterCategory === 'all' && viewMode === 'active' && (
                  <Button 
                    onClick={onCreateModalOpen}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                    startContent={<Plus className="h-4 w-4" />}
                  >
                    Add Chemical
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Freshdesk-style Create Modal */}
      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={onCreateModalClose} 
        size="lg"
        classNames={{
          base: "bg-white",
          backdrop: "bg-black/50"
        }}
      >
        <ModalContent>
          <ModalHeader className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Plus className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Add New Chemical</h2>
                <p className="text-sm text-gray-500">Fill in the details below</p>
              </div>
            </div>
          </ModalHeader>
          <form onSubmit={handleCreateChemical}>
            <ModalBody className="px-6 py-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      L-Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={createForm.l_number}
                      onChange={(e) => setCreateForm({ ...createForm, l_number: e.target.value })}
                      placeholder="e.g., L001"
                      className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-500 bg-white focus:outline-none focus:ring-0 focus:border-purple-500 hover:border-gray-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chemical Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      placeholder="Enter chemical name"
                      className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-500 bg-white focus:outline-none focus:ring-0 focus:border-purple-500 hover:border-gray-400 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <input
                      type="text"
                      value={createForm.type}
                      onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                      placeholder="e.g., bait, spray, gel"
                      className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-500 bg-white focus:outline-none focus:ring-0 focus:border-purple-500 hover:border-gray-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={createForm.category}
                        onChange={(e) => setCreateForm({ ...createForm, category: e.target.value as 'inspection' | 'fumigation' | 'both' })}
                        className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-0 focus:border-purple-500 hover:border-gray-400 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="inspection">Inspection</option>
                        <option value="fumigation">Fumigation</option>
                        <option value="both">Multi-Purpose</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity Unit *
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.quantity_unit}
                    onChange={(e) => setCreateForm({ ...createForm, quantity_unit: e.target.value })}
                    placeholder="e.g., blocks, ml, liters, grams"
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-500 bg-white focus:outline-none focus:ring-0 focus:border-purple-500 hover:border-gray-400 transition-colors"
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="px-6 py-4 border-t border-gray-200">
              <Button 
                variant="light" 
                onPress={onCreateModalClose}
                className="mr-3"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                isLoading={isCreating}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 rounded-xl"
              >
                {isCreating ? 'Creating...' : 'Create Chemical'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Freshdesk-style Edit Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={onEditModalClose} 
        size="lg"
        classNames={{
          base: "bg-white",
          backdrop: "bg-black/50"
        }}
      >
        <ModalContent>
          <ModalHeader className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Edit3 className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Edit Chemical</h2>
                <p className="text-sm text-gray-500">Update chemical information</p>
              </div>
            </div>
          </ModalHeader>
          <form onSubmit={handleUpdateChemical}>
            <ModalBody className="px-6 py-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      L-Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.l_number}
                      onChange={(e) => setEditForm({ ...editForm, l_number: e.target.value })}
                      placeholder="e.g., L001"
                      className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-500 bg-white focus:outline-none focus:ring-0 focus:border-purple-500 hover:border-gray-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chemical Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Enter chemical name"
                      className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-500 bg-white focus:outline-none focus:ring-0 focus:border-purple-500 hover:border-gray-400 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <input
                      type="text"
                      value={editForm.type}
                      onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                      placeholder="e.g., bait, spray, gel"
                      className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-500 bg-white focus:outline-none focus:ring-0 focus:border-purple-500 hover:border-gray-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value as 'inspection' | 'fumigation' | 'both' })}
                        className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-0 focus:border-purple-500 hover:border-gray-400 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="inspection">Inspection</option>
                        <option value="fumigation">Fumigation</option>
                        <option value="both">Multi-Purpose</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity Unit *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.quantity_unit}
                    onChange={(e) => setEditForm({ ...editForm, quantity_unit: e.target.value })}
                    placeholder="e.g., blocks, ml, liters, grams"
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-500 bg-white focus:outline-none focus:ring-0 focus:border-purple-500 hover:border-gray-400 transition-colors"
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="px-6 py-4 border-t border-gray-200">
              <Button 
                variant="light" 
                onPress={onEditModalClose}
                className="mr-3"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                isLoading={isUpdating}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 rounded-xl"
              >
                {isUpdating ? 'Updating...' : 'Update Chemical'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Freshdesk-style View Modal */}
      <Modal 
        isOpen={isViewModalOpen} 
        onClose={onViewModalClose} 
        size="2xl"
        classNames={{
          base: "bg-white",
          backdrop: "bg-black/50"
        }}
      >
        <ModalContent>
          <ModalHeader className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Chemical Details</h2>
                <p className="text-sm text-gray-500">Complete chemical information</p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="px-6 py-6">
            {selectedChemical && (
              <div className="space-y-8">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                  <Avatar
                    name={selectedChemical.name.charAt(0).toUpperCase()}
                    className="w-16 h-16 bg-purple-600 text-white text-xl font-bold"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedChemical.name}</h3>
                    <div className="flex items-center space-x-3 mt-2">
                      <span className="text-sm font-mono bg-white px-3 py-1 rounded-lg border">
                        {selectedChemical.l_number}
                      </span>
                      <Chip
                        variant="flat"
                        classNames={{
                          base: selectedChemical.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800',
                        }}
                      >
                        {selectedChemical.is_active ? 'Active' : 'Inactive'}
                      </Chip>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 text-base">Basic Information</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">Type:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedChemical.type || 'Not specified'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">Category:</span>
                        <Chip
                          size="sm"
                          variant="flat"
                          classNames={{
                            base: `${
                              selectedChemical.category === 'inspection' 
                                ? 'bg-blue-100 text-blue-800' 
                                : selectedChemical.category === 'fumigation'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-purple-100 text-purple-800'
                            }`,
                          }}
                        >
                          {selectedChemical.category.charAt(0).toUpperCase() + selectedChemical.category.slice(1)}
                        </Chip>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">Quantity Unit:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedChemical.quantity_unit}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">Created:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(selectedChemical.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {selectedChemical.last_used_date && (
                        <div className="flex justify-between py-2">
                          <span className="text-sm text-gray-600">Last Used:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedChemical.last_used_formatted || new Date(selectedChemical.last_used_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {(selectedChemical.usage_stats || selectedChemical.inspection_usage_count !== undefined) && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 text-base">Usage Statistics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2">
                          <span className="text-sm text-gray-600">Inspection Usage:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedChemical.usage_stats?.inspection_usage_count || selectedChemical.inspection_usage_count || 0} times
                          </span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-sm text-gray-600">Fumigation Usage:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedChemical.usage_stats?.fumigation_usage_count || selectedChemical.fumigation_usage_count || 0} times
                          </span>
                        </div>
                        {selectedChemical.total_usage_count !== undefined && (
                          <div className="flex justify-between py-2">
                            <span className="text-sm text-gray-600">Total Usage:</span>
                            <span className="text-sm font-medium text-gray-900">
                              {selectedChemical.total_usage_count} reports
                            </span>
                          </div>
                        )}
                        {selectedChemical.usage_stats && (
                          <>
                            <div className="flex justify-between py-2">
                              <span className="text-sm text-gray-600">Total Inspection Qty:</span>
                              <span className="text-sm font-medium text-gray-900">
                                {selectedChemical.usage_stats.total_inspection_quantity || 'N/A'} {selectedChemical.quantity_unit}
                              </span>
                            </div>
                            <div className="flex justify-between py-2">
                              <span className="text-sm text-gray-600">Total Fumigation Qty:</span>
                              <span className="text-sm font-medium text-gray-900">
                                {selectedChemical.usage_stats.total_fumigation_quantity || 'N/A'} {selectedChemical.quantity_unit}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter className="px-6 py-4 border-t border-gray-200">
            <Button 
              variant="light" 
              onPress={onViewModalClose}
              className="mr-3"
            >
              Close
            </Button>
            {viewMode === 'active' && (
              <Button 
                onPress={() => {
                  onViewModalClose();
                  if (selectedChemical) {
                    handleEditChemical(selectedChemical);
                  }
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 rounded-xl"
                startContent={<Edit3 className="h-4 w-4" />}
              >
                Edit Chemical
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Freshdesk-style Delete Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={onDeleteModalClose} 
        size="md"
        classNames={{
          base: "bg-white",
          backdrop: "bg-black/50"
        }}
      >
        <ModalContent>
          <ModalHeader className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Confirm Deactivation</h2>
                <p className="text-sm text-gray-500">This action will deactivate the chemical</p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="px-6 py-6">
            {chemicalToDelete && (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="flex items-center space-x-3">
                    <Avatar
                      name={chemicalToDelete.name.charAt(0).toUpperCase()}
                      className="w-10 h-10 bg-red-600 text-white font-semibold"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{chemicalToDelete.name}</p>
                      <p className="text-sm text-gray-500">{chemicalToDelete.l_number}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-900">
                    Are you sure you want to deactivate this chemical?
                  </p>
                  <p className="text-xs text-gray-500">
                    The chemical will be marked as inactive and won't appear in active listings. This action can be reversed later.
                  </p>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter className="px-6 py-4 border-t border-gray-200">
            <Button 
              variant="light" 
              onPress={onDeleteModalClose}
              className="mr-3"
            >
              Cancel
            </Button>
            <Button 
              color="danger" 
              onPress={handleDeleteChemical}
              isLoading={isDeleting}
              className="px-6"
            >
              {isDeleting ? 'Deactivating...' : 'Deactivate Chemical'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Freshdesk-style Permanent Delete Modal */}
      <Modal 
        isOpen={isPermanentDeleteModalOpen} 
        onClose={onPermanentDeleteModalClose} 
        size="md"
        classNames={{
          base: "bg-white",
          backdrop: "bg-black/50"
        }}
      >
        <ModalContent>
          <ModalHeader className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <Trash2 className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Permanent Deletion</h2>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="px-6 py-6">
            {chemicalToPermanentDelete && (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="flex items-center space-x-3">
                    <Avatar
                      name={chemicalToPermanentDelete.name.charAt(0).toUpperCase()}
                      className="w-10 h-10 bg-red-600 text-white font-semibold"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{chemicalToPermanentDelete.name}</p>
                      <p className="text-sm text-gray-500">{chemicalToPermanentDelete.l_number}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-900">
                    Are you sure you want to permanently delete this chemical?
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-yellow-800">
                        <p className="font-medium mb-1">This will permanently remove:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>The chemical from your inventory</li>
                          <li>All historical references</li>
                          <li>This action cannot be reversed</li>
                        </ul>
                        <p className="mt-2">
                          Usage Count: <span className="font-semibold">{chemicalToPermanentDelete.total_usage_count || 0} reports</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter className="px-6 py-4 border-t border-gray-200">
            <Button 
              variant="light" 
              onPress={onPermanentDeleteModalClose}
              className="mr-3"
            >
              Cancel
            </Button>
            <Button 
              color="danger" 
              onPress={handlePermanentDeleteChemical}
              isLoading={isPermanentDeleting}
              className="px-6"
              startContent={!isPermanentDeleting ? <Trash2 className="h-4 w-4" /> : undefined}
            >
              {isPermanentDeleting ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
