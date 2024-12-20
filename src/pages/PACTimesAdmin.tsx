import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image, X, Plus, Eye, Trash2, ArrowLeft, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const backend_url = import.meta.env.VITE_BACKEND_URL;

export function PACTimesAdmin() {
  const [showNewIssueForm, setShowNewIssueForm] = useState(false);
  const [existingIssues, setExistingIssues] = useState([]);
  const [issueNumber, setIssueNumber] = useState('');
  const [title, setTitle] = useState('');
  const [issueDate, setIssueDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [numSections, setNumSections] = useState(1);
  const [sections, setSections] = useState([{ image: null, heading: '', body: '' }]);
  const [editingIssue, setEditingIssue] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExistingIssues();
  }, []);

  const fetchExistingIssues = async () => {
    try {
      const response = await fetch(`${backend_url}/get_pac_times`);
      const data = await response.json();
      setExistingIssues(data.issues);
    } catch (error) {
      console.error('Error fetching issues:', error);
    }
  };

  const handleCoverImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCoverImage(e.target.files[0]);
    }
  };

  const handleSectionChange = (index: number, field: string, value: any) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setSections(newSections);
  };

  const updateSectionCount = (count: number) => {
    const newCount = Math.max(1, count);
    setNumSections(newCount);
    setSections(current => {
      if (newCount > current.length) {
        return [...current, ...Array(newCount - current.length).fill({ image: null, heading: '', body: '' })];
      }
      return current.slice(0, newCount);
    });
  };

  const handleViewIssue = (issueNumber: string) => {
    window.open(`/pac-times/${issueNumber}`, '_blank');
  };

  const handleDeleteIssue = async (issueNumber: string) => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      try {
        const response = await fetch(`${backend_url}/delete_pac_times/${issueNumber}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchExistingIssues();
        } else {
          const data = await response.json();
          throw new Error(data.error);
        }
      } catch (error) {
        alert('Error deleting issue: ' + (error as Error).message);
      }
    }
  };

  const handleEditIssue = (issue: any) => {
    setIssueNumber(issue.issue_number);
    setTitle(issue.title);
    setIssueDate(issue.issue_date);
    setNumSections(issue.sections.length);
    setSections(issue.sections.map((section: any) => ({
      image: null,
      heading: section.heading,
      body: section.body
    })));
    setEditingIssue(issue);
    setShowNewIssueForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Remove this validation for edit mode
    if ((!coverImage && !editingIssue) || !issueNumber || !title) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('issue_number', issueNumber);
      formData.append('title', title);
      formData.append('issue_date', issueDate);
      
      // Always append cover image if it exists
      if (coverImage) {
        formData.append('cover_image', coverImage);
      }

      if (editingIssue) {
        formData.append('is_edit', 'true');
        // Send the old cover image path for reference
        formData.append('old_cover_image', editingIssue.cover_image);
      }
      
      sections.forEach((section, index) => {
        if (section.image) formData.append(`section_${index}_image`, section.image);
        formData.append(`section_${index}_heading`, section.heading);
        formData.append(`section_${index}_body`, section.body);
      });

      const response = await fetch(backend_url + '/upload_pac_times', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      alert('Upload successful!');
      fetchExistingIssues(); // Refresh the list
      setShowNewIssueForm(false); // Close the modal
      
      // Clear the form
      setCoverImage(null);
      setIssueNumber('');
      setTitle('');
      setNumSections(1);
      setSections([{ image: null, heading: '', body: '' }]);
      setIssueDate(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
      });
      
      setEditingIssue(null);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading issue: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center text-purple-400 hover:text-purple-300 mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Portal
          </button>

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">PAC Times Management</h1>
            <button
              onClick={() => setShowNewIssueForm(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Issue
            </button>
          </div>

          <div className="grid gap-6">
            {existingIssues.map((issue: any) => (
              <motion.div
                key={issue.issue_number}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-slate-800/50 backdrop-blur-md rounded-lg p-6 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={`${backend_url}${issue.cover_image}`}
                    alt={issue.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold text-xl">Issue #{issue.issue_number}</h3>
                    <p className="text-gray-400">{issue.title}</p>
                    <p className="text-sm text-purple-400">{issue.issue_date}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleViewIssue(issue.issue_number)}
                    className="p-2 hover:bg-slate-700 rounded-lg tooltip"
                    title="View Issue"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleEditIssue(issue)}
                    className="p-2 hover:bg-purple-700 rounded-lg tooltip"
                    title="Edit Issue"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteIssue(issue.issue_number)}
                    className="p-2 hover:bg-red-600 rounded-lg tooltip"
                    title="Delete Issue"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* New Issue Form Modal */}
        {showNewIssueForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">
                  {editingIssue ? 'Edit Issue' : 'Add New Issue'}
                </h2>
                <button
                  onClick={() => {
                    setShowNewIssueForm(false);
                    setEditingIssue(null);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Issue Number</label>
                  <input
                    type="number"
                    value={issueNumber}
                    onChange={(e) => setIssueNumber(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Issue Date</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Cover Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageSelect}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2"
                    required={!editingIssue} // Only required for new issues
                  />
                  {editingIssue && !coverImage && (
                    <p className="text-sm text-gray-400 mt-2">
                      Leave empty to keep the existing cover image
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Number of Sections</label>
                  <input
                    type="number"
                    min="1"
                    value={numSections}
                    onChange={(e) => updateSectionCount(parseInt(e.target.value))}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2"
                  />
                </div>

                {sections.map((section, index) => (
                  <div key={index} className="mb-8 p-4 border border-slate-600 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Section {index + 1}</h3>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Section Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleSectionChange(index, 'image', e.target.files[0]);
                          }
                        }}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Section Heading</label>
                      <input
                        type="text"
                        value={section.heading}
                        onChange={(e) => handleSectionChange(index, 'heading', e.target.value)}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Section Body</label>
                      <textarea
                        value={section.body}
                        onChange={(e) => handleSectionChange(index, 'body', e.target.value)}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 min-h-[100px]"
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg flex items-center justify-center transition-colors ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Upload className="h-5 w-5 mr-2" />
                  {isSubmitting ? 'Uploading...' : (editingIssue ? 'Update Issue' : 'Upload Issue')}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
