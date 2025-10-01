import React from 'react';
import { Loader2, BookOpen } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <BookOpen className="h-12 w-12 text-blue-600 dark:text-blue-400 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Digital Library
          </h1>
        </div>
        
        <div className="flex items-center justify-center mb-4">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          {message}
        </p>
        
        <div className="mt-4 w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
