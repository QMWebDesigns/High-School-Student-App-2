import React, { useCallback } from 'react';
import { Moon, Sun, LogOut, BookOpen } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { currentUser, isUserAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = useCallback(async () => {
    const result = await signOut();
    if (!result.error) {
      if (!isUserAdmin && currentUser) {
        navigate('/survey');
      } else {
        navigate('/login');
      }
    }
  }, [signOut, isUserAdmin, currentUser, navigate]);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
              Digital Library
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
  );
};

export default Navigation;