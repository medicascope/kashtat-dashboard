'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { CountryAPI } from '../../app/lib/countryAPI';
import DataTable from '../ui/DataTable';
import CreateForm from '../ui/CreateForm';
import LoadingSkeleton, { FormSkeleton } from '../ui/LoadingSkeleton';
import { ConfirmModal } from '../ui/Modal';

const FORM_FIELDS = [
  {
    name: 'name',
    label: 'Country Name',
    type: 'text',
    placeholder: 'Enter country name...',
    required: true
  },
  {
    name: 'code',
    label: 'Country Code',
    type: 'text',
    placeholder: 'Enter country code (e.g., AE, US)...',
    required: true,
    help: 'Use standard country codes (ISO 3166-1 alpha-2)'
  }
];

const TABLE_COLUMNS = [
  {
    key: 'id',
    label: 'ID',
    render: (value) => <span className="text-sm text-slate-500 font-mono">#{value.substring(0, 8)}...</span>
  },
  {
    key: 'name',
    label: 'Name',
    render: (value) => <span className="text-sm text-slate-800 font-semibold">{value}</span>
  },
  {
    key: 'code',
    label: 'Code',
    render: (value) => (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
        {value}
      </span>
    )
  }
];

export default function Countries({ activeSubItem, onNavigate }) {
  const [countries, setCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  
  // Modal states
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, country: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // Prevent duplicate API calls (React StrictMode protection)
  const isLoadingRef = useRef(false);
  const abortControllerRef = useRef(null);

  // Load countries when component mounts
  const loadCountries = useCallback(async () => {
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
      const result = await CountryAPI.getCountries();
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      if (result.success) {
        setCountries(result.countries);
      } else {
        setError(result.error);
        setCountries([]);
      }
    } catch (error) {
      // Check if error is due to abort
      if (error.name === 'AbortError' || abortControllerRef.current?.signal.aborted) {
        return;
      }
      setError('Failed to load countries');
      setCountries([]);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCountries();
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      isLoadingRef.current = false;
    };
  }, [loadCountries]);

  const handleCreate = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await CountryAPI.createCountry(
        formData.name,
        formData.code
      );
      
      if (result.success) {
        // Refresh the countries list
        await loadCountries();
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to create country');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (country) => {
    setSelectedCountry(country);
    // Navigate to edit-country sub-item
    if (onNavigate) {
      onNavigate('edit-country');
    }
  };

  const handleEditSave = async (editData) => {
    setIsLoading(true);
    try {
      const result = await CountryAPI.updateCountry(
        editData.id, 
        editData.name, 
        editData.code
      );
      
      if (result.success) {
        await loadCountries();
        setSelectedCountry(null);
        setError(null);
        // Navigate back to get-countries
        if (onNavigate) {
          onNavigate('get-countries');
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to update country');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (country) => {
    setDeleteModal({ isOpen: true, country });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.country) return;
    
    setIsDeleting(true);
    try {
      const result = await CountryAPI.deleteCountry(deleteModal.country.id);
      
      if (result.success) {
        await loadCountries();
        setDeleteModal({ isOpen: false, country: null });
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to delete country');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderContent = () => {
    switch (activeSubItem) {
      case 'get-countries':
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
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Error Loading Countries</h3>
              <p className="text-red-600 mb-8">{error}</p>
              <button 
                onClick={loadCountries}
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
                <h2 className="text-2xl font-bold text-slate-800">All Countries</h2>
                <p className="text-slate-600 mt-1">{countries.length} countries found</p>
              </div>
              <button 
                onClick={loadCountries}
                className="btn-ghost flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
            
            {countries.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">No Countries Found</h3>
                <p className="text-slate-600 mb-8">Start by creating your first country to manage locations.</p>
                <button 
                  onClick={() => onNavigate && onNavigate('add-country')}
                  className="btn-primary flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Create First Country</span>
                </button>
              </div>
            ) : (
              <DataTable
                data={countries}
                columns={TABLE_COLUMNS}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                searchable={true}
                actionable={true}
              />
            )}
          </div>
        );

      case 'add-country':
        if (isSubmitting) {
          return <FormSkeleton />;
        }

        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Add New Country</h2>
              <p className="text-slate-600">Create a new country to expand your location management system.</p>
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
              title="Country"
              fields={FORM_FIELDS}
              onSubmit={handleCreate}
              onCancel={() => setError(null)}
              isLoading={isSubmitting}
            />
          </div>
        );

      case 'edit-country':
        if (!selectedCountry) {
          return (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Select a Country to Edit</h3>
              <p className="text-slate-600 mb-8">Go to the countries list and click the edit button on any country to modify it.</p>
              <button 
                onClick={() => onNavigate && onNavigate('get-countries')}
                className="btn-primary flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>View Countries</span>
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
                  setSelectedCountry(null);
                  onNavigate && onNavigate('get-countries');
                }}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200 mr-4"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Edit Country</h2>
                <p className="text-slate-600 mt-1">Modifying: <span className="font-semibold">{selectedCountry.name}</span></p>
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
            
            <EditCountryForm
              country={selectedCountry}
              onSubmit={handleEditSave}
              onCancel={() => {
                setSelectedCountry(null);
                onNavigate && onNavigate('get-countries');
              }}
              isLoading={isLoading}
            />
          </div>
        );

      default:
        return (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">Countries Management</h3>
            <p className="text-slate-600">Select an option from the sidebar to manage countries.</p>
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
        onClose={() => setDeleteModal({ isOpen: false, country: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Country"
        message={`Are you sure you want to delete "${deleteModal.country?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

// Edit Country Form Component
function EditCountryForm({ country, onSubmit, onCancel, isLoading }) {
  const [name, setName] = useState(country?.name || '');
  const [code, setCode] = useState(country?.code || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    
    onSubmit({
      id: country.id,
      name: name.trim(),
      code: code.trim().toUpperCase()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Country Name */}
      <div>
        <label htmlFor="countryName" className="block text-sm font-semibold text-slate-700 mb-3">
          Country Name
        </label>
        <input
          id="countryName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-modern w-full"
          placeholder="Enter country name..."
          required
          disabled={isLoading}
        />
      </div>

      {/* Country Code */}
      <div>
        <label htmlFor="countryCode" className="block text-sm font-semibold text-slate-700 mb-3">
          Country Code
        </label>
        <input
          id="countryCode"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="input-modern w-full"
          placeholder="Enter country code (e.g., AE, US)..."
          required
          disabled={isLoading}
          maxLength={3}
        />
        <p className="text-sm text-slate-500 mt-2">
          Use standard country codes (ISO 3166-1 alpha-2)
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
          disabled={isLoading || !name.trim() || !code.trim()}
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