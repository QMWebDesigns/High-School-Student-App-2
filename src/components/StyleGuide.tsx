import React from 'react';

const StyleGuide: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Design Style Guide</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Mission-aligned colors, typography, and components.</p>
        </div>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-primary-50 text-gray-900">primary-50</div>
            <div className="p-4 rounded-lg bg-primary-400 text-white">primary-400</div>
            <div className="p-4 rounded-lg bg-primary-600 text-white">primary-600</div>
            <div className="p-4 rounded-lg bg-primary-700 text-white">primary-700</div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Typography</h2>
          <div className="space-y-2">
            <div className="text-3xl font-extrabold">Heading XL - Excellence & Growth</div>
            <div className="text-xl font-semibold">Heading L - Lifelong Learning</div>
            <div className="text-base text-gray-700 dark:text-gray-300">Body - Clear, supportive, approachable tone.</div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Buttons</h2>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700">Primary</button>
            <button className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Secondary</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StyleGuide;

