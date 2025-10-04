import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  GraduationCap, 
  FileText, 
  TrendingUp, 
  Users, 
  Star,
  Clock,
  Award,
  ChevronRight,
  Search
} from 'lucide-react';
import { getPapers } from '../../services/supabaseService';
import { PaperMetadata } from '../../services/githubService';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [recentPapers, setRecentPapers] = useState<(PaperMetadata & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchRecentPapers = async () => {
      try {
        const result = await getPapers();
        if (result.success) {
          // Get the 6 most recent papers
          setRecentPapers(result.papers.slice(0, 6));
        }
      } catch (error) {
        console.error('Error fetching recent papers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPapers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to past papers with search term
      navigate(`/past-papers?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const libraryStats = [
    { label: 'Available Papers', value: '500+', icon: FileText, color: 'blue' },
    { label: 'Textbooks', value: '150+', icon: BookOpen, color: 'green' },
    { label: 'Study Guides', value: '200+', icon: GraduationCap, color: 'purple' },
    { label: 'Active Students', value: '1,200+', icon: Users, color: 'orange' }
  ];

  const quickActions = [
    {
      title: 'Browse Books',
      description: 'Access digital textbooks for all subjects',
      icon: BookOpen,
      color: 'blue',
      action: () => navigate('/books')
    },
    {
      title: 'Study Guides',
      description: 'Find comprehensive study materials',
      icon: GraduationCap,
      color: 'green',
      action: () => navigate('/study-guides')
    },
    {
      title: 'Past Papers',
      description: 'Practice with previous exam papers',
      icon: FileText,
      color: 'purple',
      action: () => navigate('/past-papers')
    }
  ];

  const featuredSubjects = [
    { name: 'Mathematics', papers: 85, icon: '🔢', gradient: 'from-blue-500 to-blue-600' },
    { name: 'Life Sciences', papers: 72, icon: '🧬', gradient: 'from-green-500 to-green-600' },
    { name: 'Physical Sciences', papers: 68, icon: '⚗️', gradient: 'from-purple-500 to-purple-600' },
    { name: 'Geography', papers: 45, icon: '🌍', gradient: 'from-orange-500 to-orange-600' },
    { name: 'Accounting', papers: 52, icon: '📚', gradient: 'from-red-500 to-red-600' },
    { name: 'Mathematical Literacy', papers: 38, icon: '💼', gradient: 'from-indigo-500 to-indigo-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 sm:py-16 md:py-20 xl:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight max-w-5xl mx-auto">
              Unlock knowledge. Succeed with confidence.
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl xl:text-3xl mb-6 sm:mb-8 text-blue-100 max-w-4xl mx-auto px-4">
              KnowledgeHub — a free digital library for South African high school students.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-xs sm:max-w-md md:max-w-2xl xl:max-w-3xl mx-auto px-4">
              <div className="relative">
                <Search className="h-5 w-5 sm:h-6 sm:w-6 absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for books, papers, study guides..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-20 sm:pr-24 py-3 sm:py-4 text-base sm:text-lg rounded-full border-0 text-gray-900 placeholder-gray-500 focus:ring-4 focus:ring-white/20"
                />
                <button
                  type="submit"
                  className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-full hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  <span className="hidden sm:inline">Search</span>
                  <span className="sm:hidden">Go</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Library Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {libraryStats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center">
                <div className={`p-2 sm:p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900 flex-shrink-0`}>
                  <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0">
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 text-center">
            What would you like to explore?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
            {quickActions.map((action, index) => (
              <div
                key={index}
                onClick={action.action}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className={`p-3 sm:p-4 rounded-lg bg-${action.color}-100 dark:bg-${action.color}-900 w-fit mb-4`}>
                  <action.icon className={`h-6 w-6 sm:h-8 sm:w-8 text-${action.color}-600 dark:text-${action.color}-400`} />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
                  {action.description}
                </p>
                <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-1 transition-transform text-sm sm:text-base">
                  Explore <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Subjects */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 text-center">
            Subjects Available
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
            {featuredSubjects.map((subject, index) => (
              <div
                key={index}
                onClick={() => navigate(`/past-papers?subject=${encodeURIComponent(subject.name)}`)}
                className={`bg-gradient-to-r ${subject.gradient} rounded-xl p-4 sm:p-6 text-white cursor-pointer hover:scale-105 transition-transform`}
              >
                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{subject.icon}</div>
                <h3 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2">{subject.name}</h3>
                <p className="text-xs sm:text-sm opacity-90">{subject.papers} resources</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Papers */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Recently Added Papers
            </h2>
            <button
              onClick={() => navigate('/past-papers')}
              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium self-start sm:self-auto"
            >
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 animate-pulse">
                  <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                  <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
              {recentPapers.map(paper => (
                <div key={paper.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-shadow p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3">
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                      Grade {paper.grade}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 text-sm sm:text-base">
                    {paper.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {paper.subject} • {paper.year}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {paper.province} • {paper.examType}
                  </p>
                </div>
              ))}
            </div>
          )}

          {!loading && recentPapers.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No papers available yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Papers will appear here once they are uploaded by administrators
              </p>
            </div>
          )}
        </div>

        {/* About KnowledgeHub */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 mb-8 sm:mb-12 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">About KnowledgeHub</h2>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-4">
            Empowering high school students in South Africa with a digital library that fosters academic
            excellence, promotes lifelong learning, and bridges the knowledge gap.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Easy access</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Educational resources and research materials at your fingertips.</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Academic excellence</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Support better learning outcomes with past papers and guides.</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:col-span-2 lg:col-span-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Bridge the gap</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Promote digital literacy and equitable resource access.</p>
            </div>
          </div>
        </div>

        {/* Study Tips */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl p-6 sm:p-8 text-white">
          <div className="text-center">
            <Award className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Study Tips for Success</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-left">
              <div className="bg-white/10 rounded-lg p-4">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 mb-2" />
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Regular Study Schedule</h3>
                <p className="text-xs sm:text-sm opacity-90">Set aside dedicated time each day for studying different subjects.</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <Star className="h-5 w-5 sm:h-6 sm:w-6 mb-2" />
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Practice Past Papers</h3>
                <p className="text-xs sm:text-sm opacity-90">Use our extensive collection of past papers to prepare for exams.</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 sm:col-span-2 lg:col-span-1">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 mb-2" />
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Track Your Progress</h3>
                <p className="text-xs sm:text-sm opacity-90">Monitor your improvement and focus on areas that need attention.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;