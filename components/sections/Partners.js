'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { PartnerAPI } from '../../app/lib/partnerAPI';
import DataTable from '../ui/DataTable';
import CreateForm from '../ui/CreateForm';
import LoadingSkeleton, { FormSkeleton } from '../ui/LoadingSkeleton';
import { ConfirmModal } from '../ui/Modal';

const FORM_FIELDS = [
  {
    name: 'name',
    label: 'Partner Name',
    type: 'text',
    placeholder: 'Enter partner name...',
    required: true,
    help: 'Name of the business or organization'
  },
  {
    name: 'email',
    label: 'Email Address',
    type: 'email',
    placeholder: 'Enter email address...',
    required: true,
    help: 'Contact email for the partner'
  },
  {
    name: 'phone',
    label: 'Phone Number',
    type: 'text',
    placeholder: 'Enter phone number...',
    required: true,
    help: 'Include country code (e.g., +201090608890)'
  },
  {
    name: 'site',
    label: 'Website URL',
    type: 'text',
    placeholder: 'https://www.example.com',
    required: true,
    help: 'Partner website or online presence'
  },
  {
    name: 'image',
    label: 'Partner Logo',
    type: 'file',
    accept: 'image/*',
    help: 'Upload partner logo or image (optional)'
  }
];

const TABLE_COLUMNS = [
  {
    key: 'image',
    label: 'Logo',
    render: (value, partner) => (
      value ? (
        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-slate-200">
          <img 
            src={value.startsWith('http') ? value : `https://app.kashtat.co/${value}`} 
            alt={partner.name} 
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold text-sm border border-slate-200">
          {partner.name ? partner.name.charAt(0).toUpperCase() : 'P'}
        </div>
      )
    )
  },
  {
    key: 'name',
    label: 'Partner Name',
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
    key: 'site',
    label: 'Website',
    render: (value) => (
      <a 
        href={value} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
      >
        {value.length > 30 ? `${value.substring(0, 30)}...` : value}
      </a>
    )
  }
];

export default function Partners({ activeSubItem, onNavigate }) {
  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  
  // Modal states
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, partner: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // Prevent duplicate API calls (React StrictMode protection)
  const isLoadingRef = useRef(false);
  const abortControllerRef = useRef(null);

  // Load partners when component mounts
  const loadPartners = useCallback(async () => {
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
      const result = await PartnerAPI.getPartners();
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      if (result.success) {
        setPartners(result.partners);
      } else {
        setError(result.error);
        setPartners([]);
      }
    } catch (error) {
      // Check if error is due to abort
      if (error.name === 'AbortError' || abortControllerRef.current?.signal.aborted) {
        return;
      }
      setError('Failed to load partners');
      setPartners([]);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPartners();
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      isLoadingRef.current = false;
    };
  }, [loadPartners]);

  const handleCreate = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await PartnerAPI.createPartner(
        formData.name,
        formData.email,
        formData.phone,
        formData.site,
        formData.image
      );
      
      if (result.success) {
        // Refresh the partners list
        await loadPartners();
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to create partner');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (partner) => {
    setSelectedPartner(partner);
    // Navigate to edit-partner sub-item
    if (onNavigate) {
      onNavigate('edit-partner');
    }
  };

  const handleEditSave = async (editData) => {
    setIsLoading(true);
    try {
      const result = await PartnerAPI.updatePartner(
        editData.id,
        editData.name,
        editData.email,
        editData.phone,
        editData.site,
        editData.image
      );
      
      if (result.success) {
        await loadPartners();
        setSelectedPartner(null);
        setError(null);
        // Navigate back to get-partners
        if (onNavigate) {
          onNavigate('get-partners');
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to update partner');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (partner) => {
    setDeleteModal({ isOpen: true, partner });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.partner) return;
    
    setIsDeleting(true);
    try {
      const result = await PartnerAPI.deletePartner(deleteModal.partner.id);
      
      if (result.success) {
        await loadPartners();
        setDeleteModal({ isOpen: false, partner: null });
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to delete partner');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderContent = () => {
    switch (activeSubItem) {
      case 'get-partners':
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
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Error Loading Partners</h3>
              <p className="text-red-600 mb-8">{error}</p>
              <button 
                onClick={loadPartners}
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
                <h2 className="text-2xl font-bold text-slate-800">All Partners</h2>
                <p className="text-slate-600 mt-1">{partners.length} partners found</p>
              </div>
              <button 
                onClick={loadPartners}
                className="btn-ghost flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
            
            {partners.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">No Partners Found</h3>
                <p className="text-slate-600 mb-8">Start by adding your first business partner.</p>
                <button 
                  onClick={() => onNavigate && onNavigate('add-partner')}
                  className="btn-primary flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add First Partner</span>
                </button>
              </div>
            ) : (
              <DataTable
                data={partners}
                columns={TABLE_COLUMNS}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                searchable={true}
                actionable={true}
              />
            )}
          </div>
        );

      case 'add-partner':
        if (isSubmitting) {
          return <FormSkeleton />;
        }

        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Add New Partner</h2>
              <p className="text-slate-600">Add a new business partner to expand your network.</p>
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
              title="Partner"
              fields={FORM_FIELDS}
              onSubmit={handleCreate}
              onCancel={() => setError(null)}
              isLoading={isSubmitting}
            />
          </div>
        );

      case 'edit-partner':
        if (!selectedPartner) {
          return (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Select a Partner to Edit</h3>
              <p className="text-slate-600 mb-8">Go to the partners list and click the edit button on any partner to modify it.</p>
              <button 
                onClick={() => onNavigate && onNavigate('get-partners')}
                className="btn-primary flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>View Partners</span>
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
                  setSelectedPartner(null);
                  onNavigate && onNavigate('get-partners');
                }}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200 mr-4"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Edit Partner</h2>
                <p className="text-slate-600 mt-1">Modifying: <span className="font-semibold">{selectedPartner.name}</span></p>
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
            
            <EditPartnerForm
              partner={selectedPartner}
              onSubmit={handleEditSave}
              onCancel={() => {
                setSelectedPartner(null);
                onNavigate && onNavigate('get-partners');
              }}
              isLoading={isLoading}
            />
          </div>
        );

      case 'partner-status':
        return (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">Partner Status</h3>
            <p className="text-slate-600 mb-8">This feature is coming soon. You'll be able to manage partner status and activation here.</p>
            <button 
              onClick={() => onNavigate && onNavigate('get-partners')}
              className="btn-primary flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Back to Partners</span>
            </button>
          </div>
        );

      default:
        return (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">Partners Management</h3>
            <p className="text-slate-600">Select an option from the sidebar to manage partners.</p>
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
        onClose={() => setDeleteModal({ isOpen: false, partner: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Partner"
        message={`Are you sure you want to delete "${deleteModal.partner?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

// Edit Partner Form Component
function EditPartnerForm({ partner, onSubmit, onCancel, isLoading }) {
  const [name, setName] = useState(partner?.name || '');
  const [email, setEmail] = useState(partner?.email || '');
  const [phone, setPhone] = useState(partner?.phone || '');
  const [site, setSite] = useState(partner?.site || '');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    partner?.image 
      ? (partner.image.startsWith('http') ? partner.image : `https://app.kashtat.co/${partner.image}`)
      : ''
  );

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !site.trim()) return;
    
    onSubmit({
      id: partner.id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      site: site.trim(),
      image: image
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Current Logo Preview */}
      {previewUrl && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Current Logo
          </label>
          <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            <img 
              src={previewUrl} 
              alt="Partner logo" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Partner Name */}
      <div>
        <label htmlFor="partnerName" className="block text-sm font-semibold text-slate-700 mb-3">
          Partner Name
        </label>
        <input
          id="partnerName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-modern w-full"
          placeholder="Enter partner name..."
          required
          disabled={isLoading}
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="partnerEmail" className="block text-sm font-semibold text-slate-700 mb-3">
          Email Address
        </label>
        <input
          id="partnerEmail"
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
        <label htmlFor="partnerPhone" className="block text-sm font-semibold text-slate-700 mb-3">
          Phone Number
        </label>
        <input
          id="partnerPhone"
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="input-modern w-full"
          placeholder="Enter phone number..."
          required
          disabled={isLoading}
        />
      </div>

      {/* Website */}
      <div>
        <label htmlFor="partnerSite" className="block text-sm font-semibold text-slate-700 mb-3">
          Website URL
        </label>
        <input
          id="partnerSite"
          type="text"
          value={site}
          onChange={(e) => setSite(e.target.value)}
          className="input-modern w-full"
          placeholder="https://www.example.com"
          required
          disabled={isLoading}
        />
      </div>

      {/* Logo Upload */}
      <div>
        <label htmlFor="partnerImage" className="block text-sm font-semibold text-slate-700 mb-3">
          Update Logo (Optional)
        </label>
        <input
          id="partnerImage"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="input-modern w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-500 file:text-white hover:file:bg-purple-600 file:transition-colors"
          disabled={isLoading}
        />
        <p className="text-sm text-slate-500 mt-2">
          Upload a new logo to replace the current one (JPG, PNG, GIF up to 5MB)
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
          disabled={isLoading || !name.trim() || !email.trim() || !phone.trim() || !site.trim()}
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