import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Upload, FileText, TrendingUp, Users, RefreshCw, GraduationCap, BookOpen } from 'lucide-react';
import { getSurveys, getPapers } from '../../services/supabaseService';
import UploadPaper from './UploadPaper';
import PaperManagement from './PaperManagement';
import StudyGuideManagement from './StudyGuideManagement';
import BookManagement from './BookManagement';
import { SkeletonCard } from '../Common/SkeletonLoader';

interface SurveyAnalytics {
  subjectCounts: { [key: string]: number };
  frequencyCounts: { [key: string]: number };
  resourceCounts: { [key: string]: number };
  totalSurveys: number;
  totalPapers: number;
  allSurveys: any[];
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'upload' | 'manage' | 'study-guides' | 'books'>('dashboard');
  const [analytics, setAnalytics] = useState<SurveyAnalytics>({
    subjectCounts: {},
    frequencyCounts: {},
    resourceCounts: {},
    totalSurveys: 0,
    totalPapers: 0,
    allSurveys: []
  });
  const [loading, setLoading] = useState(true);

  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setAnalyticsError(null);
    try {
      const [surveysResult, papersResult] = await Promise.all([
        getSurveys(),
        getPapers()
      ]);

      if (surveysResult.success && papersResult.success) {
        const subjectCounts: { [key: string]: number } = {};
        const frequencyCounts: { [key: string]: number } = {};
        const resourceCounts: { [key: string]: number } = {};

        surveysResult.surveys.forEach((survey: any) => {
          if (survey.most_needed_subjects && Array.isArray(survey.most_needed_subjects)) {
            survey.most_needed_subjects.forEach((subject: string) => {
              subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
            });
          }
          
          if (survey.study_frequency) {
            frequencyCounts[survey.study_frequency] = (frequencyCounts[survey.study_frequency] || 0) + 1;
          }

          if (survey.preferred_resources && Array.isArray(survey.preferred_resources)) {
            survey.preferred_resources.forEach((resource: string) => {
              resourceCounts[resource] = (resourceCounts[resource] || 0) + 1;
            });
          }
        });

        setAnalytics({
          subjectCounts,
          frequencyCounts,
          resourceCounts,
          totalSurveys: surveysResult.surveys.length,
          totalPapers: papersResult.papers.length,
          allSurveys: surveysResult.surveys
        });
      } else {
        const err = surveysResult.error || papersResult.error || 'Failed to load analytics';
        setAnalyticsError(err as string);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalyticsError(error instanceof Error ? error.message : 'Unknown error');
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

  const resourceData = Object.entries(analytics.resourceCounts).map(([resource, count]) => ({
    resource,
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
        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            { id: 'manage', label: 'Manage Papers', icon: FileText },
            { id: 'study-guides', label: 'Study Guides', icon: GraduationCap },
            { id: 'books', label: 'Books', icon: BookOpen }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as 'dashboard' | 'upload' | 'manage' | 'study-guides' | 'books')}
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

      {analyticsError && (
        <div className="mb-6 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-200 px-4 py-3 rounded">
          {analyticsError}
        </div>
      )}

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
                    <Users className="h-8 w-8 text-primary-600" />
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Surveys</h3>
                      <p className="text-3xl font-bold text-primary-600">{analytics.totalSurveys}</p>
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
            <>
              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
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
                          label
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

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Preferred Resources
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={resourceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="resource" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          fontSize={10}
                        />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#14B8A6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Survey Details Table */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Survey Responses ({analytics.totalSurveys} total)
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Student Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Subjects Needed
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Study Frequency
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Preferred Resources
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Comments
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {analytics.allSurveys.map((survey, index) => (
                        <tr key={survey.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {survey.student_email}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            <div className="flex flex-wrap gap-1">
                              {survey.most_needed_subjects?.map((subject: string, idx: number) => (
                                <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  {subject}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              {survey.study_frequency}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            <div className="flex flex-wrap gap-1">
                              {survey.preferred_resources?.map((resource: string, idx: number) => (
                                <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                  {resource}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs">
                            <div className="truncate" title={survey.additional_comments}>
                              {survey.additional_comments || 'No comments'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {survey.timestamp ? new Date(survey.timestamp).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {analytics.allSurveys.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No survey responses yet
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'upload' && <UploadPaper onUploadSuccess={fetchAnalytics} />}
      {activeTab === 'manage' && <PaperManagement onDataChange={fetchAnalytics} />}
      {activeTab === 'study-guides' && <StudyGuideManagement />}
      {activeTab === 'books' && <BookManagement />}
    </div>
  );
};

export default AdminDashboard;