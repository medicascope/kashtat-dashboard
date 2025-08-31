'use client';

import { useState, useEffect } from 'react';
import { AuthService } from '../lib/auth';
import Sidebar from '@/components/Sidebar';
import PageHeader from '@/components/ui/PageHeader';
import Categories from '@/components/sections/Categories';
import Countries from '@/components/sections/Countries';
import Users from '@/components/sections/Users';
import Cities from '@/components/sections/Cities';
import Partners from '@/components/sections/Partners';
import Branches from '@/components/sections/Branches';
import Packages from '@/components/sections/Packages';
import Orders from '@/components/sections/Orders';

// Mapping sections to their components
const SECTION_COMPONENTS = {
  categories: Categories,
  countries: Countries,
  users: Users,
  cities: Cities,
  partners: Partners,
  branches: Branches,
  packages: Packages,
  orders: Orders,
  // TODO: Add other section components as they are created
};

// Section names for display
const SECTION_NAMES = {
  categories: 'Categories',
  countries: 'Countries',
  users: 'Users',
  cities: 'Cities',
  partners: 'Partners',
  branches: 'Branches',
  packages: 'Packages',
  orders: 'Orders',
};

// Sub-item names for display
const SUB_ITEM_NAMES = {
  'get-categories': 'View Categories',
  'add-category': 'Add Category',
  'edit-category': 'Edit Category',
  'get-countries': 'View Countries',
  'add-country': 'Add Country',
  'edit-country': 'Edit Country',
  'get-users': 'View Users',
  'add-user': 'Add User',
  'edit-user': 'Edit User',
  'user-permissions': 'User Permissions',
  'get-cities': 'View Cities',
  'add-city': 'Add City',
  'edit-city': 'Edit City',
  'get-partners': 'View Partners',
  'add-partner': 'Add Partner',
  'edit-partner': 'Edit Partner',
  'partner-status': 'Partner Status',
  'get-branches': 'View Branches',
  'add-branch': 'Add Branch',
  'edit-branch': 'Edit Branch',
  'get-packages': 'View Packages',
  'create-package': 'Create Package',
  'edit-package': 'Edit Package',
  'package-pricing': 'Package Pricing',
  'get-orders': 'View Orders',
  'order-analytics': 'Order Analytics',
  'order-status': 'Order Status',
  'order-tracking': 'Order Tracking',
};

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('categories');
  const [activeSubItem, setActiveSubItem] = useState('get-categories');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    AuthService.getStatus().then(userData => {
      if (!userData.authenticated) {
        console.log(userData);
        window.location.href = '/login';
        return;
      }
      setUser(userData);
      setIsLoading(false);
    });

  }, []);

  const handleLogout = () => {
    AuthService.logout();
  };

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);

    // Set default sub-item for each section
    switch (sectionId) {
      case 'categories':
        setActiveSubItem('get-categories');
        break;
      case 'countries':
        setActiveSubItem('get-countries');
        break;
      case 'users':
        setActiveSubItem('get-users');
        break;
      case 'cities':
        setActiveSubItem('get-cities');
        break;
      case 'partners':
        setActiveSubItem('get-partners');
        break;
      case 'branches':
        setActiveSubItem('get-branches');
        break;
      case 'packages':
        setActiveSubItem('get-packages');
        break;
      case 'orders':
        setActiveSubItem('get-orders');
        break;
      default:
        setActiveSubItem(null);
    }
  };

  const handleSubItemChange = (subItemId) => {
    setActiveSubItem(subItemId);
  };

  const handleSidebarCollapse = (isCollapsed) => {
    setCollapsed(isCollapsed);
  };

  const handleAddNew = () => {
    // Logic to handle "Add New" button click
    console.log('Add new item for section:', activeSection);
  };

  const handleExport = () => {
    // Logic to handle "Export" button click
    console.log('Export data for section:', activeSection);
  };

  const renderMainContent = () => {
    const SectionComponent = SECTION_COMPONENTS[activeSection];

    if (SectionComponent) {
      // Render the specific section component
      return <SectionComponent
        activeSubItem={activeSubItem}
        onNavigate={handleSubItemChange}
      />;
    }

    // Fallback for sections that don't have components yet
    return (
      <div className="card-premium animate-fade-in-up">
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">
            {SECTION_NAMES[activeSection]}
          </h3>
          <p className="text-lg font-medium text-blue-600 mb-4">
            {SUB_ITEM_NAMES[activeSubItem]}
          </p>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            This section is ready for implementation. Connect with the backend API to start managing your data.
          </p>
          <div className="flex gap-3 justify-center">
            <button className="btn-primary">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Configure API
            </button>
            <button className="btn-ghost">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              View Documentation
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen dashboard-content flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-300 rounded-full animate-spin animate-pulse"></div>
          </div>
          <div className="text-center">
            <p className="text-slate-600 font-medium">Loading dashboard...</p>
            <p className="text-slate-400 text-sm">Initializing admin panel</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar Navigation */}
      <Sidebar
        user={user}
        onLogout={handleLogout}
        activeSection={activeSection}
        activeSubItem={activeSubItem}
        onSectionChange={handleSectionChange}
        onSubItemChange={handleSubItemChange}
        onSidebarCollapse={handleSidebarCollapse}
      />

      {/* Main Content Area */}
      <div className={`flex-1 dashboard-content transition-all duration-300 ease-in-out ${collapsed ? 'ml-20' : 'ml-72'}`}>
        <div className="h-full overflow-y-auto">
          <div className="p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Page Header */}
              <div className="animate-fade-in">
                <PageHeader
                  title={SECTION_NAMES[activeSection]}
                  subtitle={SUB_ITEM_NAMES[activeSubItem]}
                  onAddNew={handleAddNew}
                  onExport={handleExport}
                  showActions={!activeSubItem.includes('add-') && !activeSubItem.includes('create-') && !activeSubItem.includes('edit-')}
                />
              </div>

              {/* Dynamic Content */}
              <div className="animate-fade-in-up">
                {renderMainContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 