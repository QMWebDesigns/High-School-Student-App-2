import React, { useState, useEffect } from 'react';
import { CreditCard as Edit, Trash2, Download, Search } from 'lucide-react';
import { getPapers, deletePaper, updatePaper } from '../../services/firestoreService';
import { PaperMetadata } from '../../services/githubService';

interface PaperManagementProps {
  onDataChange: () => void;
}

const PaperManagement: React.FC<PaperManagementProps> = ({ onDataChange }) => {
  const [papers, setPapers] = useState<(PaperMetadata & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPaper, setEditingPaper] = useState<(PaperMetadata & { id: string }) | null>(null);

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const result = await getPapers();
      if (result.success) {
        setPapers(result.papers);
      }
    } catch (error) {
      console.error('Error fetching papers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this paper?')) return;

    const result = await deletePaper(id);
    if (result.success) {
      setPapers(papers.filter(paper => paper.id !== id));
      onDataChange();
    }
  };

  const handleEdit = (paper: PaperMetadata & { id: string }) => {
    setEditingPaper(paper);
  };

  const handleUpdate = async (updatedPaper: PaperMetadata & { id: string }) => {
    const { id, ...metadata } = updatedPaper;
    const result = await updatePaper(id, metadata);
    
    if (result.success) {
      setPapers(papers.map(paper => paper.id === id ? updatedPaper : paper));
      setEditingPaper(null);
      onDataChange();
    }
  };

  const filteredPapers = papers.filter(paper =>
    paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paper.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paper.grade.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Loading papers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Manage Papers
        </h2>
        
        <div className="relative">
          <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search papers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredPapers.map(paper => (
          <div key={paper.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {paper.title}
                </h3>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <span className="font-medium">Grade:</span> {paper.grade}
                  </div>
                  <div>
                    <span className="font-medium">Subject:</span> {paper.subject}
                  </div>
                  <div>
                    <span className="font-medium">Province:</span> {paper.province}
                  </div>
                  <div>
                    <span className="font-medium">Year:</span> {paper.year}
                  </div>
                </div>
                {paper.description && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {paper.description}
                  </p>
                )}
              </div>
              
              <div className="flex space-x-2 ml-4">
                {paper.downloadUrl && (
                  <a
                    href={paper.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900 rounded"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                )}
                <button
                  onClick={() => handleEdit(paper)}
                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(paper.id)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPapers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No papers found</p>
        </div>
      )}

      {editingPaper && (
        <EditPaperModal
          paper={editingPaper}
          onUpdate={handleUpdate}
          onClose={() => setEditingPaper(null)}
        />
      )}
    </div>
  );
};

interface EditPaperModalProps {
  paper: PaperMetadata & { id: string };
  onUpdate: (paper: PaperMetadata & { id: string }) => void;
  onClose: () => void;
}

const EditPaperModal: React.FC<EditPaperModalProps> = ({ paper, onUpdate, onClose }) => {
  const [editedPaper, setEditedPaper] = useState(paper);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(editedPaper);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Edit Paper
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={editedPaper.title}
              onChange={(e) => setEditedPaper({...editedPaper, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Grade
              </label>
              <input
                type="text"
                value={editedPaper.grade}
                onChange={(e) => setEditedPaper({...editedPaper, grade: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={editedPaper.subject}
                onChange={(e) => setEditedPaper({...editedPaper, subject: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={editedPaper.description}
              onChange={(e) => setEditedPaper({...editedPaper, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Update Paper
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaperManagement;