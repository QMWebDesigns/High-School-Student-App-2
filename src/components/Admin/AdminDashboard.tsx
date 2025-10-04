import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Upload, FileText, TrendingUp, Users, RefreshCw, GraduationCap, BookOpen, LogOut } from 'lucide-react';
import { getSurveys, getPapers } from '../../services/supabaseService';
import { useAuth } from '../../contexts/AuthContext';
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
  mostNeededSubject: string;
  mostWantedResource: string;
  surveyTrends: { [key: string]: number };
}

const AdminDashboard: React.FC = () => {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'upload' | 'manage' | 'study-guides' | 'books'>('dashboard');
  const [analytics, setAnalytics] = useState<SurveyAnalytics>({
    subjectCounts: {},
    frequencyCounts: {},
    resourceCounts: {},
    totalSurveys: 0,
    totalPapers: 0,
    allSurveys: [],
    mostNeededSubject: '',
    mostWantedResource: '',
    surveyTrends: {}
  });
  const [loading, setLoading] = useState(true);

  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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
        const surveyTrends: { [key: string]: number } = {};

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

          // Track survey trends by date
          if (survey.timestamp) {
            const date = new Date(survey.timestamp).toLocaleDateString();
            surveyTrends[date] = (surveyTrends[date] || 0) + 1;
          }
        });

        // Find most needed subject
        const mostNeededSubject = Object.entries(subjectCounts).reduce((a, b) => 
          subjectCounts[a[0]] > subjectCounts[b[0]] ? a : b, ['', 0])[0];

        // Find most wanted resource
        const mostWantedResource = Object.entries(resourceCounts).reduce((a, b) => 
          resourceCounts[a[0]] > resourceCounts[b[0]] ? a : b, ['', 0])[0];

        setAnalytics({
          subjectCounts,
          frequencyCounts,
          resourceCounts,
          totalSurveys: surveysResult.surveys.length,
          totalPapers: papersResult.papers.length,
          allSurveys: surveysResult.surveys,
          mostNeededSubject,
          mostWantedResource,
          surveyTrends
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

  const trendData = Object.entries(analytics.surveyTrends)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, count]) => ({
      date,
      count
    }));

  // Calculate percentages for pie chart
  const totalFrequency = Object.values(analytics.frequencyCounts).reduce((sum, count) => sum + count, 0);
  const frequencyDataWithPercentages = frequencyData.map(item => ({
    ...item,
    percentage: totalFrequency > 0 ? Math.round((item.count / totalFrequency) * 100) : 0
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
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <>
                <SkeletonCard className="h-24" />
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
                    <BookOpen className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Most Needed Subject</h3>
                      <p className="text-lg font-bold text-purple-600 truncate">
                        {analytics.mostNeededSubject || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Most Wanted Resource</h3>
                      <p className="text-lg font-bold text-orange-600 truncate">
                        {analytics.mostWantedResource || 'N/A'}
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
                          data={frequencyDataWithPercentages}
                          dataKey="count"
                          nameKey="frequency"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          label={({ frequency, percentage }) => `${frequency}: ${percentage}%`}
                        >
                          {frequencyDataWithPercentages.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name, props) => [
                          `${value} (${props.payload.percentage}%)`,
                          name
                        ]} />
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

              {/* Survey Trend Table */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Survey Submission Trend
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Surveys Submitted
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Percentage of Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {trendData.map((trend, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {trend.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {trend.count}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {analytics.totalSurveys > 0 ? Math.round((trend.count / analytics.totalSurveys) * 100) : 0}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {trendData.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No survey trends available
                  </div>
                )}
              </div>

              {/* Anonymous Survey Comments */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Anonymous Survey Comments ({analytics.allSurveys.filter(s => s.additional_comments).length} with comments)
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {analytics.allSurveys
                      .filter(survey => survey.additional_comments && survey.additional_comments.trim())
                      .map((survey, index) => (
                        <div key={survey.id || index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-primary-600 dark:text-primary-300">
                                  {index + 1}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 dark:text-white">
                                {survey.additional_comments}
                              </p>
                              <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                <span>Study Frequency: {survey.study_frequency}</span>
                                <span>Subjects: {survey.most_needed_subjects?.join(', ')}</span>
                                <span>Resources: {survey.preferred_resources?.join(', ')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                  {analytics.allSurveys.filter(s => s.additional_comments).length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No comments provided in surveys
                    </div>
                  )}
                </div>
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