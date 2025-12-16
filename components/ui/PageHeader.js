'use client';

export default function PageHeader({ title, subtitle, onAddNew, onExport, showActions = true }) {
  return (
    <div className="page-header">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">{title}</h1>
          {subtitle && (
            <div className="flex items-center space-x-2">
              <div className="w-1 h-1 rounded-full bg-blue-500"></div>
              <p className="text-slate-600 font-medium">{subtitle}</p>
            </div>
          )}
        </div>
        {showActions && (
          <div className="action-buttons">
            <button 
              onClick={onAddNew}
              className="btn-primary flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add New</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 