import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Download, Star, Grid, List } from 'lucide-react';
import { getBooks } from '../../services/libraryService';

interface Book {
  id: string;
  title: string;
  author: string;
  subject: string;
  grade: string;
  description: string;
  coverImage: string;
  downloadUrl?: string;
  rating: number;
  pages: number;
  format: string;
  publisher: string;
  year: string;
}

const Books: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    grade: '',
    subject: '',
    author: '',
    format: ''
  });

  // Sample books data for demonstration
  const sampleBooks: Book[] = [
    {
      id: '1',
      title: 'Mathematics Grade 12 Textbook',
      author: 'Dr. Sarah Johnson',
      subject: 'Mathematics',
      grade: '12',
      description: 'Comprehensive mathematics textbook covering all Grade 12 curriculum requirements including calculus, algebra, and geometry.',
      coverImage: '/api/placeholder/300/400',
      downloadUrl: '#',
      rating: 4.8,
      pages: 456,
      format: 'PDF',
      publisher: 'Educational Publishers',
      year: '2024'
    },
    {
      id: '2',
      title: 'Life Sciences: Living Systems',
      author: 'Prof. Michael Chen',
      subject: 'Life Sciences',
      grade: '11',
      description: 'Explore the complexity of living systems with detailed illustrations and practical examples.',
      coverImage: '/api/placeholder/300/400',
      downloadUrl: '#',
      rating: 4.6,
      pages: 389,
      format: 'PDF',
      publisher: 'Science Education Press',
      year: '2024'
    },
    {
      id: '3',
      title: 'Physical Sciences Fundamentals',
      author: 'Dr. Emily Rodriguez',
      subject: 'Physical Sciences',
      grade: '10',
      description: 'Introduction to physics and chemistry concepts with hands-on experiments and real-world applications.',
      coverImage: '/api/placeholder/300/400',
      downloadUrl: '#',
      rating: 4.7,
      pages: 425,
      format: 'PDF',
      publisher: 'Science Works',
      year: '2023'
    },
    {
      id: '4',
      title: 'Geography: Our Changing World',
      author: 'Dr. James Wilson',
      subject: 'Geography',
      grade: '12',
      description: 'Comprehensive study of physical and human geography with contemporary global case studies.',
      coverImage: '/api/placeholder/300/400',
      downloadUrl: '#',
      rating: 4.5,
      pages: 378,
      format: 'PDF',
      publisher: 'World Studies Press',
      year: '2024'
    },
    {
      id: '5',
      title: 'Business Studies: Entrepreneurship',
      author: 'Prof. Lisa Anderson',
      subject: 'Business Studies',
      grade: '11',
      description: 'Learn about business principles, entrepreneurship, and economic systems.',
      coverImage: '/api/placeholder/300/400',
      downloadUrl: '#',
      rating: 4.4,
      pages: 342,
      format: 'PDF',
      publisher: 'Business Education Hub',
      year: '2024'
    },
    {
      id: '6',
      title: 'History: The Modern World',
      author: 'Dr. Robert Taylor',
      subject: 'History',
      grade: '10',
      description: 'Explore major historical events and their impact on the modern world.',
      coverImage: '/api/placeholder/300/400',
      downloadUrl: '#',
      rating: 4.6,
      pages: 412,
      format: 'PDF',
      publisher: 'Historical Perspectives',
      year: '2023'
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
  const FORMATS = ['PDF', 'EPUB', 'Interactive'];

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        console.log('Fetching books from database...');
        const result = await getBooks();
        console.log('Books fetch result:', result);
        if (result.success && result.books.length > 0) {
          console.log('Using real books data:', result.books.length, 'books');
          setBooks(result.books);
          setFilteredBooks(result.books);
        } else {
          console.error('Failed to fetch books or no books found:', result.error);
          console.log('Falling back to sample data');
          // Fallback to sample data if API fails
          setBooks(sampleBooks);
          setFilteredBooks(sampleBooks);
        }
      } catch (error) {
        console.error('Error fetching books:', error);
        console.log('Falling back to sample data due to error');
        // Fallback to sample data if API fails
        setBooks(sampleBooks);
        setFilteredBooks(sampleBooks);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    let filtered = books.filter(book => {
      const matchesSearch = 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilters = 
        (filters.grade === '' || book.grade === filters.grade) &&
        (filters.subject === '' || book.subject === filters.subject) &&
        (filters.author === '' || book.author.toLowerCase().includes(filters.author.toLowerCase())) &&
        (filters.format === '' || book.format === filters.format);

      return matchesSearch && matchesFilters;
    });

    setFilteredBooks(filtered);
  }, [books, searchTerm, filters]);

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
      author: '',
      format: ''
    });
    setSearchTerm('');
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Digital Textbooks</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Access high-quality textbooks for all subjects
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm animate-pulse">
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Digital Textbooks</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Browse and access high-quality textbooks for Grades 10-12
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
                  placeholder="Search books by title, author, subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
              
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

            <input
              type="text"
              placeholder="Author"
              value={filters.author}
              onChange={(e) => handleFilterChange('author', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />

            <select
              value={filters.format}
              onChange={(e) => handleFilterChange('format', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Formats</option>
              {FORMATS.map(format => (
                <option key={format} value={format}>{format}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {filteredBooks.length} of {books.length} books
          </p>
        </div>

        {/* Books Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map(book => (
              <div key={book.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all group">
                <div className="relative overflow-hidden rounded-t-lg">
                  <div className="h-64 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      Grade {book.grade}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    by {book.author}
                  </p>
                  
                  <div className="flex items-center mb-2">
                    {renderStars(book.rating)}
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      {book.rating}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                    {book.subject} • {book.pages} pages • {book.format}
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {book.description}
                  </p>
                  
                  {book.downloadUrl && (
                    <button 
                      onClick={() => {
                        console.log('Downloading book:', book.title, 'URL:', book.downloadUrl);
                        if (book.downloadUrl && book.downloadUrl !== '#') {
                          window.open(book.downloadUrl, '_blank');
                        } else {
                          alert('Download URL not available or not properly configured');
                        }
                      }}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBooks.map(book => (
              <div key={book.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-24 h-32 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {book.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          by {book.author}
                        </p>
                        
                        <div className="flex items-center mb-2">
                          {renderStars(book.rating)}
                          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                            {book.rating}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-500 dark:text-gray-500 mb-3">
                          Grade {book.grade} • {book.subject} • {book.pages} pages • {book.format}
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                          {book.description}
                        </p>
                      </div>
                      
                      <div className="ml-4">
                        {book.downloadUrl && (
                          <button 
                            onClick={() => {
                              console.log('Downloading book:', book.title, 'URL:', book.downloadUrl);
                              if (book.downloadUrl) {
                                window.open(book.downloadUrl, '_blank');
                              } else {
                                alert('Download URL not available');
                              }
                            }}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No books found
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

export default Books;