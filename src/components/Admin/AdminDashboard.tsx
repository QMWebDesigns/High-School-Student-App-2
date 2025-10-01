import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Upload, FileText, TrendingUp, Users, RefreshCw } from 'lucide-react';
import { getSurveys, getPapers } from '../../services/firestoreService';
import UploadPaper from './UploadPaper';
import PaperManagement from './PaperManagement';
import { SkeletonCard } from '../Common/SkeletonLoader';

interface SurveyAnalytics {
  subjectCounts: { [key: string]: number };
  frequencyCounts: { [key: string]: number };
  totalSurveys: number;
  totalPapers: number;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'upload' | 'manage'>('dashboard');
  const [analytics, setAnalytics] = useState<SurveyAnalytics>({
    subjectCounts: {},
    frequencyCounts: {},
    totalSurveys: 0,
    totalPapers: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const [surveysResult, papersResult] = await Promise.all([
        getSurveys(),
        getPapers()
      ]);

      if (surveysResult.success && papersResult.success) {
        const subjectCounts: { [key: string]: number } = {};
        const frequencyCounts: { [key: string]: number } = {};

        surveysResult.surveys.forEach(survey => {
          if (survey.subjects && Array.isArray(survey.subjects)) {
            survey.subjects.forEach(subject => {
              subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
            });
          }
          
          if (survey.studyFrequency) {
            frequencyCounts[survey.studyFrequency] = (frequencyCounts[survey.studyFrequency] || 0) + 1;
          }
        });

        setAnalytics({
          subjectCounts,
          frequencyCounts,
          totalSurveys: surveysResult.surveys.length,
          totalPapers: papersResult.papers.length
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const subjectData = Object.entries(analytics.subjectCounts).map(([subject, count]) => ({
    subject,
    count
  }));

  const frequencyData = Object.entries(analytics.frequencyCounts).map(([frequency, count]) => ({
    frequency,
    count
  }));

  const COLORS = ['#3B82F6', '#14B8A6', '#F97316', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage papers and view analytics
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="mb-8">
        <nav className="flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
            { id: 'upload', label: 'Upload Paper', icon: Upload },
            { id: 'manage', label: 'Manage Papers', icon: FileText }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as 'dashboard' | 'upload' | 'manage')}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === id
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              <>
                <SkeletonCard className="h-24" />
                <SkeletonCard className="h-24" />
                <SkeletonCard className="h-24" />
              </>
            ) : (
              <>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Surveys</h3>
                      <p className="text-3xl font-bold text-blue-600">{analytics.totalSurveys}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Papers</h3>
                      <p className="text-3xl font-bold text-green-600">{analytics.totalPapers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Subjects</h3>
                      <p className="text-3xl font-bold text-purple-600">
                        {Object.keys(analytics.subjectCounts).length}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {!loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Subject Interest
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="subject" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={12}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Study Frequency
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={frequencyData}
                        dataKey="count"
                        nameKey="frequency"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label={(props: { frequency: string; percent: number }) => `${props.frequency} (${(props.percent * 100).toFixed(0)}%)`}
                      >
                        {frequencyData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'upload' && <UploadPaper onUploadSuccess={fetchAnalytics} />}
      {activeTab === 'manage' && <PaperManagement onDataChange={fetchAnalytics} />}
    </div>
  );
};

export default AdminDashboard;