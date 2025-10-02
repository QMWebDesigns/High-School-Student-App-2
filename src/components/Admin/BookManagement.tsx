import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Book, Download } from 'lucide-react';
import { getBooks as fetchBooksFromApi, saveBook as saveBookToApi, updateBook as updateBookInApi, deleteBook as deleteBookFromApi, uploadBookCover, uploadBookFile } from '../../services/libraryService';

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
  isbn?: string;
}

const BookManagement: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [filters, setFilters] = useState({
    grade: '',
    subject: '',
    format: ''
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
  const FORMATS = ['PDF', 'EPUB', 'Interactive'];

  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true);
      const result = await fetchBooksFromApi();
      if (result.success) {
        setBooks(result.books);
        setFilteredBooks(result.books);
      }
      setLoading(false);
    };
    loadBooks();
  }, []);

  useEffect(() => {
    let filtered = books.filter(book => {
      const matchesSearch = 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.subject.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilters = 
        (filters.grade === '' || book.grade === filters.grade) &&
        (filters.subject === '' || book.subject === filters.subject) &&
        (filters.format === '' || book.format === filters.format);

      return matchesSearch && matchesFilters;
    });

    setFilteredBooks(filtered);
  }, [books, searchTerm, filters]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    const res = await deleteBookFromApi(id);
    if (res.success) {
      setBooks(books.filter(book => book.id !== id));
      setFilteredBooks(filteredBooks.filter(book => book.id !== id));
    } else {
      alert(res.error || 'Failed to delete book');
    }
  };

  const BookForm: React.FC<{ book?: Book; onSave: (book: Book) => void; onCancel: () => void }> = ({ 
    book, 
    onSave, 
    onCancel 
  }) => {
    const [formData, setFormData] = useState<Partial<Book>>(book || {
      title: '',
      author: '',
      subject: '',
      grade: '',
      description: '',
      coverImage: '',
      downloadUrl: '',
      rating: 0,
      pages: 0,
      format: 'PDF',
      publisher: '',
      year: new Date().getFullYear().toString(),
      isbn: ''
    });
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [bookFile, setBookFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      // Upload selected files to storage first
      let coverImageUrl = formData.coverImage || '';
      if (coverFile && (formData.title || book?.title)) {
        const res = await uploadBookCover(coverFile, formData.title || (book?.title as string) || 'book');
        if (!res.success) {
          alert(res.error || 'Failed to upload cover image');
          return;
        }
        coverImageUrl = res.publicUrl || '';
      }

      let downloadUrl = formData.downloadUrl || '';
      if (bookFile && (formData.title || book?.title)) {
        const res = await uploadBookFile(bookFile, formData.title || (book?.title as string) || 'book');
        if (!res.success) {
          alert(res.error || 'Failed to upload book file');
          return;
        }
        downloadUrl = res.publicUrl || '';
      }

      const { id: _ignored, ...rest } = (formData as Book);
      const bookData: Book = {
        ...rest,
        coverImage: coverImageUrl,
        downloadUrl,
        id: book?.id || Date.now().toString()
      };
      await onSave(bookData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {book ? 'Edit Book' : 'Add New Book'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
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
                    Publisher
                  </label>
                  <input
                    type="text"
                    value={formData.publisher || ''}
                    onChange={(e) => setFormData({...formData, publisher: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Year
                  </label>
                  <input
                    type="text"
                    value={formData.year || ''}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cover image (upload)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                    className="w-full text-sm text-gray-600 dark:text-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Book file (PDF)
                  </label>
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={(e) => setBookFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                    className="w-full text-sm text-gray-600 dark:text-gray-300"
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
                  ISBN
                </label>
                <input
                  type="text"
                  value={formData.isbn || ''}
                  onChange={(e) => setFormData({...formData, isbn: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
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
                  {book ? 'Update' : 'Add'} Book
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const handleSave = async (bookData: Book) => {
    if (editingBook) {
      const { id, ...update } = bookData;
      const res = await updateBookInApi(id, update);
      if (res.success) {
        const updated = books.map(b => (b.id === id ? { ...b, ...bookData } : b));
        setBooks(updated);
        setFilteredBooks(updated);
      } else {
        alert(res.error || 'Failed to update book');
        return;
      }
    } else {
      const { id: _tempId, ...create } = bookData as Omit<Book, 'id'> & { id?: string };
      const res = await saveBookToApi(create as any);
      if (res.success) {
        const created: Book = { ...(create as Book), id: String(res.id) };
        const next = [...books, created];
        setBooks(next);
        setFilteredBooks(next);
      } else {
        alert(res.error || 'Failed to create book');
        return;
      }
    }
    setShowAddModal(false);
    setEditingBook(null);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading books...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Book Management</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Book
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search books..."
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
            value={filters.format}
            onChange={(e) => setFilters({...filters, format: e.target.value})}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Formats</option>
            {FORMATS.map(format => (
              <option key={format} value={format}>{format}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Book
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Subject & Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredBooks.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Book className="h-10 w-10 text-blue-600 dark:text-blue-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {book.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          by {book.author}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">{book.subject}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Grade {book.grade}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">{book.format}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{book.pages} pages</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {book.downloadUrl && (
                        <button
                          onClick={() => window.open(book.downloadUrl, '_blank')}
                          className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setEditingBook(book)}
                        className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(book.id)}
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

      {filteredBooks.length === 0 && (
        <div className="text-center py-8">
          <Book className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No books found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Add your first book or adjust your search filters
          </p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingBook) && (
        <BookForm
          book={editingBook || undefined}
          onSave={handleSave}
          onCancel={() => {
            setShowAddModal(false);
            setEditingBook(null);
          }}
        />
      )}
    </div>
  );
};

export default BookManagement;