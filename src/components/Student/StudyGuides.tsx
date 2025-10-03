import React, { useState, useEffect } from 'react';
import { Search, GraduationCap, Download, Clock, BookOpen, Star, Eye } from 'lucide-react';
import { getStudyGuides } from '../../services/libraryService';

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

const StudyGuides: React.FC = () => {
  const [guides, setGuides] = useState<StudyGuide[]>([]);
  const [filteredGuides, setFilteredGuides] = useState<StudyGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    grade: '',
    subject: '',
    difficulty: '',
    topic: ''
  });

  // Sample study guides data
  const sampleGuides: StudyGuide[] = [
    {
      id: '1',
      title: 'Calculus Quick Reference Guide',
      subject: 'Mathematics',
      grade: '12',
      topic: 'Calculus',
      description: 'Essential calculus formulas, derivatives, and integrals with step-by-step examples.',
      author: 'Dr. Sarah Johnson',
      difficulty: 'Advanced',
      estimatedTime: '2 hours',
      downloadUrl: '#',
      previewUrl: '#',
      rating: 4.8,
      downloads: 1250,
      pages: 24,
      format: 'PDF',
      lastUpdated: '2024-01-15',
      tags: ['derivatives', 'integrals', 'limits', 'formulas']
    },
    {
      id: '2',
      title: 'Photosynthesis Study Guide',
      subject: 'Life Sciences',
      grade: '11',
      topic: 'Plant Biology',
      description: 'Comprehensive guide to photosynthesis process, light and dark reactions, and factors affecting photosynthesis.',
      author: 'Prof. Michael Chen',
      difficulty: 'Intermediate',
      estimatedTime: '1.5 hours',
      downloadUrl: '#',
      previewUrl: '#',
      rating: 4.6,
      downloads: 980,
      pages: 18,
      format: 'PDF',
      lastUpdated: '2024-01-10',
      tags: ['photosynthesis', 'chloroplast', 'light reactions', 'Calvin cycle']
    },
    {
      id: '3',
      title: 'Chemical Bonding Essentials',
      subject: 'Physical Sciences',
      grade: '10',
      topic: 'Chemistry',
      description: 'Master ionic, covalent, and metallic bonding with clear diagrams and practice problems.',
      author: 'Dr. Emily Rodriguez',
      difficulty: 'Beginner',
      estimatedTime: '1 hour',
      downloadUrl: '#',
      previewUrl: '#',
      rating: 4.7,
      downloads: 1430,
      pages: 16,
      format: 'PDF',
      lastUpdated: '2024-01-08',
      tags: ['ionic bonding', 'covalent bonding', 'metallic bonding', 'lewis structures']
    },
    {
      id: '4',
      title: 'World War II Timeline',
      subject: 'History',
      grade: '11',
      topic: 'Modern History',
      description: 'Detailed timeline of WWII events with key dates, battles, and turning points.',
      author: 'Dr. Robert Taylor',
      difficulty: 'Intermediate',
      estimatedTime: '45 minutes',
      downloadUrl: '#',
      previewUrl: '#',
      rating: 4.5,
      downloads: 756,
      pages: 12,
      format: 'PDF',
      lastUpdated: '2024-01-05',
      tags: ['WWII', 'timeline', 'battles', 'axis powers', 'allied forces']
    },
    {
      id: '5',
      title: 'Climate and Weather Patterns',
      subject: 'Geography',
      grade: '12',
      topic: 'Physical Geography',
      description: 'Understanding global climate systems, weather patterns, and climate change impacts.',
      author: 'Dr. James Wilson',
      difficulty: 'Advanced',
      estimatedTime: '2.5 hours',
      downloadUrl: '#',
      previewUrl: '#',
      rating: 4.9,
      downloads: 892,
      pages: 32,
      format: 'PDF',
      lastUpdated: '2024-01-12',
      tags: ['climate', 'weather', 'global warming', 'precipitation', 'temperature']
    },
    {
      id: '6',
      title: 'Financial Statements Analysis',
      subject: 'Business Studies',
      grade: '12',
      topic: 'Accounting',
      description: 'Learn to analyze financial statements, ratios, and make informed business decisions.',
      author: 'Prof. Lisa Anderson',
      difficulty: 'Advanced',
      estimatedTime: '3 hours',
      downloadUrl: '#',
      previewUrl: '#',
      rating: 4.4,
      downloads: 634,
      pages: 28,
      format: 'PDF',
      lastUpdated: '2024-01-07',
      tags: ['financial statements', 'ratios', 'analysis', 'accounting', 'business']
    },
    {
      id: '7',
      title: 'Algebra Fundamentals',
      subject: 'Mathematical Literacy',
      grade: '10',
      topic: 'Basic Algebra',
      description: 'Essential algebra concepts including equations, inequalities, and graphing.',
      author: 'Ms. Jennifer Smith',
      difficulty: 'Beginner',
      estimatedTime: '1.5 hours',
      downloadUrl: '#',
      previewUrl: '#',
      rating: 4.6,
      downloads: 1125,
      pages: 20,
      format: 'PDF',
      lastUpdated: '2024-01-14',
      tags: ['algebra', 'equations', 'inequalities', 'graphing', 'variables']
    },
    {
      id: '8',
      title: 'Human Anatomy Quick Reference',
      subject: 'Life Sciences',
      grade: '12',
      topic: 'Human Biology',
      description: 'Complete reference for human body systems with labeled diagrams and functions.',
      author: 'Dr. Patricia Adams',
      difficulty: 'Intermediate',
      estimatedTime: '2 hours',
      downloadUrl: '#',
      previewUrl: '#',
      rating: 4.8,
      downloads: 1067,
      pages: 36,
      format: 'PDF',
      lastUpdated: '2024-01-11',
      tags: ['anatomy', 'human body', 'systems', 'organs', 'physiology']
    }
  ];

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

  useEffect(() => {
    const fetchStudyGuides = async () => {
      try {
        const result = await getStudyGuides();
        if (result.success) {
          setGuides(result.guides);
          setFilteredGuides(result.guides);
        } else {
          console.error('Failed to fetch study guides:', result.error);
          // Fallback to sample data if API fails
          setGuides(sampleGuides);
          setFilteredGuides(sampleGuides);
        }
      } catch (error) {
        console.error('Error fetching study guides:', error);
        // Fallback to sample data if API fails
        setGuides(sampleGuides);
        setFilteredGuides(sampleGuides);
      } finally {
        setLoading(false);
      }
    };

    fetchStudyGuides();
  }, []);

  useEffect(() => {
    let filtered = guides.filter(guide => {
      const matchesSearch = 
        guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesFilters = 
        (filters.grade === '' || guide.grade === filters.grade) &&
        (filters.subject === '' || guide.subject === filters.subject) &&
        (filters.difficulty === '' || guide.difficulty === filters.difficulty) &&
        (filters.topic === '' || guide.topic.toLowerCase().includes(filters.topic.toLowerCase()));

      return matchesSearch && matchesFilters;
    });

    setFilteredGuides(filtered);
  }, [guides, searchTerm, filters]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      grade: '',
      subject: '',
      difficulty: '',
      topic: ''
    });
    setSearchTerm('');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Study Guides</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Comprehensive study materials to help you excel
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm animate-pulse p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Study Guides</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Comprehensive study materials and quick references for all subjects
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search study guides by title, subject, topic, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <select
              value={filters.grade}
              onChange={(e) => handleFilterChange('grade', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Grades</option>
              {GRADES.map(grade => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>

            <select
              value={filters.subject}
              onChange={(e) => handleFilterChange('subject', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Subjects</option>
              {SUBJECTS.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>

            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Difficulties</option>
              {DIFFICULTIES.map(difficulty => (
                <option key={difficulty} value={difficulty}>{difficulty}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Topic"
              value={filters.topic}
              onChange={(e) => handleFilterChange('topic', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {filteredGuides.length} of {guides.length} study guides
          </p>
        </div>

        {/* Study Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.map(guide => (
            <div key={guide.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all group">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <GraduationCap className="h-8 w-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-center">
                      Grade {guide.grade}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full text-center ${getDifficultyColor(guide.difficulty)}`}>
                      {guide.difficulty}
                    </span>
                  </div>
                </div>
                
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {guide.title}
                </h3>
                
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <p>{guide.subject} • {guide.topic}</p>
                  <p>by {guide.author}</p>
                </div>

                <div className="flex items-center mb-3">
                  {renderStars(guide.rating)}
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    {guide.rating} ({guide.downloads} downloads)
                  </span>
                </div>

                <div className="flex items-center text-sm text-gray-500 dark:text-gray-500 mb-3">
                  <Clock className="h-4 w-4 mr-1" />
                  {guide.estimatedTime}
                  <span className="mx-2">•</span>
                  <BookOpen className="h-4 w-4 mr-1" />
                  {guide.pages} pages
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {guide.description}
                </p>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {guide.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                    {guide.tags.length > 3 && (
                      <span className="text-xs text-gray-500 dark:text-gray-500 px-2 py-1">
                        +{guide.tags.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  {guide.previewUrl && (
                    <button 
                      onClick={() => {
                        console.log('Previewing guide:', guide.title, 'URL:', guide.previewUrl);
                        if (guide.previewUrl) {
                          window.open(guide.previewUrl, '_blank');
                        } else {
                          alert('Preview URL not available');
                        }
                      }}
                      className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </button>
                  )}
                  {guide.downloadUrl && (
                    <button 
                      onClick={() => {
                        console.log('Downloading guide:', guide.title, 'URL:', guide.downloadUrl);
                        if (guide.downloadUrl) {
                          window.open(guide.downloadUrl, '_blank');
                        } else {
                          alert('Download URL not available');
                        }
                      }}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </button>
                  )}
                </div>

                <div className="mt-3 text-xs text-gray-500 dark:text-gray-500">
                  Updated: {new Date(guide.lastUpdated).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredGuides.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No study guides found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyGuides;