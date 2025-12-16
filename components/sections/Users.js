'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { UserAPI } from '../../app/lib/userAPI';
import DataTable from '../ui/DataTable';
import CreateForm from '../ui/CreateForm';
import LoadingSkeleton, { FormSkeleton } from '../ui/LoadingSkeleton';
import { ConfirmModal } from '../ui/Modal';

const FORM_FIELDS = [
  {
    name: 'name',
    label: 'Full Name',
    type: 'text',
    placeholder: 'Enter full name...',
    required: true
  },
  {
    name: 'email',
    label: 'Email Address',
    type: 'email',
    placeholder: 'Enter email address...',
    required: true
  },
  {
    name: 'phone',
    label: 'Phone Number',
    type: 'text',
    placeholder: 'Enter phone number...',
    required: true,
    help: 'Include country code (e.g., +201090608896)'
  },
  {
    name: 'user_type',
    label: 'User Type',
    type: 'select',
    required: true,
    options: [
      { value: 'citizen', label: 'Citizen' },
      { value: 'admin', label: 'Admin' },
      { value: 'moderator', label: 'Moderator' }
    ]
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password...',
    required: true,
    help: 'Minimum 8 characters with letters and numbers'
  },
  {
    name: 'avatar',
    label: 'Avatar',
    type: 'file',
    accept: 'image/*',
    help: 'Upload user avatar image (optional)'
  }
];

const TABLE_COLUMNS = [
  {
    key: 'id',
    label: 'ID',
    render: (value) => <span className="text-sm text-slate-500 font-mono">#{String(value)}</span>
  },
  {
    key: 'image',
    label: 'Avatar',
    render: (value, user) => (
      value ? (
        <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm border border-slate-200">
          <img 
            src={String(value).startsWith('http') ? value : `https://app.kashtat.co/${value}`} 
            alt={user.name} 
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm border border-slate-200">
          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
      )
    )
  },
  {
    key: 'name',
    label: 'Name',
    render: (value) => <span className="text-sm text-slate-800 font-semibold">{value}</span>
  },
  {
    key: 'email',
    label: 'Email',
    render: (value) => <span className="text-sm text-slate-600">{value}</span>
  },
  {
    key: 'phone',
    label: 'Phone',
    render: (value) => <span className="text-sm text-slate-600">{value}</span>
  },
  {
    key: 'user_type',
    label: 'Type',
    render: (value) => {
      const typeColors = {
        admin: 'bg-red-100 text-red-800 border-red-200',
        moderator: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        citizen: 'bg-green-100 text-green-800 border-green-200'
      };
      return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${typeColors[value] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
          {value}
        </span>
      );
    }
  }
];

