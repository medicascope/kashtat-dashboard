'use client';

import { useState, useEffect } from 'react';
import { CategoryAPI } from '../../app/lib/categoryAPI';
import DataTable from '../ui/DataTable';
import CreateForm from '../ui/CreateForm';
import LoadingSkeleton, { FormSkeleton } from '../ui/LoadingSkeleton';
import { ConfirmModal } from '../ui/Modal';

const FORM_FIELDS = [
  {
    name: 'name',
    label: 'Category Name',
    type: 'text',
    placeholder: 'Enter category name...',
    required: true
  },
  {
    name: 'image',
    label: 'Category Image',
    type: 'file',
    accept: 'image/*',
    help: 'Upload an image for this category'
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
    key: 'image',
    label: 'Image',
    render: (value) => (
      value ? (
        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-slate-200">
          <img 
            src={value.startsWith('http') ? value : `https://app.kashtat.co/${value}`} 
            alt="Category" 
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )
    )
  }
];

export default function Categories({ activeSubItem, onNavigate }) {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Modal states
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, category: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // Load categories when component mounts
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await CategoryAPI.getCategories();
      
      if (result.success) {
        setCategories(result.categories);
      } else {
        setError(result.error);
        setCategories([]);
      }
    } catch (error) {
      setError('Failed to load categories');
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await CategoryAPI.createCategory(
        formData.name,
        formData.image
      );
      
      if (result.success) {
        // Refresh the categories list
        await loadCategories();
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (category) => {
    setSelectedCategory(category);
    // Navigate to edit-category sub-item
    if (onNavigate) {
      onNavigate('edit-category');
    }
  };

  const handleEditSave = async (editData) => {
    setIsLoading(true);
    try {
      const result = await CategoryAPI.updateCategory(
        editData.id, 
        editData.name, 
        editData.image
      );
      
      if (result.success) {
        await loadCategories();
        setSelectedCategory(null);
        setError(null);
        // Navigate back to get-categories
        if (onNavigate) {
          onNavigate('get-categories');
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to update category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (category) => {
    setDeleteModal({ isOpen: true, category });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.category) return;
    
    setIsDeleting(true);
    try {
      const result = await CategoryAPI.deleteCategory(deleteModal.category.id);
      
      if (result.success) {
        await loadCategories();
        setDeleteModal({ isOpen: false, category: null });
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderContent = () => {
    switch (activeSubItem) {
      case 'get-categories':
        if (isLoading) {
          return <LoadingSkeleton rows={5} />;
        }

        if (error) {
          return (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Error Loading Categories</h3>
              <p className="text-red-600 mb-8">{error}</p>
              <button 
                onClick={loadCategories}
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
                <h2 className="text-2xl font-bold text-slate-800">All Categories</h2>
                <p className="text-slate-600 mt-1">{categories.length} categories found</p>
              </div>
              <button 
                onClick={loadCategories}
                className="btn-ghost flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
            
            {categories.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14-7v8a2 2 0 01-2 2m-2 0h-5a2 2 0 01-2-2v-8m0 0V3a2 2 0 012-2h5a2 2 0 012 2v2M7 21l8-8H8l-1 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">No Categories Found</h3>
                <p className="text-slate-600 mb-8">Start by creating your first category to organize your content.</p>
                <button 
                  onClick={() => onNavigate && onNavigate('add-category')}
                  className="btn-primary flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Create First Category</span>
                </button>
              </div>
            ) : (
              <DataTable
                data={categories}
                columns={TABLE_COLUMNS}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                searchable={true}
                actionable={true}
              />
            )}
          </div>
        );

      case 'add-category':
        if (isSubmitting) {
          return <FormSkeleton />;
        }

        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Add New Category</h2>
              <p className="text-slate-600">Create a new category to organize your content and improve navigation.</p>
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
              title="Category"
              fields={FORM_FIELDS}
              onSubmit={handleCreate}
              onCancel={() => setError(null)}
              isLoading={isSubmitting}
            />
          </div>
        );

      case 'edit-category':
        if (!selectedCategory) {
          return (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Select a Category to Edit</h3>
              <p className="text-slate-600 mb-8">Go to the categories list and click the edit button on any category to modify it.</p>
              <button 
                onClick={() => onNavigate && onNavigate('get-categories')}
                className="btn-primary flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14-7v8a2 2 0 01-2 2m-2 0h-5a2 2 0 01-2-2v-8m0 0V3a2 2 0 012-2h5a2 2 0 012 2v2M7 21l8-8H8l-1 8z" />
                </svg>
                <span>View Categories</span>
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
                  setSelectedCategory(null);
                  onNavigate && onNavigate('get-categories');
                }}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200 mr-4"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Edit Category</h2>
                <p className="text-slate-600 mt-1">Modifying: <span className="font-semibold">{selectedCategory.name}</span></p>
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
            
            <EditCategoryForm
              category={selectedCategory}
              onSubmit={handleEditSave}
              onCancel={() => {
                setSelectedCategory(null);
                onNavigate && onNavigate('get-categories');
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14-7v8a2 2 0 01-2 2m-2 0h-5a2 2 0 01-2-2v-8m0 0V3a2 2 0 012-2h5a2 2 0 012 2v2M7 21l8-8H8l-1 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">Categories Management</h3>
            <p className="text-slate-600">Select an option from the sidebar to manage categories.</p>
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
        onClose={() => setDeleteModal({ isOpen: false, category: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteModal.category?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

// Edit Category Form Component
function EditCategoryForm({ category, onSubmit, onCancel, isLoading }) {
  const [name, setName] = useState(category?.name || '');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    category?.image 
      ? (category.image.startsWith('http') ? category.image : `https://app.kashtat.co/${category.image}`)
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
    if (!name.trim()) return;
    
    onSubmit({
      id: category.id,
      name: name.trim(),
      image: image
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Category Name */}
      <div>
        <label htmlFor="categoryName" className="block text-sm font-semibold text-slate-700 mb-3">
          Category Name
        </label>
        <input
          id="categoryName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-modern w-full"
          placeholder="Enter category name..."
          required
          disabled={isLoading}
        />
      </div>

      {/* Current Image Preview */}
      {previewUrl && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Current Image
          </label>
          <div className="w-24 h-24 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            <img 
              src={previewUrl} 
              alt="Category preview" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Image Upload */}
      <div>
        <label htmlFor="categoryImage" className="block text-sm font-semibold text-slate-700 mb-3">
          Update Image (Optional)
        </label>
        <input
          id="categoryImage"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="input-modern w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-500 file:text-white hover:file:bg-blue-600 file:transition-colors"
          disabled={isLoading}
        />
        <p className="text-sm text-slate-500 mt-2">
          Upload a new image to replace the current one (JPG, PNG, GIF up to 5MB)
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
          disabled={isLoading || !name.trim()}
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