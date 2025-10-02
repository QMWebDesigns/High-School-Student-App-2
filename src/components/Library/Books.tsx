import React, { useMemo, useState } from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';
import { SAMPLE_BOOKS } from '../../data/sampleContent';

const GRADES = ['10', '11', '12'];
const SUBJECTS = [
  'Life Sciences',
  'Physical Sciences',
  'Geography',
  'Mathematics',
  'Accounting',
  'Mathematical Literacy'
];

const Books: React.FC = () => {
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');

  const filtered = useMemo(() => {
    return SAMPLE_BOOKS.filter(item => (
      (grade === '' || item.grade === grade) &&
      (subject === '' || item.subject === subject)
    ));
  }, [grade, subject]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Books</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Curated books for Grades 10-12</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <select value={grade} onChange={e => setGrade(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white">
            <option value="">All Grades</option>
            {GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}
          </select>
          <select value={subject} onChange={e => setSubject(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white">
            <option value="">All Subjects</option>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={() => { setGrade(''); setSubject(''); }} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">Clear</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(item => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <BookOpen className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  <span className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-2 py-1 rounded-full">Grade {item.grade}</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{item.description}</p>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:underline">
                  Open book <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Books;

