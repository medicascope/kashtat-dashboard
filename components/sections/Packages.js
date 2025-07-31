'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import DataTable from '../ui/DataTable';
import PackageForm from '../ui/PackageForm';
import Modal from '../ui/Modal';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import { PackageAPI } from '../../app/lib/packageAPI';
import { PartnerAPI } from '../../app/lib/partnerAPI';
import { CategoryAPI } from '../../app/lib/categoryAPI';
import { BranchAPI } from '../../app/lib/branchAPI';

export default function Packages({ activeSubItem, onNavigate }) {
  const [packages, setPackages] = useState([]);
  const [partners, setPartners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [entertainments, setEntertainments] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPackage, setEditingPackage] = useState(null);
  const [deletingPackage, setDeletingPackage] = useState(null);

  // Prevent duplicate API calls (React StrictMode protection)
  const isLoadingRef = useRef(false);
  const abortControllerRef = useRef(null);

  const tableColumns = useMemo(() => [
    {
      key: 'name',
      label: 'Package Name',
      render: (value, pkg) => (
        <div className="font-medium text-gray-900">
          {pkg?.name || 'N/A'}
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (value, pkg) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          pkg?.type === 'package' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-purple-100 text-purple-800'
        }`}>
          {pkg?.type || 'N/A'}
        </span>
      )
    },
    {
      key: 'partner',
      label: 'Partner',
      render: (value, pkg) => {
        const partner = pkg?.partner;
        if (!partner) return <span className="text-gray-500">No Partner</span>;
        
        return (
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0 h-8 w-8">
              {partner.image ? (
                <img
                  className="h-8 w-8 rounded-lg object-cover"
                  src={partner.image}
                  alt={partner?.name || 'Partner'}
                />
              ) : (
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium text-xs">
                  {partner?.name ? partner.name.substring(0, 2).toUpperCase() : '??'}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 truncate">
                {partner?.name || 'Unknown Partner'}
              </p>
            </div>
          </div>
        );
      }
    },
    {
      key: 'category',
      label: 'Category',
      render: (value, pkg) => {
        const category = pkg?.category;
        if (!category) return <span className="text-gray-500">No Category</span>;
        
        return (
          <div className="flex items-center">
            {category.image && (
              <img
                className="h-6 w-6 rounded mr-2"
                src={category.image}
                alt={category.name}
              />
            )}
            <span className="text-sm text-gray-900">{category.name}</span>
          </div>
        );
      }
    },
    {
      key: 'price',
      label: 'Price Range',
      render: (value, pkg) => {
        const prices = pkg?.prices || [];
        if (prices.length === 0) return <span className="text-gray-500">No pricing</span>;
        
        const minPrice = Math.min(...prices.map(p => parseFloat(p.price)));
        const maxPrice = Math.max(...prices.map(p => parseFloat(p.price)));
        
        return (
          <div className="text-sm text-gray-900">
            {minPrice === maxPrice 
              ? `$${minPrice.toFixed(2)}`
              : `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`
            }
          </div>
        );
      }
    },
    {
      key: 'due_date',
      label: 'Due Date',
      render: (value, pkg) => (
        <div className="text-sm text-gray-900">
          {pkg?.due_date ? new Date(pkg.due_date).toLocaleDateString() : 'N/A'}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, pkg) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          pkg?.status === '1' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {pkg?.status === '1' ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ], []);
  const fetchData = async () => {
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
    
    try {
      setLoading(true);
      setError(null);
      
      const [
        packagesResponse, 
        partnersResponse, 
        categoriesResponse,
        branchesResponse,
        speakersResponse,
        entertainmentsResponse,
        rulesResponse
      ] = await Promise.all([
        PackageAPI.getPackages(),
        PartnerAPI.getPartners(),
        CategoryAPI.getCategories(),
        BranchAPI.getBranches(),
        PackageAPI.getPackageSpeakers(),
        PackageAPI.getPackageEntertainments(),
        PackageAPI.getPackageRules()
      ]);
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      if (packagesResponse.success) {
        setPackages(packagesResponse.packages);
      } else {
        throw new Error(packagesResponse.error || 'Failed to fetch packages');
      }
      
      if (partnersResponse.success) {
        setPartners(partnersResponse.partners);
      }
      
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.categories);
      }

      if (branchesResponse.success) {
        setBranches(branchesResponse.branches);
      }

      if (speakersResponse.success) {
        setSpeakers(speakersResponse.speakers);
      }

      if (entertainmentsResponse.success) {
        setEntertainments(entertainmentsResponse.entertainments);
      }

      if (rulesResponse.success) {
        setRules(rulesResponse.rules);
      }
      
    } catch (err) {
      // Check if error is due to abort
      if (err.name === 'AbortError' || abortControllerRef.current?.signal.aborted) {
        return;
      }
      setError(err.message);
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      isLoadingRef.current = false;
    };
  }, []);

  const handleCreate = async (data) => {
    try {
      const response = await PackageAPI.createPackage(data);
      
      if (response.success) {
        await fetchData();
        onNavigate('get-packages');
      } else {
        throw new Error(response.error || 'Failed to create package');
      }
    } catch (err) {
      // throw new Error(`Failed to create package: ${err.message}`);
    }
  };

  const handleEdit = async (data) => {
    try {
      const response = await PackageAPI.updatePackage(editingPackage.id, data);
      
      if (response.success) {
        await fetchData();
        setEditingPackage(null);
        onNavigate('get-packages');
      } else {
        throw new Error(response.error || 'Failed to update package');
      }
    } catch (err) {
      // throw new Error(`Failed to update package: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await PackageAPI.deletePackage(deletingPackage.id);
      
      if (response.success) {
        await fetchData();
        setDeletingPackage(null);
      } else {
        throw new Error(response.error || 'Failed to delete package');
      }
    } catch (err) {
      setError(`Failed to delete package: ${err.message}`);
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

  const renderContent = () => {
    switch (activeSubItem) {
      case 'create-package':
        return (
          <div className="card-premium">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Create New Package</h3>
              <PackageForm
                categories={categories}
                partners={partners}
                branches={branches}
                speakers={speakers}
                entertainments={entertainments}
                rules={rules}
                onSubmit={handleCreate}
                onCancel={() => onNavigate('get-packages')}
                submitText="Create Package"
              />
            </div>
          </div>
        );

      case 'edit-package':
        return (
          <div className="card-premium">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Edit Package</h3>
              {editingPackage ? (
                <div>
                  <div className="mb-4 p-3 bg-gray-100 rounded-md text-sm">
                    <strong>Editing:</strong> {editingPackage.name || 'Unnamed Package'}
                  </div>
                  <PackageForm
                    categories={categories}
                    partners={partners}
                    branches={branches}
                    speakers={speakers}
                    entertainments={entertainments}
                    rules={rules}
                    initialData={{
                      name: editingPackage?.name || '',
                      overview: editingPackage?.overview || '',
                      type: editingPackage?.type || 'package',
                      partner_id: editingPackage?.partner?.id || '',
                      category_id: editingPackage?.category?.id || '',
                      working_days: editingPackage?.working_days || 'sunday,monday,tuesday,wednesday,thursday',
                      discount_percentage: editingPackage?.discount_percentage || '0',
                      due_date: editingPackage?.due_date || '',
                      order_id: editingPackage?.order_id || '0',
                      full_refund_within: editingPackage?.full_refund_within || '30',
                      partial_refund_within: editingPackage?.partial_refund_within || '15',
                      partial_refund_percentage: editingPackage?.partial_refund_percentage || '10',
                      status: editingPackage?.status || '1',
                      speaker_ids: editingPackage?.speakers?.map(s => s.id) || [],
                      entertainment_ids: editingPackage?.entertainments?.map(e => e.id) || [],
                      rule_ids: editingPackage?.rules?.map(r => r.id) || [],
                      branch_ids: editingPackage?.branches?.map(b => b.id) || [],
                      prices: editingPackage?.prices || [{ price: '100', user_type: 'citizen', age_group: 'adult' }]
                    }}
                    onSubmit={handleEdit}
                    onCancel={() => {
                      setEditingPackage(null);
                      onNavigate('get-packages');
                    }}
                    submitText="Update Package"
                  />
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No package selected for editing.</p>
                  <button
                    onClick={() => onNavigate('get-packages')}
                    className="mt-4 btn-primary"
                  >
                    Back to Packages
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'package-pricing':
        return (
          <div className="card-premium">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Package Pricing</h3>
              <div className="text-gray-500">
                <p>Package pricing management coming soon...</p>
              </div>
            </div>
          </div>
        );

      case 'get-packages':
      default:
        return (
          <div className="space-y-6">
            <DataTable
              title="Packages"
              data={packages}
              columns={tableColumns}
              onAdd={() => onNavigate('create-package')}
              onEdit={(pkg) => {
                setEditingPackage(pkg);
                onNavigate('edit-package');
              }}
              onDelete={(pkg) => setDeletingPackage(pkg)}
              searchPlaceholder="Search packages..."
              searchFields={['name']}
              addButtonText="Create Package"
            />

            {deletingPackage && (
              <Modal
                isOpen={!!deletingPackage}
                onClose={() => setDeletingPackage(null)}
                title="Delete Package"
              >
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Package
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete the package "{deletingPackage?.name || 'Unknown Package'}"? This action cannot be undone.
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
                    onClick={() => setDeletingPackage(null)}
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