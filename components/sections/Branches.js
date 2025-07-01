'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import DataTable from '../ui/DataTable';
import CreateForm from '../ui/CreateForm';
import Modal from '../ui/Modal';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import { BranchAPI } from '../../app/lib/branchAPI';
import { PartnerAPI } from '../../app/lib/partnerAPI';
import { CityAPI } from '../../app/lib/cityAPI';

export default function Branches({ activeSubItem, onNavigate }) {
  const [branches, setBranches] = useState([]);
  const [partners, setPartners] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBranch, setEditingBranch] = useState(null);
  const [deletingBranch, setDeletingBranch] = useState(null);

  // Simple refs
  const mountedRef = useRef(true);
  const loadingRef = useRef(false);

  // Memoize form fields ONCE
  const formFields = useMemo(() => [
    {
      name: 'name',
      label: 'Branch Name',
      type: 'text',
      required: true,
      placeholder: 'Enter branch name'
    },
    {
      name: 'partner_id',
      label: 'Partner',
      type: 'select',
      required: true,
      options: partners.map(partner => ({
        value: partner?.id,
        label: partner?.name || 'Unknown Partner'
      }))
    },
    {
      name: 'city_id',
      label: 'City',
      type: 'select',
      required: true,
      options: cities.map(city => ({
        value: city?.id,
        label: `${city?.name || city?.code || 'Unknown'} (${city?.country?.name || 'N/A'})`
      }))
    },
    {
      name: 'lat',
      label: 'Latitude',
      type: 'number',
      required: true,
      placeholder: 'Enter latitude (e.g., 30.0444)',
      step: 'any'
    },
    {
      name: 'lng',
      label: 'Longitude',
      type: 'number',
      required: true,
      placeholder: 'Enter longitude (e.g., 31.2357)',
      step: 'any'
    }
  ], [partners, cities]);

  const tableColumns = useMemo(() => [
    {
      key: 'name',
      label: 'Branch Name',
      render: (value, branch) => (
        <div className="font-medium text-gray-900">
          {branch?.name || 'N/A'}
        </div>
      )
    },
    {
      key: 'partner',
      label: 'Partner',
      render: (value, branch) => {
        const partner = branch?.partner;
        if (!partner) return <span className="text-gray-500">No Partner</span>;
        
        return (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 h-10 w-10">
              {partner.image ? (
                <img
                  className="h-10 w-10 rounded-lg object-cover"
                  src={partner.image}
                  alt={partner?.name || 'Partner'}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className={`h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium text-sm ${
                  partner.image ? 'hidden' : 'flex'
                }`}
              >
                {partner?.name ? partner.name.substring(0, 2).toUpperCase() : '??'}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {partner?.name || 'Unknown Partner'}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {partner?.email || 'N/A'}
              </p>
            </div>
          </div>
        );
      }
    },
    {
      key: 'city',
      label: 'City',
      render: (value, branch) => {
        const city = branch?.city;
        if (!city) return <span className="text-gray-500">No City</span>;
        
        return (
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {city?.name || city?.code || 'Unknown City'}
            </span>
            {city?.country && (
              <div className="text-xs text-gray-500 mt-1">
                {city.country?.name || 'Unknown Country'}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'location',
      label: 'Location',
      render: (value, branch) => (
        <div className="text-sm text-gray-900">
          <div>Lat: {parseFloat(branch?.lat || 0).toFixed(6)}</div>
          <div>Lng: {parseFloat(branch?.lng || 0).toFixed(6)}</div>
        </div>
      )
    }
  ], []);

  // Simple fetch function without useCallback
  const fetchData = async () => {
    if (loadingRef.current || !mountedRef.current) return;
    
    loadingRef.current = true;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all data in parallel
      const [branchesResponse, partnersResponse, citiesResponse] = await Promise.all([
        BranchAPI.getBranches(),
        PartnerAPI.getPartners(),
        CityAPI.getCities()
      ]);
      
      if (!mountedRef.current) return;
      
      // Handle BranchAPI response format
      if (branchesResponse.success) {
        setBranches(branchesResponse.branches);
      } else {
        throw new Error(branchesResponse.error || 'Failed to fetch branches');
      }
      
      // Handle PartnerAPI response format
      if (partnersResponse.success) {
        setPartners(partnersResponse.partners);
      } else {
        throw new Error(partnersResponse.error || 'Failed to fetch partners');
      }
      
      // Handle CityAPI response format
      if (citiesResponse.success) {
        setCities(citiesResponse.cities);
      } else {
        throw new Error(citiesResponse.error || 'Failed to fetch cities');
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message);
      }
    } finally {
      loadingRef.current = false;
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
    
    return () => {
      mountedRef.current = false;
    };
  }, []); // EMPTY dependencies

  const handleCreate = async (data) => {
    try {
      const response = await BranchAPI.createBranch(
        data.name, 
        data.partner_id, 
        data.city_id, 
        data.lat, 
        data.lng
      );
      
      if (response.success) {
        await fetchData(); // Refresh the list
        onNavigate('get-branches'); // Navigate back to list
      } else {
        throw new Error(response.error || 'Failed to create branch');
      }
    } catch (err) {
      throw new Error(`Failed to create branch: ${err.message}`);
    }
  };

  const handleEdit = async (data) => {
    try {
      const response = await BranchAPI.updateBranch(
        editingBranch.id, 
        data.name, 
        data.partner_id,
        data.city_id,
        data.lat, 
        data.lng
      );
      
      if (response.success) {
        await fetchData(); // Refresh the list
        setEditingBranch(null);
        onNavigate('get-branches'); // Navigate back to list
      } else {
        throw new Error(response.error || 'Failed to update branch');
      }
    } catch (err) {
      throw new Error(`Failed to update branch: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await BranchAPI.deleteBranch(deletingBranch.id);
      
      if (response.success) {
        await fetchData(); // Refresh the list
        setDeletingBranch(null);
      } else {
        throw new Error(response.error || 'Failed to delete branch');
      }
    } catch (err) {
      setError(`Failed to delete branch: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="opacity-50">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">
          <strong>Error:</strong> {error}
        </div>
        <button
          onClick={fetchData}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  // Render different views based on activeSubItem
  const renderContent = () => {
    switch (activeSubItem) {
      case 'add-branch':
        return (
          <div className="card-premium">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Add New Branch</h3>
              <CreateForm
                fields={formFields}
                onSubmit={handleCreate}
                onCancel={() => onNavigate('get-branches')}
                submitText="Create Branch"
              />
            </div>
          </div>
        );

      case 'edit-branch':
        return (
          <div className="card-premium">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Edit Branch</h3>
              {editingBranch ? (
                <div>
                  <div className="mb-4 p-3 bg-gray-100 rounded-md text-sm">
                    <strong>Editing:</strong> {editingBranch.name || 'Unnamed Branch'}
                  </div>
                  <CreateForm
                    fields={formFields}
                    initialData={{
                      name: editingBranch?.name || '',
                      partner_id: editingBranch?.partner?.id || '',
                      city_id: editingBranch?.city?.id || '',
                      lat: editingBranch?.lat || '',
                      lng: editingBranch?.lng || ''
                    }}
                    onSubmit={handleEdit}
                    onCancel={() => {
                      setEditingBranch(null);
                      onNavigate('get-branches');
                    }}
                    submitText="Update Branch"
                  />
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No branch selected for editing.</p>
                  <button
                    onClick={() => onNavigate('get-branches')}
                    className="mt-4 btn-primary"
                  >
                    Back to Branches
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'branch-status':
        return (
          <div className="card-premium">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Branch Status</h3>
              <div className="text-gray-500">
                <p>Advanced branch status features coming soon...</p>
              </div>
            </div>
          </div>
        );

      case 'get-branches':
      default:
        return (
          <div className="space-y-6">
            {/* Branches Table */}
            <DataTable
              title="Branches"
              data={branches}
              columns={tableColumns}
              onAdd={() => onNavigate('add-branch')}
              onEdit={(branch) => {
                setEditingBranch(branch);
                onNavigate('edit-branch');
              }}
              onDelete={(branch) => setDeletingBranch(branch)}
              searchPlaceholder="Search branches..."
              searchFields={['name']}
              addButtonText="Add Branch"
            />

            {/* Delete Confirmation Modal */}
            {deletingBranch && (
              <Modal
                isOpen={!!deletingBranch}
                onClose={() => setDeletingBranch(null)}
                title="Delete Branch"
              >
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Branch
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete the branch "{deletingBranch?.name || 'Unknown Branch'}"? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={() => setDeletingBranch(null)}
                  >
                    Cancel
                  </button>
                </div>
              </Modal>
            )}
          </div>
        );
    }
  };

  return renderContent();
} 