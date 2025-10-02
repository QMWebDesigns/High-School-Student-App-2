import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, GraduationCap, Download, Eye } from 'lucide-react';
import { getStudyGuides as fetchGuidesFromApi, saveStudyGuide as saveGuideToApi, updateStudyGuide as updateGuideInApi, deleteStudyGuide as deleteGuideFromApi } from '../../services/libraryService';

interface StudyGuide {
  id: string;
  title: string;
  subject: string;
  grade: string;
  topic: string;
  description: string;
  author: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  downloadUrl?: string;
  previewUrl?: string;
  rating: number;
  downloads: number;
  pages: number;
  format: string;
  lastUpdated: string;
  tags: string[];
}

const StudyGuideManagement: React.FC = () => {
  const [guides, setGuides] = useState<StudyGuide[]>([]);
  const [filteredGuides, setFilteredGuides] = useState<StudyGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGuide, setEditingGuide] = useState<StudyGuide | null>(null);
  const [filters, setFilters] = useState({
    grade: '',
    subject: '',
    difficulty: ''
  });

  // Data is loaded from Supabase via libraryService

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

  useEffect(() => {
    const loadGuides = async () => {
      setLoading(true);
      const result = await fetchGuidesFromApi();
      if (result.success) {
        setGuides(result.guides);
        setFilteredGuides(result.guides);
      }
      setLoading(false);
    };
    loadGuides();
  }, []);

  useEffect(() => {
    let filtered = guides.filter(guide => {
      const matchesSearch = 
        guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesFilters = 
        (filters.grade === '' || guide.grade === filters.grade) &&
        (filters.subject === '' || guide.subject === filters.subject) &&
        (filters.difficulty === '' || guide.difficulty === filters.difficulty);

      return matchesSearch && matchesFilters;
    });

    setFilteredGuides(filtered);
  }, [guides, searchTerm, filters]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this study guide?')) return;
    const res = await deleteGuideFromApi(id);
    if (res.success) {
      setGuides(guides.filter(guide => guide.id !== id));
      setFilteredGuides(filteredGuides.filter(guide => guide.id !== id));
    } else {
      alert(res.error || 'Failed to delete study guide');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const StudyGuideForm: React.FC<{ 
    guide?: StudyGuide; 
    onSave: (guide: StudyGuide) => void; 
    onCancel: () => void 
  }> = ({ guide, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<StudyGuide>>(guide || {
      title: '',
      subject: '',
      grade: '',
      topic: '',
      description: '',
      author: '',
      difficulty: 'Beginner',
      estimatedTime: '',
      downloadUrl: '',
      previewUrl: '',
      rating: 0,
      downloads: 0,
      pages: 0,
      format: 'PDF',
      lastUpdated: new Date().toISOString().split('T')[0],
      tags: []
    });

    const [tagInput, setTagInput] = useState('');

    const handleAddTag = () => {
      if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
        setFormData({
          ...formData,
          tags: [...(formData.tags || []), tagInput.trim()]
        });
        setTagInput('');
      }
    };

    const handleRemoveTag = (tagToRemove: string) => {
      setFormData({
        ...formData,
        tags: formData.tags?.filter(tag => tag !== tagToRemove) || []
      });
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const { id: _ignored, ...rest } = (formData as StudyGuide);
      const guideData: StudyGuide = {
        ...rest,
        id: guide?.id || Date.now().toString()
      };
      await onSave(guideData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {guide ? 'Edit Study Guide' : 'Add New Study Guide'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject
                  </label>
                  <select
                    required
                    value={formData.subject || ''}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Subject</option>
                    {SUBJECTS.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Grade
                  </label>
                  <select
                    required
                    value={formData.grade || ''}
                    onChange={(e) => setFormData({...formData, grade: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Grade</option>
                    {GRADES.map(grade => (
                      <option key={grade} value={grade}>Grade {grade}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Topic
                  </label>
                  <input
                    type="text"
                    value={formData.topic || ''}
                    onChange={(e) => setFormData({...formData, topic: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Author
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.author || ''}
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty || 'Beginner'}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    {DIFFICULTIES.map(difficulty => (
                      <option key={difficulty} value={difficulty}>{difficulty}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estimated Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 2 hours"
                    value={formData.estimatedTime || ''}
                    onChange={(e) => setFormData({...formData, estimatedTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Format
                  </label>
                  <select
                    value={formData.format || 'PDF'}
                    onChange={(e) => setFormData({...formData, format: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    {FORMATS.map(format => (
                      <option key={format} value={format}>{format}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pages
                  </label>
                  <input
                    type="number"
                    value={formData.pages || ''}
                    onChange={(e) => setFormData({...formData, pages: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Download URL
                  </label>
                  <input
                    type="url"
                    value={formData.downloadUrl || ''}
                    onChange={(e) => setFormData({...formData, downloadUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Preview URL
                  </label>
                  <input
                    type="url"
                    value={formData.previewUrl || ''}
                    onChange={(e) => setFormData({...formData, previewUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {guide ? 'Update' : 'Add'} Study Guide
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const handleSave = async (guideData: StudyGuide) => {
    if (editingGuide) {
      const { id, ...update } = guideData;
      const res = await updateGuideInApi(id, update);
      if (res.success) {
        const updated = guides.map(g => (g.id === id ? { ...g, ...guideData } : g));
        setGuides(updated);
        setFilteredGuides(updated);
      } else {
        alert(res.error || 'Failed to update study guide');
        return;
      }
    } else {
      const { id: _tempId, ...create } = guideData as Omit<StudyGuide, 'id'> & { id?: string };
      const res = await saveGuideToApi(create as any);
      if (res.success) {
        const created: StudyGuide = { ...(create as StudyGuide), id: String(res.id) };
        const next = [...guides, created];
        setGuides(next);
        setFilteredGuides(next);
      } else {
        alert(res.error || 'Failed to create study guide');
        return;
      }
    }
    setShowAddModal(false);
    setEditingGuide(null);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading study guides...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Study Guide Management</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Study Guide
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search study guides..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <select
            value={filters.grade}
            onChange={(e) => setFilters({...filters, grade: e.target.value})}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Grades</option>
            {GRADES.map(grade => (
              <option key={grade} value={grade}>Grade {grade}</option>
            ))}
          </select>
          
          <select
            value={filters.subject}
            onChange={(e) => setFilters({...filters, subject: e.target.value})}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Subjects</option>
            {SUBJECTS.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
          
          <select
            value={filters.difficulty}
            onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Difficulties</option>
            {DIFFICULTIES.map(difficulty => (
              <option key={difficulty} value={difficulty}>{difficulty}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Study Guides Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Study Guide
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Subject & Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredGuides.map((guide) => (
                <tr key={guide.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <GraduationCap className="h-10 w-10 text-blue-600 dark:text-blue-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {guide.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          by {guide.author}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {guide.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">{guide.subject}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Grade {guide.grade}</div>
                    <span className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${getDifficultyColor(guide.difficulty)}`}>
                      {guide.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">{guide.format}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{guide.pages} pages</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{guide.estimatedTime}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">★ {guide.rating}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{guide.downloads} downloads</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {guide.previewUrl && (
                        <button
                          onClick={() => window.open(guide.previewUrl, '_blank')}
                          className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      {guide.downloadUrl && (
                        <button
                          onClick={() => window.open(guide.downloadUrl, '_blank')}
                          className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setEditingGuide(guide)}
                        className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(guide.id)}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredGuides.length === 0 && (
        <div className="text-center py-8">
          <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No study guides found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Add your first study guide or adjust your search filters
          </p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingGuide) && (
        <StudyGuideForm
          guide={editingGuide || undefined}
          onSave={handleSave}
          onCancel={() => {
            setShowAddModal(false);
            setEditingGuide(null);
          }}
        />
      )}
    </div>
  );
};

export default StudyGuideManagement;