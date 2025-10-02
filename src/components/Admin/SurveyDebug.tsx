import React, { useState } from 'react';
import { getSurveys } from '../../services/supabaseService';
import { Database, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

const SurveyDebug: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testSurveyFetch = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🔍 Testing survey data fetch...');
      const surveyResult = await getSurveys();
      
      console.log('📊 Survey fetch result:', surveyResult);
      setResult(surveyResult);
      
      if (!surveyResult.success) {
        setError(surveyResult.error || 'Unknown error');
      }
    } catch (err) {
      console.error('❌ Error testing survey fetch:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Database className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Survey Data Debug Tool
          </h3>
        </div>
        <button
          onClick={testSurveyFetch}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Testing...' : 'Test Survey Fetch'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
            <span className="text-red-800 dark:text-red-200 font-medium">Error:</span>
          </div>
          <p className="text-red-700 dark:text-red-300 mt-1">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            <span className="text-green-800 dark:text-green-200 font-medium">
              {result.success ? 'Connection Successful' : 'Connection Failed'}
            </span>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Raw Result:</h4>
            <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>

          {result.success && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Survey Count: {result.surveys?.length || 0}
                </h4>
                {result.surveys?.length > 0 && (
                  <div className="space-y-2 text-sm">
                    <p className="text-blue-800 dark:text-blue-200">
                      Latest: {result.surveys[0]?.timestamp || 'N/A'}
                    </p>
                    <p className="text-blue-800 dark:text-blue-200">
                      Student: {result.surveys[0]?.studentEmail || 'N/A'}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                  Data Structure Check
                </h4>
                {result.surveys?.length > 0 && (
                  <div className="space-y-1 text-xs">
                    <p className="text-purple-800 dark:text-purple-200">
                      ✅ Has ID: {result.surveys[0]?.id ? 'Yes' : 'No'}
                    </p>
                    <p className="text-purple-800 dark:text-purple-200">
                      ✅ Has Email: {result.surveys[0]?.studentEmail ? 'Yes' : 'No'}
                    </p>
                    <p className="text-purple-800 dark:text-purple-200">
                      ✅ Has Subjects: {Array.isArray(result.surveys[0]?.subjects) ? `Yes (${result.surveys[0]?.subjects?.length})` : 'No'}
                    </p>
                    <p className="text-purple-800 dark:text-purple-200">
                      ✅ Has Frequency: {result.surveys[0]?.studyFrequency ? 'Yes' : 'No'}
                    </p>
                    <p className="text-purple-800 dark:text-purple-200">
                      ✅ Has Resources: {Array.isArray(result.surveys[0]?.preferredResources) ? `Yes (${result.surveys[0]?.preferredResources?.length})` : 'No'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {result.success && result.surveys?.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Sample Survey Data:</h4>
              <div className="text-sm space-y-2">
                {result.surveys.slice(0, 3).map((survey: any, index: number) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded p-3">
                    <p><strong>Email:</strong> {survey.studentEmail}</p>
                    <p><strong>Subjects:</strong> {Array.isArray(survey.subjects) ? survey.subjects.join(', ') : 'None'}</p>
                    <p><strong>Frequency:</strong> {survey.studyFrequency}</p>
                    <p><strong>Resources:</strong> {Array.isArray(survey.preferredResources) ? survey.preferredResources.join(', ') : 'None'}</p>
                    <p><strong>Comments:</strong> {survey.additionalComments || 'None'}</p>
                    <p><strong>Timestamp:</strong> {survey.timestamp}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">Troubleshooting Tips:</h4>
        <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
          <li>1. Make sure you have surveys in your Supabase database</li>
          <li>2. Check that Row Level Security policies allow reading surveys</li>
          <li>3. Verify the admin user has proper permissions</li>
          <li>4. Run the debug SQL script provided to check data structure</li>
          <li>5. Check browser console for detailed error messages</li>
        </ul>
      </div>
    </div>
  );
};

export default SurveyDebug;