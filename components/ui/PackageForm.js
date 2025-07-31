'use client';

import { useState, useEffect, useMemo } from 'react';

export default function PackageForm({ 
  onSubmit, 
  onCancel, 
  initialData = {},
  categories = [],
  partners = [],
  branches = [],
  speakers = [],
  entertainments = [],
  rules = [],
  submitText = 'Create Package',
  isLoading = false 
}) {
  const [activeTab, setActiveTab] = useState('basic');

  // Memoize the initial form data to prevent re-creation on every render
  const initialFormData = useMemo(() => ({
    name: '',
    overview: '',
    type: 'package',
    working_days: 'sunday,monday,tuesday,wednesday,thursday',
    discount_percentage: '0',
    due_date: '2025-12-31', // Set a default future date
    order_id: '0',
    full_refund_within: '30',
    partial_refund_within: '15',
    partial_refund_percentage: '10',
    partner_id: '',
    category_id: '',
    status: '1',
    speaker_ids: [],
    entertainment_ids: [],
    rule_ids: [],
    branch_ids: [],
    prices: [
      { price: '100', user_type: 'citizen', age_group: 'adult' }
    ],
    cover_image: null,
    ...initialData
  }), [initialData]);

  const [formData, setFormData] = useState(initialFormData);

  // Update form data when initialData changes
  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, cover_image: e.target.files[0] }));
  };

  const handleArrayChange = (name, values) => {
    setFormData(prev => ({ ...prev, [name]: values }));
  };

  const handlePriceChange = (index, field, value) => {
    const newPrices = [...formData.prices];
    newPrices[index] = { ...newPrices[index], [field]: value };
    setFormData(prev => ({ ...prev, prices: newPrices }));
  };

  const addPrice = () => {
    setFormData(prev => ({
      ...prev,
      prices: [...prev.prices, { price: '', user_type: 'citizen', age_group: 'adult' }]
    }));
  };

  const removePrice = (index) => {
    if (formData.prices.length > 1) {
      const newPrices = formData.prices.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, prices: newPrices }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit(formData);
  };

  const tabs = useMemo(() => [
    { id: 'basic', label: 'Basic Info', icon: '📝' },
    { id: 'pricing', label: 'Pricing', icon: '💰' },
    { id: 'relations', label: 'Relations', icon: '🔗' },
    { id: 'policies', label: 'Policies', icon: '📋' },
  ], []);

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Package Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="input-modern w-full"
            placeholder="Enter package name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="input-modern w-full"
            required
          >
            <option value="package">Package</option>
            <option value="event">Event</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Partner *
          </label>
          <select
            value={formData.partner_id}
            onChange={(e) => handleChange('partner_id', e.target.value)}
            className="input-modern w-full"
            required
          >
            <option value="">Select Partner</option>
            {partners.map((partner) => (
              <option key={partner.id} value={partner.id}>
                {partner.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category (Optional)
          </label>
          <select
            value={formData.category_id || ''}
            onChange={(e) => handleChange('category_id', e.target.value)}
            className="input-modern w-full"
          >
            <option value="">No Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Due Date *
          </label>
          <input
            type="date"
            value={formData.due_date}
            onChange={(e) => handleChange('due_date', e.target.value)}
            className="input-modern w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Working Days *
          </label>
          <input
            type="text"
            value={formData.working_days}
            onChange={(e) => handleChange('working_days', e.target.value)}
            className="input-modern w-full"
            placeholder="e.g., sunday,monday,friday"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Comma-separated days</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Overview *
        </label>
        <textarea
          value={formData.overview}
          onChange={(e) => handleChange('overview', e.target.value)}
          rows={4}
          className="input-modern w-full"
          placeholder="Package overview and description"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cover Image
        </label>
        <input
          type="file"
          onChange={handleFileChange}
          className="input-modern w-full"
          accept="image/*"
        />
      </div>
    </div>
  );

  const renderPricing = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Discount Percentage
          </label>
          <input
            type="number"
            value={formData.discount_percentage}
            onChange={(e) => handleChange('discount_percentage', e.target.value)}
            className="input-modern w-full"
            min="0"
            max="100"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order ID
          </label>
          <input
            type="number"
            value={formData.order_id}
            onChange={(e) => handleChange('order_id', e.target.value)}
            className="input-modern w-full"
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900">Pricing Tiers</h4>
          <button
            type="button"
            onClick={addPrice}
            className="btn-primary text-sm"
          >
            Add Price Tier
          </button>
        </div>

        <div className="space-y-4">
          {formData.prices.map((price, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-gray-900">Price Tier {index + 1}</h5>
                {formData.prices.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePrice(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <input
                    type="number"
                    value={price.price}
                    onChange={(e) => handlePriceChange(index, 'price', e.target.value)}
                    className="input-modern w-full"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User Type *
                  </label>
                  <select
                    value={price.user_type}
                    onChange={(e) => handlePriceChange(index, 'user_type', e.target.value)}
                    className="input-modern w-full"
                    required
                  >
                    <option value="citizen">Citizen</option>
                    <option value="residence">Residence</option>
                    <option value="visitor">Visitor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age Group *
                  </label>
                  <select
                    value={price.age_group}
                    onChange={(e) => handlePriceChange(index, 'age_group', e.target.value)}
                    className="input-modern w-full"
                    required
                  >
                    <option value="adult">Adult</option>
                    <option value="child">Child</option>
                    <option value="infant">Infant</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRelations = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Branches
        </label>
        <select
          multiple
          value={formData.branch_ids}
          onChange={(e) => handleArrayChange('branch_ids', Array.from(e.target.selectedOptions, option => option.value))}
          className="input-modern w-full h-32"
        >
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name} - {branch.partner?.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Speakers
        </label>
        <select
          multiple
          value={formData.speaker_ids}
          onChange={(e) => handleArrayChange('speaker_ids', Array.from(e.target.selectedOptions, option => option.value))}
          className="input-modern w-full h-32"
        >
          {speakers.map((speaker) => (
            <option key={speaker.id} value={speaker.id}>
              {speaker.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Entertainments
        </label>
        <select
          multiple
          value={formData.entertainment_ids}
          onChange={(e) => handleArrayChange('entertainment_ids', Array.from(e.target.selectedOptions, option => option.value))}
          className="input-modern w-full h-32"
        >
          {entertainments.map((entertainment) => (
            <option key={entertainment.id} value={entertainment.id}>
              {entertainment.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rules
        </label>
        <select
          multiple
          value={formData.rule_ids}
          onChange={(e) => handleArrayChange('rule_ids', Array.from(e.target.selectedOptions, option => option.value))}
          className="input-modern w-full h-32"
        >
          {rules.map((rule) => (
            <option key={rule.id} value={rule.id}>
              {rule.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
      </div>
    </div>
  );

  const renderPolicies = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Refund Within (days) *
          </label>
          <input
            type="number"
            value={formData.full_refund_within}
            onChange={(e) => handleChange('full_refund_within', e.target.value)}
            className="input-modern w-full"
            min="0"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Partial Refund Within (days) *
          </label>
          <input
            type="number"
            value={formData.partial_refund_within}
            onChange={(e) => handleChange('partial_refund_within', e.target.value)}
            className="input-modern w-full"
            min="0"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Partial Refund Percentage *
          </label>
          <input
            type="number"
            value={formData.partial_refund_percentage}
            onChange={(e) => handleChange('partial_refund_percentage', e.target.value)}
            className="input-modern w-full"
            min="0"
            max="100"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <select
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value)}
          className="input-modern w-full"
        >
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tab Content */}
        <div className="min-h-96">
          {activeTab === 'basic' && renderBasicInfo()}
          {activeTab === 'pricing' && renderPricing()}
          {activeTab === 'relations' && renderRelations()}
          {activeTab === 'policies' && renderPolicies()}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="btn-ghost"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
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