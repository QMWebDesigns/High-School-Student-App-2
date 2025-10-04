import React, { useState } from 'react';
import { Upload, GraduationCap, CheckCircle } from 'lucide-react';
import { saveStudyGuide, uploadGuideFile, uploadGuidePreview } from '../../services/libraryService';

const UploadStudyGuide = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    grade: '',
    topic: '',
    description: '',
    author: '',
    difficulty: 'Beginner',
    estimatedTime: '',
    pages: '',
    format: 'PDF'
  });

  const SUBJECTS = [
    'Mathematics',
    'Life Sciences',
    'Physical Sciences',
    'Geography',
    'Business Studies',
    'History',
    'Accounting',
    'Mathematical Literacy'
  ];

  const GRADES = ['10', '11', '12'];
  const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];
  const FORMATS = ['PDF', 'EPUB', 'Interactive'];

  // These functions are now handled by libraryService

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a study guide file');
      return;
    }
    if (!formData.title || !formData.subject || !formData.grade || !formData.author) {
      setError('Please fill in title, subject, grade, and author');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess(false);

    try {
      let previewUrl = '';
      
      // Upload preview image if provided
      if (previewFile) {
        const previewRes = await uploadGuidePreview(previewFile, formData.title);
        if (!previewRes.success) {
          throw new Error(previewRes.error || 'Failed to upload preview image');
        }
        previewUrl = previewRes.publicUrl || '';
      }

      // Upload study guide file
      const uploadRes = await uploadGuideFile(file, formData.title);
      if (!uploadRes.success || !uploadRes.publicUrl) {
        throw new Error(uploadRes.error || 'Failed to upload study guide');
      }

      // Save to database using libraryService
      const guideData = {
        title: formData.title,
        subject: formData.subject,
        grade: formData.grade,
        topic: formData.topic || '',
        description: formData.description || '',
        author: formData.author,
        difficulty: formData.difficulty as 'Beginner' | 'Intermediate' | 'Advanced',
        estimatedTime: formData.estimatedTime || '',
        downloadUrl: uploadRes.publicUrl,
        previewUrl: previewUrl || '',
        pages: parseInt(formData.pages) || 0,
        format: formData.format,
        rating: 0,
        downloads: 0,
        lastUpdated: new Date().toISOString().split('T')[0],
        tags: []
      };

      const addRes = await saveStudyGuide(guideData);

      if (!addRes.success) {
        throw new Error(addRes.error || 'Failed to save study guide');
      }

      setSuccess(true);
      setFormData({
        title: '', subject: '', grade: '', topic: '', description: '',
        author: '', difficulty: 'Beginner', estimatedTime: '', pages: '', format: 'PDF'
      });
      setFile(null);
      setPreviewFile(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <GraduationCap className="h-6 w-6 mr-2" />
          Upload New Study Guide
        </h2>

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-700 dark:bg-red-900 dark:text-red-200 dark:border-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded border border-green-200 bg-green-50 p-3 text-green-700 dark:bg-green-900 dark:text-green-200 dark:border-green-700 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" /> Study guide uploaded successfully
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Select Subject</option>
                {SUBJECTS.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Grade</label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Select Grade</option>
                {GRADES.map(grade => (
                  <option key={grade} value={grade}>Grade {grade}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Topic</label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Algebra, Cell Biology"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Author</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {DIFFICULTIES.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estimated Time</label>
              <input
                type="text"
                value={formData.estimatedTime}
                onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., 2 hours, 45 minutes"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Format</label>
              <select
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {FORMATS.map(format => (
                  <option key={format} value={format}>{format}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pages</label>
              <input
                type="number"
                value={formData.pages}
                onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Study Guide File (PDF)</label>
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                className="w-full text-sm text-gray-600 dark:text-gray-300"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preview Image (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPreviewFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                className="w-full text-sm text-gray-600 dark:text-gray-300"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Study Guide'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadStudyGuide;