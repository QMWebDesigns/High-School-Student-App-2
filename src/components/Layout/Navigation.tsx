import React, { useCallback, useState } from 'react';
import { Moon, Sun, LogOut, BookOpen, Home, Book, FileText, GraduationCap, Menu, X, User } from 'lucide-react';
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

  // Common navigation items for all users
  const mainNavigation = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/library/papers', label: 'Past Papers', icon: FileText },
    { to: '/library/guides', label: 'Study Guides', icon: GraduationCap },
    { to: '/library/books', label: 'Books', icon: Book },
  ];

  // Student-specific navigation (when logged in as student)
  const studentNavigation = [
    { to: '/student', label: 'Dashboard', icon: Home },
    { to: '/library/papers', label: 'Past Papers', icon: FileText },
    { to: '/library/guides', label: 'Study Guides', icon: GraduationCap },
    { to: '/library/books', label: 'Books', icon: Book },
  ];

  const getNavItems = () => {
    if (currentUser && !isUserAdmin) {
      return studentNavigation;
    }
    return mainNavigation;
  };

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700" role="navigation" aria-label="Global">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
                KnowledgeHub
              </span>
              
              {/* Desktop Navigation */}
              <div className="ml-8 hidden md:flex items-center space-x-4">
                {getNavItems().map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) => 
                        `flex items-center text-sm px-3 py-2 rounded-md transition-colors ${
                          isActive 
                            ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200' 
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                        }`
                      }
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </NavLink>
                  );
                })}
                
                {/* Admin Link */}
                {currentUser && isUserAdmin && (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) => 
                      `flex items-center text-sm px-3 py-2 rounded-md transition-colors ${
                        isActive 
                          ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }`
                    }
                  >
                    <User className="h-4 w-4 mr-2" />
                    Admin
                  </NavLink>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* User Controls */}
            <div className="flex items-center space-x-4">
              {currentUser && (
                <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:inline">
                  Welcome, {isUserAdmin ? 'Admin' : currentUser.email}
                </span>
              )}
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Logout Button */}
              {currentUser && location.pathname !== '/login' && (
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div 
            id="mobile-menu" 
            className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700" 
            role="region" 
            aria-label="Mobile menu"
          >
            <div className="px-4 py-3 space-y-2">
              {getNavItems().map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.to}
                    onClick={() => {
                      navigate(item.to);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      location.pathname === item.to
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </button>
                );
              })}
              
              {/* Admin Link for Mobile */}
              {currentUser && isUserAdmin && (
                <button
                  onClick={() => {
                    navigate('/admin');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    location.pathname === '/admin'
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <User className="h-4 w-4 mr-3" />
                  Admin
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Survey Modal */}
      {showSurvey && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center" 
          role="dialog" 
          aria-modal="true"
          aria-labelledby="survey-modal-title"
        >
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <SurveyForm onSubmit={handleSurveySubmit} variant="modal" />
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;