export default function Users({ activeSubItem, onNavigate }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Modal states
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // Prevent duplicate API calls (React StrictMode protection)
  const isLoadingRef = useRef(false);
  const abortControllerRef = useRef(null);

  // Load users when component mounts
  const loadUsers = useCallback(async () => {
    // Prevent duplicate calls
    if (isLoadingRef.current) {
      return;
    }
    
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    isLoadingRef.current = true;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await UserAPI.getUsers();
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      if (result.success) {
        setUsers(result.users);
      } else {
        setError(result.error);
        setUsers([]);
      }
    } catch (error) {
      // Check if error is due to abort
      if (error.name === 'AbortError' || abortControllerRef.current?.signal.aborted) {
        return;
      }
      setError('Failed to load users');
      setUsers([]);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      isLoadingRef.current = false;
    };
  }, [loadUsers]);

  const handleCreate = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await UserAPI.createUser(
        formData.email,
        formData.name,
        formData.phone,
        formData.user_type,
        formData.password,
        formData.avatar
      );
      
      if (result.success) {
        // Refresh the users list
        await loadUsers();
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    // Navigate to edit-user sub-item
    if (onNavigate) {
      onNavigate('edit-user');
    }
  };

  const handleEditSave = async (editData) => {
    setIsLoading(true);
    try {
      const result = await UserAPI.updateUser(
        editData.id,
        editData.email,
        editData.name,
        editData.phone,
        editData.user_type,
        editData.password,
        editData.avatar
      );
      
      if (result.success) {
        await loadUsers();
        setSelectedUser(null);
        setError(null);
        // Navigate back to get-users
        if (onNavigate) {
          onNavigate('get-users');
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    setDeleteModal({ isOpen: true, user });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.user) return;
    
    setIsDeleting(true);
    try {
      const result = await UserAPI.deleteUser(deleteModal.user.id);
      
      if (result.success) {
        await loadUsers();
        setDeleteModal({ isOpen: false, user: null });
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderContent = () => {
    switch (activeSubItem) {
      case 'get-users':
        if (isLoading) {
          return (
            <div className="opacity-50">
              <LoadingSkeleton rows={5} />
            </div>
          );
        }

        if (error) {
          return (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Error Loading Users</h3>
              <p className="text-red-600 mb-8">{error}</p>
              <button 
                onClick={loadUsers}
                className="btn-primary flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Try Again</span>
              </button>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">All Users</h2>
                <p className="text-slate-600 mt-1">{users.length} users found</p>
              </div>
              <button 
                onClick={loadUsers}
                className="btn-ghost flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
            
            {users.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">No Users Found</h3>
                <p className="text-slate-600 mb-8">Start by creating your first user account.</p>
                <button 
                  onClick={() => onNavigate && onNavigate('add-user')}
                  className="btn-primary flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Create First User</span>
                </button>
              </div>
            ) : (
              <DataTable
                data={users}
                columns={TABLE_COLUMNS}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                searchable={true}
                actionable={true}
              />
            )}
          </div>
        );

      case 'add-user':
        if (isSubmitting) {
          return <FormSkeleton />;
        }

        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Add New User</h2>
              <p className="text-slate-600">Create a new user account with access to the platform.</p>
            </div>
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}
            
            <CreateForm
              title="User"
              fields={FORM_FIELDS}
              onSubmit={handleCreate}
              onCancel={() => setError(null)}
              isLoading={isSubmitting}
            />
          </div>
        );

      case 'edit-user':
        if (!selectedUser) {
          return (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Select a User to Edit</h3>
              <p className="text-slate-600 mb-8">Go to the users list and click the edit button on any user to modify it.</p>
              <button 
                onClick={() => onNavigate && onNavigate('get-users')}
                className="btn-primary flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span>View Users</span>
              </button>
            </div>
          );
        }

        if (isLoading) {
          return <FormSkeleton />;
        }

        return (
          <div className="space-y-8">
            <div className="flex items-center">
              <button
                onClick={() => {
                  setSelectedUser(null);
                  onNavigate && onNavigate('get-users');
                }}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200 mr-4"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Edit User</h2>
                <p className="text-slate-600 mt-1">Modifying: <span className="font-semibold">{selectedUser.name}</span></p>
              </div>
            </div>
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}
            
            <EditUserForm
              user={selectedUser}
              onSubmit={handleEditSave}
              onCancel={() => {
                setSelectedUser(null);
                onNavigate && onNavigate('get-users');
              }}
              isLoading={isLoading}
            />
          </div>
        );

      case 'user-permissions':
        return (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">User Permissions</h3>
            <p className="text-slate-600 mb-8">This feature is coming soon. You'll be able to manage detailed user permissions and roles here.</p>
            <button 
              onClick={() => onNavigate && onNavigate('get-users')}
              className="btn-primary flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <span>Back to Users</span>
            </button>
          </div>
        );

      default:
        return (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">Users Management</h3>
            <p className="text-slate-600">Select an option from the sidebar to manage users.</p>
          </div>
        );
    }
  };

  return (
    <div className="card-elevated animate-fade-in-up">
      {renderContent()}
      
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, user: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteModal.user?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

// Edit User Form Component
function EditUserForm({ user, onSubmit, onCancel, isLoading }) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [userType, setUserType] = useState(user?.user_type || 'citizen');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    user?.avatar 
      ? (user.avatar.startsWith('http') ? user.avatar : `https://app.kashtat.co/${user.avatar}`)
      : ''
  );

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) return;
    
    onSubmit({
      id: user.id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      user_type: userType,
      password: password.trim() || null,
      avatar: avatar
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Current Avatar Preview */}
      {previewUrl && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Current Avatar
          </label>
          <div className="w-20 h-20 rounded-full overflow-hidden border border-slate-200 shadow-sm">
            <img 
              src={previewUrl} 
              alt="User avatar" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* User Name */}
      <div>
        <label htmlFor="userName" className="block text-sm font-semibold text-slate-700 mb-3">
          Full Name
        </label>
        <input
          id="userName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-modern w-full"
          placeholder="Enter full name..."
          required
          disabled={isLoading}
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="userEmail" className="block text-sm font-semibold text-slate-700 mb-3">
          Email Address
        </label>
        <input
          id="userEmail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-modern w-full"
          placeholder="Enter email address..."
          required
          disabled={isLoading}
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="userPhone" className="block text-sm font-semibold text-slate-700 mb-3">
          Phone Number
        </label>
        <input
          id="userPhone"
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="input-modern w-full"
          placeholder="Enter phone number..."
          required
          disabled={isLoading}
        />
      </div>

      {/* User Type */}
      <div>
        <label htmlFor="userType" className="block text-sm font-semibold text-slate-700 mb-3">
          User Type
        </label>
        <select
          id="userType"
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          className="input-modern w-full"
          required
          disabled={isLoading}
        >
          <option value="citizen">Citizen</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
        </select>
      </div>

      {/* Password */}
      <div>
        <label htmlFor="userPassword" className="block text-sm font-semibold text-slate-700 mb-3">
          New Password (Optional)
        </label>
        <input
          id="userPassword"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-modern w-full"
          placeholder="Enter new password..."
          disabled={isLoading}
        />
        <p className="text-sm text-slate-500 mt-2">
          Leave empty to keep current password
        </p>
      </div>

      {/* Avatar Upload */}
      <div>
        <label htmlFor="userAvatar" className="block text-sm font-semibold text-slate-700 mb-3">
          Update Avatar (Optional)
        </label>
        <input
          id="userAvatar"
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="input-modern w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-500 file:text-white hover:file:bg-blue-600 file:transition-colors"
          disabled={isLoading}
        />
        <p className="text-sm text-slate-500 mt-2">
          Upload a new avatar to replace the current one (JPG, PNG, GIF up to 5MB)
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="btn-secondary flex-1 flex items-center justify-center"
        >
          <span>Cancel</span>
        </button>
        <button
          type="submit"
          disabled={isLoading || !name.trim() || !email.trim() || !phone.trim()}
          className="btn-primary flex-1 flex items-center justify-center"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving...</span>
            </div>
          ) : <span>Save Changes</span>}
        </button>
      </div>
    </form>
  );
} 