'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';

export default function EditCategoryModal({ 
  isOpen, 
  onClose, 
  onSave, 
  category,
  isLoading = false 
}) {
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setPreviewUrl(category.image ? `https://app.kashtat.co/${category.image}` : '');
    }
  }, [category]);

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
    
    onSave({
      id: category.id,
      name: name.trim(),
      image: image
    });
  };

  const handleClose = () => {
    setName('');
    setImage(null);
    setPreviewUrl('');
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Edit Category" 
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Name */}
        <div>
          <label htmlFor="categoryName" className="block text-sm font-medium text-gray-300 mb-2">
            Category Name
          </label>
          <input
            id="categoryName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="Enter category name..."
            required
            disabled={isLoading}
          />
        </div>

        {/* Current Image Preview */}
        {previewUrl && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Current Image
            </label>
            <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-600">
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
          <label htmlFor="categoryImage" className="block text-sm font-medium text-gray-300 mb-2">
            Change Image (Optional)
          </label>
          <input
            id="categoryImage"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent file:text-white hover:file:bg-accent-light focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            disabled={isLoading}
          />
          <p className="text-sm text-gray-400 mt-1">
            Upload a new image to replace the current one
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 text-gray-300 bg-gray-600/50 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="flex-1 px-4 py-3 text-white bg-accent hover:bg-accent-light rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            ) : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
} 