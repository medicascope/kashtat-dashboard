'use client';

import { useState } from 'react';

export default function CreateForm({ 
  title, 
  fields = [], 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) {
  const [formData, setFormData] = useState(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: field.defaultValue || '' }), {})
  );

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit(formData);
  };

  const renderField = (field) => {
    const baseClassName = "w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent";
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <input
            type={field.type}
            name={field.name}
            value={formData[field.name]}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={baseClassName}
            placeholder={field.placeholder}
            required={field.required}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            name={field.name}
            value={formData[field.name]}
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
            value={formData[field.name]}
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
            value={formData[field.name]}
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
      <h3 className="text-xl font-semibold text-white mb-6">{title}</h3>
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
                Creating...
              </div>
            ) : (
              `Create ${title}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 