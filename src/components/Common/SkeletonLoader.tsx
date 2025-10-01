import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonLoaderProps> = ({ className = "" }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow animate-pulse ${className}`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>
        
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
        
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
        </div>
        
        <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
    </div>
  );
};

export const SkeletonText: React.FC<SkeletonLoaderProps> = ({ className = "" }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
    </div>
  );
};

export const SkeletonButton: React.FC<SkeletonLoaderProps> = ({ className = "" }) => {
  return (
    <div className={`h-10 bg-gray-300 dark:bg-gray-600 rounded animate-pulse ${className}`}></div>
  );
};
