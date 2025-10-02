import React, { useState } from 'react';
import { Upload, FileText, TrendingUp, Book, GraduationCap, Bug } from 'lucide-react';
import UploadPaper from './UploadPaper';
import PaperManagement from './PaperManagement';
import AdminAnalytics from './AdminAnalytics';
import BookManagement from './BookManagement';
import StudyGuideManagement from './StudyGuideManagement';
import SurveyDebug from './SurveyDebug';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'upload' | 'manage' | 'books' | 'guides' | 'debug'>('dashboard');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage papers and view analytics
          </p>
        </div>
      </div>

      <div className="mb-8">
        <nav className="flex flex-wrap gap-4">
          {[
            { id: 'dashboard', label: 'Analytics', icon: TrendingUp },
            { id: 'upload', label: 'Upload Paper', icon: Upload },
            { id: 'manage', label: 'Manage Papers', icon: FileText },
            { id: 'books', label: 'Manage Books', icon: Book },
            { id: 'guides', label: 'Study Guides', icon: GraduationCap },
            { id: 'debug', label: 'Debug Surveys', icon: Bug }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as 'dashboard' | 'upload' | 'manage' | 'books' | 'guides' | 'debug')}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === id
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'dashboard' && <AdminAnalytics />}
      {activeTab === 'upload' && <UploadPaper onUploadSuccess={() => {}} />}
      {activeTab === 'manage' && <PaperManagement onDataChange={() => {}} />}
      {activeTab === 'books' && <BookManagement />}
      {activeTab === 'guides' && <StudyGuideManagement />}
      {activeTab === 'debug' && <SurveyDebug />}
    </div>
  );
};

export default AdminDashboard;