import React, { useCallback, useState } from 'react';
import { Moon, Sun, LogOut, BookOpen, Home, Book, FileText, GraduationCap, Menu, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import SurveyForm from '../Survey/SurveyForm';

const Navigation: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { currentUser, isUserAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showSurvey, setShowSurvey] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = useCallback(() => {
    if (!isUserAdmin && currentUser) {
      setShowSurvey(true);
    } else {
      signOut();
      navigate('/login');
    }
  }, [isUserAdmin, currentUser, signOut, navigate]);

  const handleSurveySubmit = async () => {
    await signOut();
    setShowSurvey(false);
    navigate('/login');
  };

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
                KnowledgeHub
              </span>
              <div className="ml-8 hidden md:flex items-center space-x-4">
                <NavLink
                  to="/home"
                  className={({ isActive }: { isActive: boolean }) => `text-sm px-3 py-2 rounded-md ${isActive ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  Home
                </NavLink>
                <NavLink
                  to="/library/papers"
                  className={({ isActive }: { isActive: boolean }) => `text-sm px-3 py-2 rounded-md ${isActive ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  Past Papers
                </NavLink>
                <NavLink
                  to="/library/guides"
                  className={({ isActive }: { isActive: boolean }) => `text-sm px-3 py-2 rounded-md ${isActive ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  Study Guides
                </NavLink>
                <NavLink
                  to="/library/books"
                  className={({ isActive }: { isActive: boolean }) => `text-sm px-3 py-2 rounded-md ${isActive ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  Books
                </NavLink>
                {currentUser && (
                  <NavLink
                    to={isUserAdmin ? '/admin' : '/student'}
                    className={({ isActive }: { isActive: boolean }) => `text-sm px-3 py-2 rounded-md ${isActive ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                  >
                    {isUserAdmin ? 'Admin' : 'Student Portal'}
                  </NavLink>
                )}
              </div>
            </div>

            {/* Navigation Menu for Students */}
            {currentUser && !isUserAdmin && (
              <div className="hidden md:flex items-center space-x-6">
                <button
                  onClick={() => navigate('/home')}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    location.pathname === '/home'
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </button>
                <button
                  onClick={() => navigate('/books')}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    location.pathname === '/books'
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Book className="h-4 w-4 mr-2" />
                  Books
                </button>
                <button
                  onClick={() => navigate('/study-guides')}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    location.pathname === '/study-guides'
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Study Guides
                </button>
                <button
                  onClick={() => navigate('/past-papers')}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    location.pathname === '/past-papers'
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Past Papers
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            {currentUser && !isUserAdmin && (
              <div className="md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            )}

            <div className="flex items-center space-x-4">
              {currentUser && (
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Welcome, {isUserAdmin ? 'Admin' : currentUser.email}
                </span>
              )}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {currentUser && location.pathname !== '/login' && (
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {currentUser && !isUserAdmin && mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="px-4 py-3 space-y-2">
              <button
                onClick={() => {
                  navigate('/home');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === '/home'
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Home className="h-4 w-4 mr-3" />
                Home
              </button>
              <button
                onClick={() => {
                  navigate('/books');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === '/books'
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Book className="h-4 w-4 mr-3" />
                Books
              </button>
              <button
                onClick={() => {
                  navigate('/study-guides');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === '/study-guides'
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <GraduationCap className="h-4 w-4 mr-3" />
                Study Guides
              </button>
              <button
                onClick={() => {
                  navigate('/past-papers');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === '/past-papers'
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <FileText className="h-4 w-4 mr-3" />
                Past Papers
              </button>
            </div>
          </div>
        )}
      </nav>
      {showSurvey && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <SurveyForm onSubmit={handleSurveySubmit} variant="modal" />
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
