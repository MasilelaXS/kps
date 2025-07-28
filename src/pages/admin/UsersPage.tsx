import React, { useState, useEffect, useCallback } from 'react';
import { 
  UserPlus,
  Search,
  MoreHorizontal,
  Edit3,
  Trash2,
  Eye,
  AlertCircle,
  Users as UsersIcon,
  Shield,
  UserCheck,
  ChevronDown,
  Check
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
  Avatar
} from '@heroui/react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import type { User as UserType } from '../../services/adminService';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [stats, setStats] = useState<{
    total_users: number;
    admin_count: number;
    pco_count: number;
    active_count: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [hasInitialData, setHasInitialData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // HeroUI disclosure hooks
  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
  const { isOpen: isViewModalOpen, onOpen: onViewModalOpen, onClose: onViewModalClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  // Form state for creating user
  const [createForm, setCreateForm] = useState({
    pco_number: '',
    name: '',
    email: '',
    password: '',
    role: 'pco' as 'admin' | 'pco',
    phone: '',
    status: 'active' as 'active' | 'inactive'
  });

  // Form state for editing user
  const [editForm, setEditForm] = useState({
    id: '',
    pco_number: '',
    name: '',
    email: '',
    role: 'pco' as 'admin' | 'pco',
    phone: '',
    status: 'active' as 'active' | 'inactive'
  });

  const loadUsers = useCallback(async (isInitialLoad = false) => {
    try {
      // Use skeleton loading for initial load, dialog for subsequent loads
      if (isInitialLoad || !hasInitialData) {
        setIsLoading(true);
      } else {
        setIsSearching(true);
      }
      setError(null);
      const response = await adminService.getUsers();
      
      if (response.success && response.data) {
        setUsers(response.data);
        if (!hasInitialData) {
          setHasInitialData(true);
        }
      } else {
        setError('Failed to load users');
      }
    } catch (error) {
      console.error('Users load error:', error);
      setError('Failed to load users');
    } finally {
      if (isInitialLoad || !hasInitialData) {
        setIsLoading(false);
      } else {
        setIsSearching(false);
      }
    }
  }, [hasInitialData]);

  const loadStats = useCallback(async () => {
    try {
      // Calculate stats from users data
      const totalUsers = users.length;
      const adminCount = users.filter(u => u.role === 'admin').length;
      const pcoCount = users.filter(u => u.role === 'pco').length;
      const activeCount = users.filter(u => u.status === 'active').length;
      
      setStats({
        total_users: totalUsers,
        admin_count: adminCount,
        pco_count: pcoCount,
        active_count: activeCount
      });
    } catch (error) {
      console.error('Stats load error:', error);
    }
  }, [users]);

  useEffect(() => {
    loadUsers(true); // Initial load
  }, [loadUsers]);

  useEffect(() => {
    if (users.length > 0) {
      loadStats();
    }
  }, [users, loadStats]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsCreating(true);
      const response = await adminService.createUser(createForm);
      
      if (response.success) {
        await loadUsers(false);
        onCreateModalClose();
        setCreateForm({
          pco_number: '',
          name: '',
          email: '',
          password: '',
          role: 'pco',
          phone: '',
          status: 'active'
        });
        toast.success('User created successfully!');
      } else {
        toast.error('Failed to create user. Please check the details and try again.');
      }
    } catch (error) {
      console.error('Create user error:', error);
      toast.error('An error occurred while creating the user.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditUser = (user: UserType) => {
    setEditForm({
      id: user.id.toString(),
      pco_number: user.pco_number,
      name: user.name,
      email: user.email,
      role: user.role as 'admin' | 'pco',
      phone: user.phone || '',
      status: user.status as 'active' | 'inactive'
    });
    onEditModalOpen();
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsUpdating(true);
      
      const updateData = {
        pco_number: editForm.pco_number,
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
        phone: editForm.phone,
        status: editForm.status
      };
      
      const response = await adminService.updateUser(parseInt(editForm.id), updateData);
      
      if (response.success) {
        await loadUsers(false);
        onEditModalClose();
        toast.success('User updated successfully!');
      } else {
        toast.error('Failed to update user. Please check the details and try again.');
      }
    } catch (error) {
      console.error('Update user error:', error);
      toast.error('An error occurred while updating the user.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setIsDeleting(true);
      const response = await adminService.deleteUser(userToDelete.id);
      if (response.success) {
        await loadUsers(false);
        toast.success('User deleted successfully!');
        onDeleteModalClose();
        setUserToDelete(null);
      } else {
        toast.error('Failed to delete user. Please try again.');
      }
    } catch (error) {
      console.error('Delete user error:', error);
      toast.error('An error occurred while deleting the user.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteClick = (user: UserType) => {
    setUserToDelete(user);
    onDeleteModalOpen();
  };

  const handleViewUser = (user: UserType) => {
    setSelectedUser(user);
    onViewModalOpen();
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.pco_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (isLoading && !hasInitialData) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        {/* Freshdesk-style Navigation Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <UsersIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
                <p className="text-sm text-gray-500">Manage PCOs and administrators</p>
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
                    <div className="w-32 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                  <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>

              {/* Skeleton User List */}
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load users</h3>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button
            onClick={() => {
              setHasInitialData(false);
              loadUsers(true);
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
              <UsersIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
              <p className="text-sm text-gray-500">Manage PCOs and administrators</p>
            </div>
          </div>
          <Button 
            onClick={onCreateModalOpen}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-2.5 rounded-xl shadow-sm"
            startContent={<UserPlus className="h-4 w-4" />}
          >
            Add User
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
                      <UsersIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total_users}</p>
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
                      <p className="text-2xl font-bold text-gray-900">{stats.active_count}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Admins</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.admin_count}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                      <UserCheck className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">PCOs</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.pco_count}</p>
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
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-500 bg-white focus:outline-none focus:ring-0 focus:border-purple-500 hover:border-gray-400 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="relative w-32">
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-0 focus:border-purple-500 hover:border-gray-400 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="pco">PCO</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-gray-400" />
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
                  {filteredUsers.length} items
                </div>
              </div>
            </div>

            {/* User List */}
            <div className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <div key={user.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar
                        name={user.name.charAt(0).toUpperCase()}
                        className="w-10 h-10 bg-purple-600 text-white font-semibold"
                      />
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{user.name}</h3>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                            {user.pco_number}
                          </span>
                          <span className="text-xs text-gray-500">{user.email}</span>
                          <Chip
                            size="sm"
                            variant="flat"
                            classNames={{
                              base: user.role === 'admin' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-orange-100 text-orange-800',
                            }}
                          >
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Chip>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{user.phone || 'No phone'}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Chip
                        size="sm"
                        variant="flat"
                        classNames={{
                          base: user.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800',
                        }}
                      >
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
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
                            onPress={() => handleViewUser(user)}
                          >
                            View Details
                          </DropdownItem>
                          <DropdownItem 
                            key="edit" 
                            startContent={<Edit3 className="h-4 w-4" />}
                            onPress={() => handleEditUser(user)}
                          >
                            Edit
                          </DropdownItem>
                          <DropdownItem 
                            key="delete" 
                            className="text-danger" 
                            color="danger"
                            startContent={<Trash2 className="h-4 w-4" />}
                            onPress={() => handleDeleteClick(user)}
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

            {filteredUsers.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UsersIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-500 text-sm mb-6">
                  {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Get started by adding your first user'}
                </p>
                {!searchTerm && filterRole === 'all' && filterStatus === 'all' && (
                  <Button 
                    onClick={onCreateModalOpen}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                    startContent={<UserPlus className="h-4 w-4" />}
                  >
                    Add User
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={onCreateModalClose} size="lg">
        <ModalContent>
          <form onSubmit={handleCreateUser}>
            <ModalHeader>Add New User</ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PCO Number
                  </label>
                  <input
                    type="text"
                    value={createForm.pco_number}
                    onChange={(e) => setCreateForm({...createForm, pco_number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-purple-500"
                    required
                  />
                </div>
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
                    Password
                  </label>
                  <input
                    type="password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      value={createForm.role}
                      onChange={(e) => setCreateForm({...createForm, role: e.target.value as 'admin' | 'pco'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-purple-500"
                    >
                      <option value="pco">PCO</option>
                      <option value="admin">Admin</option>
                    </select>
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
                Create User
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={isEditModalOpen} onClose={onEditModalClose} size="lg">
        <ModalContent>
          <form onSubmit={handleUpdateUser}>
            <ModalHeader>Edit User</ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PCO Number
                  </label>
                  <input
                    type="text"
                    value={editForm.pco_number}
                    onChange={(e) => setEditForm({...editForm, pco_number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-purple-500"
                    required
                  />
                </div>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({...editForm, role: e.target.value as 'admin' | 'pco'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-purple-500"
                    >
                      <option value="pco">PCO</option>
                      <option value="admin">Admin</option>
                    </select>
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
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onEditModalClose} disabled={isUpdating}>
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                isLoading={isUpdating}
              >
                Update User
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* View User Modal */}
      <Modal isOpen={isViewModalOpen} onClose={onViewModalClose} size="2xl">
        <ModalContent>
          <ModalHeader>User Details</ModalHeader>
          <ModalBody>
            {selectedUser && (
              <div className="grid grid-cols-1 gap-6">
                <div className="flex items-center space-x-4">
                  <Avatar
                    name={selectedUser.name.charAt(0).toUpperCase()}
                    className="w-16 h-16 bg-purple-600 text-white font-semibold text-lg"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedUser.name}</h3>
                    <p className="text-gray-500">{selectedUser.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PCO Number
                    </label>
                    <p className="text-sm text-gray-900 font-mono bg-gray-100 px-3 py-2 rounded-lg">
                      {selectedUser.pco_number}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded-lg">
                      {selectedUser.phone || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <Chip
                      variant="flat"
                      classNames={{
                        base: selectedUser.role === 'admin' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-orange-100 text-orange-800',
                      }}
                    >
                      {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                    </Chip>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <Chip
                      variant="flat"
                      classNames={{
                        base: selectedUser.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800',
                      }}
                    >
                      {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                    </Chip>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Created
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded-lg">
                      {new Date(selectedUser.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Updated
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-100 px-3 py-2 rounded-lg">
                      {selectedUser.updated_at ? new Date(selectedUser.updated_at).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onViewModalClose}>
              Close
            </Button>
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
              onPress={() => {
                if (selectedUser) {
                  onViewModalClose();
                  handleEditUser(selectedUser);
                }
              }}
            >
              Edit User
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete User Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose} size="md">
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalBody>
            {userToDelete && (
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Delete User
                </h3>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete <strong>{userToDelete.name}</strong>? 
                  This action cannot be undone.
                </p>
                <div className="bg-red-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-700">
                    This will permanently remove the user and all associated data.
                  </p>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onDeleteModalClose} disabled={isDeleting}>
              Cancel
            </Button>
            <Button 
              color="danger" 
              onPress={handleDeleteUser}
              isLoading={isDeleting}
              className="rounded-xl"
            >
              Delete User
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
