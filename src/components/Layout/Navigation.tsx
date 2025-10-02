import React, { useCallback, useState } from 'react';
import { Moon, Sun, LogOut, BookOpen } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import SurveyForm from '../Survey/SurveyForm';

const Navigation: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { currentUser, isUserAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showSurvey, setShowSurvey] = useState(false);

  const handleLogout = useCallback(() => {
    if (!isUserAdmin && currentUser) {
      setShowSurvey(true);
    } else {
      signOut();
      navigate('/login');
    }
  }, [isUserAdmin, currentUser, signOut, navigate]);

  const handleSurveySubmit = async (_surveyData: unknown) => {
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
                KZN Digital School Hub
              </span>
            </div>

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