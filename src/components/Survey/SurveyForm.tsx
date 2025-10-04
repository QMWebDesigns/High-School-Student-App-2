import React, { useState } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { submitSurvey, SurveyData } from '../../services/supabaseService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const SUBJECTS = [
  'Life Sciences',
  'Physical Sciences',
  'Geography',
  'Mathematics',
  'Business Studies',
  'Accounting',
  'History',
  'Mathematical Literacy'
];

const STUDY_FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: '2-3 times per week' },
  { value: 'weekly', label: 'Once a week' },
  { value: 'monthly', label: 'Few times a month' },
  { value: 'rarely', label: 'Rarely' }
];

const PREFERRED_RESOURCES = [
  'Past Exam Papers',
  'Study Guides',
  'Video Tutorials',
  'Interactive Quizzes',
  'Mind Maps',
  'Practice Tests',
  'Notes & Summaries'
];

interface SurveyFormProps {
  onSubmit?: (surveyData: SurveyData) => void;
  variant?: 'page' | 'modal';
}

const SurveyForm: React.FC<SurveyFormProps> = ({ onSubmit, variant = 'page' }) => {
  const [formData, setFormData] = useState({
    subjects: [] as string[],
    studyFrequency: '',
    preferredResources: [] as string[],
    additionalComments: '',
    contactEmail: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSubjectChange = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleResourceChange = (resource: string) => {
    setFormData(prev => ({
      ...prev,
      preferredResources: prev.preferredResources.includes(resource)
        ? prev.preferredResources.filter(r => r !== resource)
        : [...prev.preferredResources, resource]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const studentEmail = currentUser?.email || formData.contactEmail.trim();
    if (!studentEmail) {
      setError('Please provide your email address');
      return;
    }

    if (formData.subjects.length === 0) {
      setError('Please select at least one subject');
      return;
    }

    if (!formData.studyFrequency) {
      setError('Please select your study frequency');
      return;
    }

    setSubmitting(true);
    setError('');

    const surveyData: SurveyData = {
      student_email: studentEmail,
      most_needed_subjects: formData.subjects,
      study_frequency: formData.studyFrequency,
      preferred_resources: formData.preferredResources,
      additional_comments: formData.additionalComments
    };

    try {
      const result = await submitSurvey(surveyData);
      
      if (result.success) {
        setSubmitted(true);
        if (onSubmit) {
          onSubmit(surveyData);
        } else {
          navigate('/login');
        }
      } else {
        setError(result.error || 'Failed to submit survey');
      }
    } catch (e: unknown) {
      console.error('Survey submit error:', e);
      setError('An unexpected error occurred while submitting. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    if (variant === 'modal') {
      return (
        <div className="w-full">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Thank You!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your feedback has been submitted successfully.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Redirecting to login page...
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Thank You!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your feedback has been submitted successfully.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Redirecting to login page...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={variant === 'modal' ? 'py-2' : 'min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8'}>
      <div className={variant === 'modal' ? 'max-w-2xl mx-auto' : 'max-w-3xl mx-auto'}>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Help Us Improve
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Your feedback helps us provide better resources for students
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}
            {!currentUser?.email && (
              <div>
                <label htmlFor="contactEmail" className="block text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Your email address
                </label>
                <input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({...prev, contactEmail: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="name@example.com"
                />
              </div>
            )}

          <div className={variant === 'modal' ? 'max-h-[70vh] overflow-y-auto pr-1' : ''}>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-lg font-medium text-gray-900 dark:text-white mb-4">
                Which subjects do you need resources for? (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SUBJECTS.map(subject => (
                  <label key={subject} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.subjects.includes(subject)}
                      onChange={() => handleSubjectChange(subject)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {subject}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-900 dark:text-white mb-4">
                How frequently do you study online?
              </label>
              <div className="space-y-2">
                {STUDY_FREQUENCIES.map((frequency, index) => (
                  <label key={index} className="flex items-center">
                    <input
                      type="radio"
                      name="studyFrequency"
                      value={frequency.value}
                      checked={formData.studyFrequency === frequency.value}
                      onChange={(e) => setFormData(prev => ({...prev, studyFrequency: e.target.value}))}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {frequency.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-900 dark:text-white mb-4">
                What types of resources do you find most helpful? (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PREFERRED_RESOURCES.map(resource => (
                  <label key={resource} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.preferredResources.includes(resource)}
                      onChange={() => handleResourceChange(resource)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {resource}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="comments" className="block text-lg font-medium text-gray-900 dark:text-white mb-4">
                Additional comments or suggestions (optional)
              </label>
              <textarea
                id="comments"
                rows={4}
                value={formData.additionalComments}
                onChange={(e) => setFormData(prev => ({...prev, additionalComments: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Share any suggestions or feedback..."
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Survey'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyForm;