'use client';

import { useState, useEffect } from 'react';

export default function CreateForm({ 
  title, 
  fields = [], 
  onSubmit, 
  onCancel, 
  initialData = {},
  submitText = 'Submit',
  isLoading = false 
}) {
  // Initialize form data with proper defaults to avoid controlled/uncontrolled warning
  const [formData, setFormData] = useState(() => {
    const fieldDefaults = {};
    fields.forEach(field => {
      fieldDefaults[field.name] = initialData[field.name] || field.defaultValue || '';
    });
    return fieldDefaults;
  });

  // Handle changes to initialData for edit mode
  useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      const newFormData = {};
      fields.forEach(field => {
        newFormData[field.name] = initialData[field.name] || field.defaultValue || '';
      });
      setFormData(newFormData);
    }
  }, [initialData]); // Only depend on initialData

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit(formData);
  };

  const renderField = (field) => {
    const baseClassName = "input-modern w-full";
    const fieldValue = formData[field.name] || ''; // Ensure always defined
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'password':
        return (
          <input
            type={field.type}
            name={field.name}
            value={fieldValue}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={baseClassName}
            placeholder={field.placeholder}
            required={field.required}
            step={field.step}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            name={field.name}
            value={fieldValue}
            onChange={(e) => handleChange(field.name, e.target.value)}
            rows={field.rows || 4}
            className={baseClassName}
            placeholder={field.placeholder}
            required={field.required}
          />
        );
      
      case 'select':
        return (
          <select
            name={field.name}
            value={fieldValue}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={baseClassName}
            required={field.required}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'file':
        return (
          <input
            type="file"
            name={field.name}
            onChange={(e) => handleChange(field.name, e.target.files[0])}
            className={baseClassName}
            accept={field.accept}
            required={field.required}
          />
        );
      
      default:
        return (
          <input
            type="text"
            name={field.name}
            value={fieldValue}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={baseClassName}
            placeholder={field.placeholder}
            required={field.required}
          />
        );
    }
  };

  return (
    <div>
      {title && <h3 className="text-xl font-semibold text-white mb-6">{title}</h3>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field) => (
            <div key={field.name} className={field.fullWidth ? 'md:col-span-2' : ''}>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </label>
              {renderField(field)}
              {field.help && (
                <p className="text-xs text-gray-500 mt-1">{field.help}</p>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-end space-x-4 pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={onCancel}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-accent hover:bg-accent-light text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </div>
            ) : (
              submitText
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 