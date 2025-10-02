import React from 'react';
import { BookOpen, Notebook, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">KZN Digital School Library</h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore past exam papers, study guides, and books designed for Grades 10–12.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/library/papers" className="group bg-white dark:bg-gray-800 rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Past Papers</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Browse by grade, subject, and year.</p>
              </div>
              <FileText className="h-10 w-10 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="mt-4 inline-flex items-center text-primary-600 dark:text-primary-400">
              Start browsing <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          <Link to="/library/guides" className="group bg-white dark:bg-gray-800 rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Study Guides</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Focused resources to master topics.</p>
              </div>
              <Notebook className="h-10 w-10 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="mt-4 inline-flex items-center text-primary-600 dark:text-primary-400">
              Explore guides <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          <Link to="/library/books" className="group bg-white dark:bg-gray-800 rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Books</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Extended reading and workbooks.</p>
              </div>
              <BookOpen className="h-10 w-10 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="mt-4 inline-flex items-center text-primary-600 dark:text-primary-400">
              View books <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;

