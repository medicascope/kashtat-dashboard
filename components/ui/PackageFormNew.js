'use client';

import { useState } from 'react';
import { Image, MapPin, DollarSign, Calendar, Users, Tag, Link as LinkIcon, Clock, FileText } from 'lucide-react';

export default function PackageFormNew({ 
  categories = [], 
  initialData = null, 
  onSubmit, 
  onCancel, 
  submitText = 'Submit', 
  isLoading = false 
}) {
  // Initialize form with raw API data - no transformation needed
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    long_description: initialData?.long_description || '',
    location: initialData?.location || '',
    address: initialData?.address || '',
    latitude: initialData?.latitude || '',
    longitude: initialData?.longitude || '',
    price: initialData?.price || '',
    original_price: initialData?.original_price || '',
    discount: initialData?.discount || 0,
    currency: initialData?.currency || 'AED',
    rating: initialData?.rating || 0,
    review_count: initialData?.review_count || 0,
    image: initialData?.image || '',
    images: initialData?.images ? (Array.isArray(initialData.images) ? initialData.images.join(',') : initialData.images) : '',
    category: initialData?.category || '', // Direct from API
    tags: initialData?.tags ? (Array.isArray(initialData.tags) ? initialData.tags.join(',') : initialData.tags) : '',
    duration: initialData?.duration || '',
    weather: initialData?.weather || '',
    distance: initialData?.distance || '',
    contact_phone: initialData?.contact_phone || '',
    contact_email: initialData?.contact_email || '',
    contact_website: initialData?.contact_website || '',
    amenities: initialData?.amenities ? (Array.isArray(initialData.amenities) ? initialData.amenities.join(',') : initialData.amenities) : '',
    pricing_adults: initialData?.pricing_adults || '',
    pricing_children: initialData?.pricing_children || '',
    pricing_infants: initialData?.pricing_infants || '0',
    policies_cancellation: initialData?.policies_cancellation || '',
    policies_refund: initialData?.policies_refund || '',
    policies_rules: initialData?.policies_rules ? (Array.isArray(initialData.policies_rules) ? initialData.policies_rules.join(',') : initialData.policies_rules) : '',
    availability_available: initialData?.availability_available !== undefined ? initialData.availability_available : true,
    availability_next_available: initialData?.availability_next_available || '',
    availability_time_slots: initialData?.availability_time_slots ? (Array.isArray(initialData.availability_time_slots) ? initialData.availability_time_slots.join(',') : initialData.availability_time_slots) : '',
    is_popular: initialData?.is_popular || false,
    is_recommended: initialData?.is_recommended || false,
    partner_id: initialData?.partner_id || null,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert arrays and numbers properly
    const submitData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      discount: parseInt(formData.discount) || 0,
      rating: parseFloat(formData.rating) || 0,
      review_count: parseInt(formData.review_count) || 0,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      pricing_adults: formData.pricing_adults ? parseFloat(formData.pricing_adults) : null,
      pricing_children: formData.pricing_children ? parseFloat(formData.pricing_children) : null,
      pricing_infants: formData.pricing_infants ? parseFloat(formData.pricing_infants) : 0,
      images: formData.images ? formData.images.split(',').map(s => s.trim()).filter(Boolean) : [],
      tags: formData.tags ? formData.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
      amenities: formData.amenities ? formData.amenities.split(',').map(s => s.trim()).filter(Boolean) : [],
      policies_rules: formData.policies_rules ? formData.policies_rules.split(',').map(s => s.trim()).filter(Boolean) : [],
      availability_time_slots: formData.availability_time_slots ? formData.availability_time_slots.split(',').map(s => s.trim()).filter(Boolean) : [],
      availability_available: formData.availability_available ? 1 : 0,
      is_popular: formData.is_popular ? 1 : 0,
      is_recommended: formData.is_recommended ? 1 : 0,
    };
    
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <h4 className="text-lg font-semibold text-slate-800 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Basic Information
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Package Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input-modern w-full"
              placeholder="e.g., Aquaventure Waterpark - Atlantis The Palm"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Short Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="input-modern w-full"
              placeholder="Brief description of the package..."
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Long Description
            </label>
            <textarea
              name="long_description"
              value={formData.long_description}
              onChange={handleChange}
              rows="5"
              className="input-modern w-full"
              placeholder="Detailed description with all features..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-modern w-full"
              required
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Duration
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="input-modern w-full pl-10"
                placeholder="e.g., Full Day (10:00 AM - 6:00 PM)"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Location Information */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <h4 className="text-lg font-semibold text-slate-800 flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Location Information
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="input-modern w-full"
              placeholder="e.g., Palm Jumeirah, Dubai"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Distance
            </label>
            <input
              type="text"
              name="distance"
              value={formData.distance}
              onChange={handleChange}
              className="input-modern w-full"
              placeholder="e.g., 25km from Downtown Dubai"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Full Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="input-modern w-full"
              placeholder="Complete address..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              className="input-modern w-full"
              placeholder="e.g., 25.13080"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              className="input-modern w-full"
              placeholder="e.g., 55.11790"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Weather
            </label>
            <input
              type="text"
              name="weather"
              value={formData.weather}
              onChange={handleChange}
              className="input-modern w-full"
              placeholder="e.g., Sunny 32°C"
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <h4 className="text-lg font-semibold text-slate-800 flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Pricing
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Current Price * (AED)
            </label>
            <input
              type="number"
              step="0.01"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="input-modern w-full"
              placeholder="299.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Original Price (AED)
            </label>
            <input
              type="number"
              step="0.01"
              name="original_price"
              value={formData.original_price}
              onChange={handleChange}
              className="input-modern w-full"
              placeholder="349.00"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Discount (%)
            </label>
            <input
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
              className="input-modern w-full"
              placeholder="14"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Adult Price (AED)
            </label>
            <input
              type="number"
              step="0.01"
              name="pricing_adults"
              value={formData.pricing_adults}
              onChange={handleChange}
              className="input-modern w-full"
              placeholder="299.00"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Children Price (AED)
            </label>
            <input
              type="number"
              step="0.01"
              name="pricing_children"
              value={formData.pricing_children}
              onChange={handleChange}
              className="input-modern w-full"
              placeholder="239.00"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Infant Price (AED)
            </label>
            <input
              type="number"
              step="0.01"
              name="pricing_infants"
              value={formData.pricing_infants}
              onChange={handleChange}
              className="input-modern w-full"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Currency
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="input-modern w-full"
            >
              <option value="AED">AED</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <h4 className="text-lg font-semibold text-slate-800 flex items-center">
          <Image className="w-5 h-5 mr-2" />
          Images
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Main Image URL *
            </label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="input-modern w-full"
              placeholder="https://example.com/image.jpg"
              required
            />
            {formData.image && (
              <div className="mt-2 w-full h-48 rounded-lg overflow-hidden border border-slate-200">
                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Additional Images URLs (comma-separated)
            </label>
            <textarea
              name="images"
              value={formData.images}
              onChange={handleChange}
              rows="3"
              className="input-modern w-full"
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
            />
            <p className="text-xs text-slate-500 mt-1">Separate multiple URLs with commas</p>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <h4 className="text-lg font-semibold text-slate-800 flex items-center">
          <Tag className="w-5 h-5 mr-2" />
          Additional Details
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="input-modern w-full"
              placeholder="family, adventure, water, luxury"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Amenities (comma-separated)
            </label>
            <textarea
              name="amenities"
              value={formData.amenities}
              onChange={handleChange}
              rows="3"
              className="input-modern w-full"
              placeholder="Free WiFi, Parking, Multiple Restaurants"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Time Slots (comma-separated)
            </label>
            <input
              type="text"
              name="availability_time_slots"
              value={formData.availability_time_slots}
              onChange={handleChange}
              className="input-modern w-full"
              placeholder="10:00-18:00, 10:00-19:00"
            />
          </div>
        </div>
      </div>

      {/* Contact & Policies */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <h4 className="text-lg font-semibold text-slate-800 flex items-center">
          <LinkIcon className="w-5 h-5 mr-2" />
          Contact & Policies
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Contact Phone
            </label>
            <input
              type="text"
              name="contact_phone"
              value={formData.contact_phone}
              onChange={handleChange}
              className="input-modern w-full"
              placeholder="+971 4 426 2000"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Contact Email
            </label>
            <input
              type="email"
              name="contact_email"
              value={formData.contact_email}
              onChange={handleChange}
              className="input-modern w-full"
              placeholder="info@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Website
            </label>
            <input
              type="url"
              name="contact_website"
              value={formData.contact_website}
              onChange={handleChange}
              className="input-modern w-full"
              placeholder="https://example.com"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Cancellation Policy
            </label>
            <textarea
              name="policies_cancellation"
              value={formData.policies_cancellation}
              onChange={handleChange}
              rows="2"
              className="input-modern w-full"
              placeholder="Free cancellation up to 24 hours before visit"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Refund Policy
            </label>
            <textarea
              name="policies_refund"
              value={formData.policies_refund}
              onChange={handleChange}
              rows="2"
              className="input-modern w-full"
              placeholder="Full refund for cancellations made 24+ hours in advance"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Rules (comma-separated)
            </label>
            <textarea
              name="policies_rules"
              value={formData.policies_rules}
              onChange={handleChange}
              rows="3"
              className="input-modern w-full"
              placeholder="Proper swimwear required, Height restrictions on some rides"
            />
          </div>
        </div>
      </div>

      {/* Status & Availability */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <h4 className="text-lg font-semibold text-slate-800 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Status & Availability
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="availability_available"
                checked={formData.availability_available}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-slate-700">Available for Booking</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_popular"
                checked={formData.is_popular}
                onChange={handleChange}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-slate-700">Popular</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_recommended"
                checked={formData.is_recommended}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-slate-700">Recommended</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Next Available Date
            </label>
            <input
              type="date"
              name="availability_next_available"
              value={formData.availability_next_available ? formData.availability_next_available.split('T')[0] : ''}
              onChange={handleChange}
              className="input-modern w-full"
            />
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex space-x-4 pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="btn-secondary flex-1"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary flex-1"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              <span>Saving...</span>
            </div>
          ) : submitText}
        </button>
      </div>
    </form>
  );
}

