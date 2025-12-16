'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Flame, Star, Package, MapPin, Clock, Users, TrendingUp } from 'lucide-react';
import DataTable from '../ui/DataTable';
import Modal from '../ui/Modal';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import { PackageAPI } from '../../app/lib/packageAPI';
import { CategoryAPI } from '../../app/lib/categoryAPI';
import PackageFormNew from '../ui/PackageFormNew';

export default function Packages({ activeSubItem, onNavigate }) {
  const [packages, setPackages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPackage, setEditingPackage] = useState(null);
  const [deletingPackage, setDeletingPackage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Prevent duplicate API calls
  const isLoadingRef = useRef(false);
  const abortControllerRef = useRef(null);

  const tableColumns = useMemo(() => [
    {
      key: 'package',
      label: 'Package Details',
      render: (value, pkg) => (
        <div className="flex items-start space-x-3 max-w-md">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200">
              {pkg.image ? (
                <img 
                  src={pkg.image} 
                  alt={pkg.title || 'Package'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                  <Package className="w-6 h-6 text-slate-400" />
                </div>
              )}
            </div>
            {pkg.availability_available === 1 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-900 text-sm mb-1 line-clamp-1">{pkg.title}</div>
            <div className="flex items-center text-xs text-slate-500 mb-1.5">
              <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">{pkg.location}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {pkg.is_popular === 1 && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-50 text-orange-600">
                  <Flame className="w-3 h-3" />
                </span>
              )}
              {pkg.is_recommended === 1 && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600">
                  <TrendingUp className="w-3 h-3" />
                </span>
              )}
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                {pkg.category_name || pkg.category}
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'pricing',
      label: 'Price & Duration',
      render: (value, pkg) => (
        <div className="space-y-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-slate-900">{pkg.price}</span>
              <span className="text-xs text-slate-500">{pkg.currency}</span>
            </div>
            {pkg.original_price && pkg.discount > 0 && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-slate-400 line-through">{pkg.original_price}</span>
                <span className="text-xs font-semibold text-green-600">-{pkg.discount}%</span>
              </div>
            )}
          </div>
          <div className="flex items-center text-xs text-slate-600">
            <Clock className="w-3.5 h-3.5 mr-1" />
            <span>{pkg.duration}</span>
          </div>
        </div>
      )
    },
    {
      key: 'performance',
      label: 'Rating & Reviews',
      render: (value, pkg) => (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-semibold text-slate-900">{pkg.rating}</span>
          </div>
          <div className="flex items-center text-xs text-slate-600">
            <Users className="w-3.5 h-3.5 mr-1" />
            <span>{pkg.review_count} reviews</span>
          </div>
        </div>
      )
    }
  ], []);

  const fetchData = async () => {
    if (isLoadingRef.current) return;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    isLoadingRef.current = true;
    
    try {
      setLoading(true);
      setError(null);
      
      const [packagesResponse, categoriesResponse] = await Promise.all([
        PackageAPI.getPackages(),
        CategoryAPI.getCategories()
      ]);
      
      if (abortControllerRef.current?.signal.aborted) return;
      
      if (packagesResponse.success) {
        setPackages(packagesResponse.packages);
      } else {
        throw new Error(packagesResponse.error || 'Failed to fetch packages');
      }
      
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.categories);
      }
      
    } catch (err) {
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
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      isLoadingRef.current = false;
    };
  }, []);

  const handleCreate = async (data) => {
    try {
      setError(null);
      setSubmitting(true);
      const response = await PackageAPI.createPackage(data);
      
      if (response.success) {
        await fetchData();
        onNavigate('get-packages');
      } else {
        throw new Error(response.error || 'Failed to create package');
      }
    } catch (err) {
      setError(`Failed to create package: ${err.message}`);
      console.error('Create package error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (data) => {
    try {
      setError(null);
      setSubmitting(true);
      const response = await PackageAPI.updatePackage(editingPackage.id, data);
      
      if (response.success) {
        await fetchData();
        setEditingPackage(null);
        onNavigate('get-packages');
      } else {
        throw new Error(response.error || 'Failed to update package');
      }
    } catch (err) {
      setError(`Failed to update package: ${err.message}`);
      console.error('Update package error:', err);
    } finally {
      setSubmitting(false);
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
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="text-red-800">
          <strong>Error:</strong> {error}
        </div>
        <button
          onClick={() => {
            setError(null);
            fetchData();
          }}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
          <div className="card-elevated">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Create New Package</h3>
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-red-800">
                    <strong>Error:</strong> {error}
                  </div>
                </div>
              )}
              <PackageFormNew
                categories={categories}
                onSubmit={handleCreate}
                onCancel={() => onNavigate('get-packages')}
                submitText="Create Package"
                isLoading={submitting}
              />
            </div>
          </div>
        );

      case 'edit-package':
        return (
          <div className="card-elevated">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Edit Package</h3>
              {editingPackage ? (
                <div>
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                      <Package className="w-5 h-5 text-blue-600 mr-2" />
                      <strong className="text-blue-900">Editing:</strong>
                      <span className="ml-2 text-blue-800">{editingPackage.title || 'Unnamed Package'}</span>
                    </div>
                  </div>
                  {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="text-red-800">
                        <strong>Error:</strong> {error}
                      </div>
                    </div>
                  )}
                  <PackageFormNew
                    categories={categories}
                    initialData={editingPackage}
                    onSubmit={handleEdit}
                    onCancel={() => {
                      setEditingPackage(null);
                      onNavigate('get-packages');
                    }}
                    submitText="Update Package"
                    isLoading={submitting}
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">No package selected for editing.</p>
                  <button
                    onClick={() => onNavigate('get-packages')}
                    className="btn-primary"
                  >
                    Back to Packages
                  </button>
                </div>
              )}
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
              searchFields={['title', 'location']}
              addButtonText="Create Package"
              exportable={true}
            />

            {deletingPackage && (
              <Modal
                isOpen={!!deletingPackage}
                onClose={() => setDeletingPackage(null)}
                title="Delete Package"
              >
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Package className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Package
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete "{deletingPackage?.title || 'Unknown Package'}"? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
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

