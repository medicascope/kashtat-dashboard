'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { CityAPI } from '../../app/lib/cityAPI';
import DataTable from '../ui/DataTable';
import CreateForm from '../ui/CreateForm';
import LoadingSkeleton, { FormSkeleton } from '../ui/LoadingSkeleton';
import { ConfirmModal } from '../ui/Modal';

const TABLE_COLUMNS = [
  {
    key: 'name',
    label: 'City Name',
    render: (value) => <span className="text-sm text-slate-800 font-semibold">{value}</span>
  },
  {
    key: 'code',
    label: 'City Code',
    render: (value) => (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
        {value}
      </span>
    )
  },
  {
    key: 'area',
    label: 'Area',
    render: (value) => (
      <span className="text-sm text-slate-600">
        {value || <span className="text-slate-400 italic">Not specified</span>}
      </span>
    )
  }
];

export default function Cities({ activeSubItem, onNavigate }) {
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  
  // Modal states
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, city: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // Prevent duplicate API calls (React StrictMode protection)
  const isLoadingRef = useRef(false);
  const abortControllerRef = useRef(null);

  const loadCities = useCallback(async () => {
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
      const result = await CityAPI.getCities();
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      if (result.success) {
        setCities(result.cities);
      } else {
        setError(result.error);
        setCities([]);
      }
    } catch (error) {
      // Check if error is due to abort
      if (error.name === 'AbortError' || abortControllerRef.current?.signal.aborted) {
        return;
      }
      setError('Failed to load cities');
      setCities([]);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCities();
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      isLoadingRef.current = false;
    };
  }, [loadCities]);

  // Form fields for city
  const FORM_FIELDS = [
    {
      name: 'name',
      label: 'City Name',
      type: 'text',
      placeholder: 'Enter city name...',
      required: true,
      help: 'Full name of the city (e.g., New York, London)'
    },
    {
      name: 'code',
      label: 'City Code',
      type: 'text',
      placeholder: 'Enter city code...',
      required: true,
      help: 'Short unique code for the city (e.g., 001_02, NYC, LON)'
    }
  ];

  const handleCreate = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await CityAPI.createCity(
        formData.name,
        formData.code
      );
      
      if (result.success) {
        // Refresh the cities list
        await loadCities();
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to create city');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (city) => {
    setSelectedCity(city);
    // Navigate to edit-city sub-item
    if (onNavigate) {
      onNavigate('edit-city');
    }
  };

  const handleEditSave = async (editData) => {
    setIsLoading(true);
    try {
      const result = await CityAPI.updateCity(
        editData.id,
        editData.name,
        editData.code
      );
      
      if (result.success) {
        await loadCities();
        setSelectedCity(null);
        setError(null);
        // Navigate back to get-cities
        if (onNavigate) {
          onNavigate('get-cities');
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to update city');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (city) => {
    setDeleteModal({ isOpen: true, city });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.city) return;
    
    setIsDeleting(true);
    try {
      const result = await CityAPI.deleteCity(deleteModal.city.id);
      
      if (result.success) {
        await loadCities();
        setDeleteModal({ isOpen: false, city: null });
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to delete city');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderContent = () => {
    switch (activeSubItem) {
      case 'get-cities':
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
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Error Loading Cities</h3>
              <p className="text-red-600 mb-8">{error}</p>
              <button 
                onClick={loadCities}
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
                <h2 className="text-2xl font-bold text-slate-800">All Cities</h2>
                <p className="text-slate-600 mt-1">{cities.length} cities found</p>
              </div>
              <button 
                onClick={loadCities}
                className="btn-ghost flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
            
            {cities.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">No Cities Found</h3>
                <p className="text-slate-600 mb-8">Start by creating your first city to manage locations.</p>
                <button 
                  onClick={() => onNavigate && onNavigate('add-city')}
                  className="btn-primary flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Create First City</span>
                </button>
              </div>
            ) : (
              <DataTable
                data={cities}
                columns={TABLE_COLUMNS}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                searchable={true}
                actionable={true}
              />
            )}
          </div>
        );

      case 'add-city':
        if (isSubmitting) {
          return <FormSkeleton />;
        }

        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Add New City</h2>
              <p className="text-slate-600">Create a new city within a country to expand your location management.</p>
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
              title="City"
              fields={FORM_FIELDS}
              onSubmit={handleCreate}
              onCancel={() => setError(null)}
              isLoading={isSubmitting}
            />
          </div>
        );

      case 'edit-city':
        if (!selectedCity) {
          return (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Select a City to Edit</h3>
              <p className="text-slate-600 mb-8">Go to the cities list and click the edit button on any city to modify it.</p>
              <button 
                onClick={() => onNavigate && onNavigate('get-cities')}
                className="btn-primary flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>View Cities</span>
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
                  setSelectedCity(null);
                  onNavigate && onNavigate('get-cities');
                }}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200 mr-4"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Edit City</h2>
                <p className="text-slate-600 mt-1">Modifying: <span className="font-semibold">{selectedCity.name}</span></p>
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
            
            <EditCityForm
              city={selectedCity}
              onSubmit={handleEditSave}
              onCancel={() => {
                setSelectedCity(null);
                onNavigate && onNavigate('get-cities');
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">Cities Management</h3>
            <p className="text-slate-600">Select an option from the sidebar to manage cities.</p>
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
        onClose={() => setDeleteModal({ isOpen: false, city: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete City"
        message={`Are you sure you want to delete "${deleteModal.city?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

// Edit City Form Component
function EditCityForm({ city, onSubmit, onCancel, isLoading }) {
  const [name, setName] = useState(city?.name || '');
  const [code, setCode] = useState(city?.code || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    
    onSubmit({
      id: city.id,
      name: name.trim(),
      code: code.trim()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* City Info */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-slate-700 mb-2">Current Location</h4>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            {city?.country?.code}
          </span>
          <span className="text-sm text-slate-600">{city?.country?.name}</span>
        </div>
      </div>

      {/* City Name */}
      <div>
        <label htmlFor="cityName" className="block text-sm font-semibold text-slate-700 mb-3">
          City Name
        </label>
        <input
          id="cityName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-modern w-full"
          placeholder="Enter city name..."
          required
          disabled={isLoading}
        />
      </div>

      {/* City Code */}
      <div>
        <label htmlFor="cityCode" className="block text-sm font-semibold text-slate-700 mb-3">
          City Code
        </label>
        <input
          id="cityCode"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="input-modern w-full"
          placeholder="Enter city code..."
          required
          disabled={isLoading}
        />
        <p className="text-sm text-slate-500 mt-2">
          Short unique code for the city (e.g., 001_02, NYC, LON)
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