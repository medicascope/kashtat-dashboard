'use client';

import { useState } from 'react';

const SECTIONS = [
  {
    id: 'categories',
    name: 'Categories',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14-7v8a2 2 0 01-2 2m-2 0h-5a2 2 0 01-2-2v-8m0 0V3a2 2 0 012-2h5a2 2 0 012 2v2M7 21l8-8H8l-1 8z" />
      </svg>
    ),
    subItems: [
      { id: 'get-categories', name: 'View Categories', action: 'list' },
      { id: 'add-category', name: 'Add Category', action: 'create' },
      { id: 'edit-category', name: 'Edit Category', action: 'edit' }
    ]
  },
  {
    id: 'countries',
    name: 'Countries',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    subItems: [
      { id: 'get-countries', name: 'View Countries', action: 'list' },
      { id: 'add-country', name: 'Add Country', action: 'create' },
      { id: 'edit-country', name: 'Edit Country', action: 'edit' }
    ]
  },
  {
    id: 'users',
    name: 'Users',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    subItems: [
      { id: 'get-users', name: 'View Users', action: 'list' },
      { id: 'add-user', name: 'Add User', action: 'create' },
      { id: 'edit-user', name: 'Edit User', action: 'edit' },
      { id: 'user-permissions', name: 'User Permissions', action: 'manage' }
    ]
  },
  {
    id: 'cities',
    name: 'Cities',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    subItems: [
      { id: 'get-cities', name: 'View Cities', action: 'list' },
      { id: 'add-city', name: 'Add City', action: 'create' },
      { id: 'edit-city', name: 'Edit City', action: 'edit' }
    ]
  },
  {
    id: 'partners',
    name: 'Partners',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    subItems: [
      { id: 'get-partners', name: 'View Partners', action: 'list' },
      { id: 'add-partner', name: 'Add Partner', action: 'create' },
      { id: 'edit-partner', name: 'Edit Partner', action: 'edit' },
      { id: 'partner-status', name: 'Partner Status', action: 'manage' }
    ]
  },
  {
    id: 'branches',
    name: 'Branches',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    subItems: [
      { id: 'get-branches', name: 'View Branches', action: 'list' },
      { id: 'add-branch', name: 'Add Branch', action: 'create' },
      { id: 'edit-branch', name: 'Edit Branch', action: 'edit' }
    ]
  },
  {
    id: 'packages',
    name: 'Packages',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    subItems: [
      { id: 'get-packages', name: 'View Packages', action: 'list' },
      { id: 'create-package', name: 'Create Package', action: 'create' },
      { id: 'edit-package', name: 'Edit Package', action: 'edit' },
      { id: 'package-pricing', name: 'Package Pricing', action: 'manage' }
    ]
  },
  {
    id: 'orders',
    name: 'Orders',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    subItems: [
      { id: 'get-orders', name: 'View Orders', action: 'list' },
      { id: 'order-details', name: 'Order Details', action: 'view' },
      { id: 'order-status', name: 'Order Status', action: 'manage' },
      { id: 'order-tracking', name: 'Order Tracking', action: 'track' }
    ]
  }
];

export default function Sidebar({ 
  user, 
  onLogout, 
  activeSection, 
  activeSubItem, 
  onSectionChange, 
  onSubItemChange 
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState(['categories']);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleSubItemClick = (sectionId, subItemId) => {
    onSectionChange(sectionId);
    onSubItemChange(subItemId);
    if (!expandedSections.includes(sectionId)) {
      setExpandedSections(prev => [...prev, sectionId]);
    }
  };

  return (
    <div className={`${collapsed ? 'w-20' : 'w-72'} transition-all duration-300 ease-in-out flex-shrink-0`}>
      <div className="h-full dashboard-sidebar flex flex-col">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${collapsed ? 'justify-center' : ''}`}>
              <div className="sidebar-brand">
                <span className="text-xl font-bold text-white">K</span>
              </div>
              {!collapsed && (
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-white">Kashtat</h1>
                  <p className="text-xs text-slate-400 font-medium">Admin Dashboard</p>
                </div>
              )}
            </div>
            {!collapsed && (
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <nav className="space-y-1">
            {SECTIONS.map((section) => (
              <div key={section.id} className="space-y-1">
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`w-full flex items-center justify-between sidebar-item ${
                    activeSection === section.id ? 'active' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <span className="flex-shrink-0">{section.icon}</span>
                    {!collapsed && <span className="ml-3">{section.name}</span>}
                  </div>
                  {!collapsed && (
                    <svg 
                      className={`w-4 h-4 transform transition-transform duration-200 ${
                        expandedSections.includes(section.id) ? 'rotate-90' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
                
                {!collapsed && expandedSections.includes(section.id) && (
                  <div className="space-y-1 animate-fade-in">
                    {section.subItems.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => handleSubItemClick(section.id, subItem.id)}
                        className={`w-full text-left sidebar-subitem ${
                          activeSubItem === subItem.id && activeSection === section.id
                            ? 'active'
                            : ''
                        }`}
                      >
                        <span className="flex items-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50 mr-3"></div>
                          {subItem.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Collapse Toggle for Collapsed State */}
        {collapsed && (
          <div className="px-4 pb-4">
            <button
              onClick={() => setCollapsed(false)}
              className="w-full p-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200 flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* User Profile & Logout */}
        {!collapsed && (
          <div className="p-6 border-t border-slate-700/50">
            <div className="space-y-4">
              {/* User Info */}
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-white">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.name || 'Admin User'}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {user?.email || 'admin@kashtat.co'}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button className="p-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white transition-all duration-200 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <button
                  onClick={onLogout}
                  className="p-2.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-all duration-200 flex items-center justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 