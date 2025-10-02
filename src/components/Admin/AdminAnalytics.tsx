// components/AdminAnalytics.tsx
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Users, BookOpen, BarChart3, MessageSquare } from 'lucide-react';
import { getSurveys, SurveyData } from '../../services/supabaseService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface AnalyticsData {
  totalSurveys: number;
  studyFrequency: { frequency: string; count: number }[];
  mostNeededSubjects: { subject: string; count: number }[];
  preferredResources: { resource: string; count: number }[];
  recentComments: string[];
  surveyTrends: { date: string; count: number }[];
}

const AdminAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      console.log('Loading analytics data...');
      
      const result = await getSurveys();
      console.log('Survey fetch result:', result);
      
      if (result.success) {
        console.log('Processing survey data:', result.surveys);
        const analyticsData = processSurveyData(result.surveys);
        console.log('Processed analytics data:', analyticsData);
        setData(analyticsData);
      } else {
        console.error('Failed to fetch surveys:', result.error);
        setError(result.error || 'Failed to load analytics data');
      }
    } catch (err) {
      console.error('Error in loadAnalytics:', err);
      setError('An error occurred while loading analytics: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const processSurveyData = (surveys: (SurveyData & { id: string })[]): AnalyticsData => {
    console.log(`Processing ${surveys.length} surveys for time range: ${timeRange}`);
    
    // Filter by time range
    const filteredSurveys = surveys.filter(survey => {
      const surveyDate = typeof survey.timestamp === 'string' ? new Date(survey.timestamp) : new Date();
      const now = new Date();
      switch (timeRange) {
        case 'week':
          return surveyDate > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case 'month':
          return surveyDate > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        default:
          return true;
      }
    });

    console.log(`Filtered to ${filteredSurveys.length} surveys after time filter`);

    // Study frequency analysis (Online resource usage)
    const frequencyCount: { [key: string]: number } = {};
    filteredSurveys.forEach(survey => {
      if (survey.studyFrequency) {
        frequencyCount[survey.studyFrequency] = (frequencyCount[survey.studyFrequency] || 0) + 1;
      }
    });
    console.log('Study frequency count:', frequencyCount);

    // Most needed subjects analysis (Question 1)
    const subjectCount: { [key: string]: number } = {};
    filteredSurveys.forEach(survey => {
      if (Array.isArray(survey.subjects)) {
        survey.subjects.forEach(subject => {
          if (subject && typeof subject === 'string') {
            subjectCount[subject] = (subjectCount[subject] || 0) + 1;
          }
        });
      }
    });
    console.log('Subject count:', subjectCount);

    // Preferred resources analysis (Question 3)
    const resourceCount: { [key: string]: number } = {};
    filteredSurveys.forEach(survey => {
      if (Array.isArray(survey.preferredResources)) {
        survey.preferredResources.forEach(resource => {
          if (resource && typeof resource === 'string') {
            resourceCount[resource] = (resourceCount[resource] || 0) + 1;
          }
        });
      }
    });
    console.log('Resource count:', resourceCount);

    // Recent comments (Question 4)
    const recentComments = filteredSurveys
      .filter(s => s.additionalComments && typeof s.additionalComments === 'string' && s.additionalComments.trim().length > 0)
      .slice(0, 10)
      .map(s => s.additionalComments as string);

    // Survey trends (last 7 days)
    const trends = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      const count = filteredSurveys.filter(s => {
        const ts = typeof s.timestamp === 'string' ? s.timestamp : '';
        const surveyDate = ts ? new Date(ts).toISOString().split('T')[0] : '';
        return surveyDate === dateStr;
      }).length;
      return { date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count };
    });

    return {
      totalSurveys: filteredSurveys.length,
      studyFrequency: Object.entries(frequencyCount).map(([frequency, count]) => ({
        frequency: formatFrequencyLabel(frequency),
        count
      })),
      mostNeededSubjects: Object.entries(subjectCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([subject, count]) => ({ subject, count })),
      preferredResources: Object.entries(resourceCount)
        .sort((a, b) => b[1] - a[1])
        .map(([resource, count]) => ({ 
          resource: formatResourceLabel(resource), 
          count 
        })),
      recentComments,
      surveyTrends: trends
    };
  };

  const formatFrequencyLabel = (frequency: string): string => {
    const frequencyMap: { [key: string]: string } = {
      'daily': 'Daily',
      'weekly': 'Weekly', 
      'monthly': 'Monthly',
      'rarely': 'Rarely'
    };
    return frequencyMap[frequency] || frequency;
  };

  const formatResourceLabel = (resource: string): string => {
    const resourceMap: { [key: string]: string } = {
      'Previous exam question papers': 'Exam Papers',
      'Study guides': 'Study Guides',
      'Online tutorials': 'Online Tutorials',
      'Educational videos': 'Educational Videos'
    };
    return resourceMap[resource] || resource;
  };

  const exportToCSV = () => {
    if (!data) return;

    const headers = ['Metric', 'Value'];
    const csvData = [
      ['Total Surveys', data.totalSurveys],
      ...data.studyFrequency.map(item => [`Online Study Frequency - ${item.frequency}`, item.count]),
      ...data.mostNeededSubjects.map(item => [`Most Needed Subject - ${item.subject}`, item.count]),
      ...data.preferredResources.map(item => [`Preferred Resource - ${item.resource}`, item.count])
    ];

    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `survey-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button 
            onClick={loadAnalytics}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Survey Data Available</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Analytics will appear here once students start submitting surveys.
          </p>
          <button 
            onClick={loadAnalytics}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  // If data exists but has no surveys
  if (data.totalSurveys === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Survey Analytics</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Insights from student feedback based on your survey questions
              </p>
            </div>
            <div className="flex space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="all">All Time</option>
              </select>
              <button
                onClick={loadAnalytics}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Refresh
              </button>
            </div>
          </div>
          
          <div className="text-center py-12">
            <Users className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No Survey Responses Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              {timeRange === 'all' 
                ? 'No survey responses have been submitted yet. Once students start submitting feedback, their analytics will appear here.'
                : `No survey responses found for the selected time range (${timeRange}). Try selecting "All Time" or encourage more students to participate.`
              }
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 max-w-2xl mx-auto">
              <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                How to get survey responses:
              </h4>
              <ul className="text-left text-blue-800 dark:text-blue-200 space-y-2">
                <li>• Students see the survey when they log out</li>
                <li>• Encourage students to complete the feedback form</li>
                <li>• Survey responses help improve the library experience</li>
                <li>• Data will automatically appear here once submitted</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Survey Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Insights from student feedback based on your survey questions
            </p>
          </div>
          <div className="flex space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="all">All Time</option>
            </select>
            <button
              onClick={loadAnalytics}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-2"
            >
              Refresh Data
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Surveys</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.totalSurveys}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Most Needed Subject</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
                  {data.mostNeededSubjects[0]?.subject || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Most Wanted Resource</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
                  {data.preferredResources[0]?.resource || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Student Comments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.recentComments.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Online Study Frequency */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              How often students use online resources for studying
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.studyFrequency}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ frequency, percent }) => `${frequency} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.studyFrequency.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Preferred Resources */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Most wanted resource types in the digital library
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.preferredResources}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="resource" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Most Needed Subjects */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Subjects students need most resources for
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.mostNeededSubjects}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Survey Trends */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Survey submissions trend (Last 7 Days)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.surveyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Student Comments & Suggestions */}
        {data.recentComments.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Student Comments & Suggestions
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {data.recentComments.map((comment, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <p className="text-gray-700 dark:text-gray-300 italic">"{comment}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;