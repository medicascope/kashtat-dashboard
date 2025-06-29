'use client';

export default function LoadingSkeleton({ rows = 5, columns = 3 }) {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 bg-gray-600/30 rounded-lg w-48"></div>
        <div className="h-10 bg-gray-600/30 rounded-lg w-24"></div>
      </div>

      {/* Table skeleton */}
      <div className="glass rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="px-6 py-4 border-b border-gray-600/50 bg-gray-800/30">
          <div className="grid grid-cols-4 gap-4">
            <div className="h-4 bg-gray-600/40 rounded w-12"></div>
            <div className="h-4 bg-gray-600/40 rounded w-20"></div>
            <div className="h-4 bg-gray-600/40 rounded w-16"></div>
            <div className="h-4 bg-gray-600/40 rounded w-20"></div>
          </div>
        </div>

        {/* Table rows */}
        {[...Array(rows)].map((_, index) => (
          <div key={index} className="px-6 py-4 border-b border-gray-600/30 last:border-b-0">
            <div className="grid grid-cols-4 gap-4 items-center">
              {/* ID column */}
              <div className="h-4 bg-gray-600/30 rounded w-16"></div>
              
              {/* Name column */}
              <div className="h-4 bg-gray-600/30 rounded w-24"></div>
              
              {/* Image column */}
              <div className="w-10 h-10 bg-gray-600/30 rounded-lg"></div>
              
              {/* Actions column */}
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-gray-600/30 rounded"></div>
                <div className="w-8 h-8 bg-gray-600/30 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(count)].map((_, index) => (
        <div key={index} className="glass rounded-xl p-6 animate-pulse">
          <div className="w-full h-32 bg-gray-600/30 rounded-lg mb-4"></div>
          <div className="space-y-3">
            <div className="h-5 bg-gray-600/30 rounded w-3/4"></div>
            <div className="h-4 bg-gray-600/30 rounded w-1/2"></div>
            <div className="flex space-x-2">
              <div className="h-6 bg-gray-600/30 rounded-full w-16"></div>
              <div className="h-6 bg-gray-600/30 rounded-full w-12"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-600/30 rounded w-48 mb-6"></div>
      
      {[...Array(3)].map((_, index) => (
        <div key={index} className="space-y-2">
          <div className="h-4 bg-gray-600/30 rounded w-24"></div>
          <div className="h-12 bg-gray-600/30 rounded-lg w-full"></div>
        </div>
      ))}
      
      <div className="flex space-x-4 pt-4">
        <div className="h-12 bg-gray-600/30 rounded-lg w-24"></div>
        <div className="h-12 bg-gray-600/30 rounded-lg w-20"></div>
      </div>
    </div>
  );
} 