import React, { useState } from 'react';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { papers, UploadMetadata } from '../../lib/supabase';

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

const PROVINCES = ['KwaZulu-Natal', 'Gauteng'];
const GRADES = ['10', '11', '12'];
const EXAM_TYPES = ['Mid-Year', 'Final', 'Trial', 'Supplementary'];

interface UploadPaperProps {
  onUploadSuccess: () => void;
}

const UploadPaper: React.FC<UploadPaperProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<UploadMetadata>({
    title: '',
    grade: '',
    subject: '',
    province: '',
    examType: '',
    year: '2023',
    description: '',
    publisher: '',
    format: 'PDF',
    identifier: ''
  });
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      
      // Validate file size (25MB limit)
      if (selectedFile.size > 25 * 1024 * 1024) {
        setError('File size too large. Maximum size is 25MB.');
        return;
      }
      
      setFile(selectedFile);
      setError('');
      setSuccess(false);
    }
  };

  const handleMetadataChange = (field: keyof PaperMetadata, value: string) => {
    setMetadata(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!file) {
      setError('Please select a PDF file');
      return;
    }
    
    if (!metadata.title.trim()) {
      setError('Please enter a title');
      return;
    }
    
    if (!metadata.grade) {
      setError('Please select a grade');
      return;
    }
    
    if (!metadata.subject) {
      setError('Please select a subject');
      return;
    }
    
    if (!metadata.province) {
      setError('Please select a province');
      return;
    }
    
    if (!metadata.examType) {
      setError('Please select an exam type');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Upload to Supabase
      const uploadResult = await papers.uploadPaper(file, metadata);
      
      if (uploadResult.success && uploadResult.paper) {
        // Paper uploaded successfully to Supabase
        setSuccess(true);
        setFile(null);
        setMetadata({
          title: '',
          grade: '',
          subject: '',
          province: '',
          examType: '',
          year: '2023',
          description: '',
          publisher: '',
          format: 'PDF',
          identifier: ''
        });
        onUploadSuccess();
        
        // Reset form
        const form = document.getElementById('upload-form') as HTMLFormElement;
        if (form) form.reset();
      } else {
        setError(uploadResult.error || 'Failed to upload file');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Upload New Paper
        </h2>

        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-md p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-green-700 dark:text-green-200">
                  Paper uploaded successfully!
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form id="upload-form" onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              PDF File
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                      Click to upload PDF file
                    </span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept=".pdf"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                  {file && (
                    <div className="mt-2 flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                      <FileText className="h-4 w-4 mr-1" />
                      {file.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                required
                value={metadata.title}
                onChange={(e) => handleMetadataChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Grade
              </label>
              <select
                required
                value={metadata.grade}
                onChange={(e) => handleMetadataChange('grade', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Grade</option>
                {GRADES.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject
              </label>
              <select
                required
                value={metadata.subject}
                onChange={(e) => handleMetadataChange('subject', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Subject</option>
                {SUBJECTS.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Province
              </label>
              <select
                required
                value={metadata.province}
                onChange={(e) => handleMetadataChange('province', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Province</option>
                {PROVINCES.map(province => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Exam Type
              </label>
              <select
                required
                value={metadata.examType}
                onChange={(e) => handleMetadataChange('examType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Exam Type</option>
                {EXAM_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Year
              </label>
              <input
                type="number"
                min="2020"
                max="2024"
                required
                value={metadata.year}
                onChange={(e) => handleMetadataChange('year', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={metadata.description}
              onChange={(e) => handleMetadataChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="Brief description of the paper..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Publisher
              </label>
              <input
                type="text"
                value={metadata.publisher}
                onChange={(e) => handleMetadataChange('publisher', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Department of Education"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Identifier
              </label>
              <input
                type="text"
                value={metadata.identifier}
                onChange={(e) => handleMetadataChange('identifier', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Unique identifier"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploading || !file}
              className="px-6 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload Paper'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadPaper;