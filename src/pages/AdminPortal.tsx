import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image, X, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { form } from 'framer-motion/client';

const backend_url = import.meta.env.VITE_BACKEND_URL

export function AdminPortal() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [issueNumber, setIssueNumber] = useState('');
  const [title, setTitle] = useState('');
  const [issueDate, setIssueDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [numSections, setNumSections] = useState(1);
  const [sections, setSections] = useState([{ image: null, heading: '', body: '' }]);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('password', password);
      const response = await fetch(backend_url + '/handle_login', {
        method: 'POST',
        body: formData,
      });

      if (response.status === 202) {
        setIsAuthenticated(true);
      } else if (response.status === 401) {
        alert('Invalid password');
      }
    } catch (error) {
      alert('Error logging in, issue: ' + (error as Error).message);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!coverImage || !issueNumber || !title) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('cover_image', coverImage);
      formData.append('issue_number', issueNumber);
      formData.append('title', title);
      formData.append('issue_date', issueDate);
      
      sections.forEach((section, index) => {
        if (section.image) formData.append(`section_${index}_image`, section.image);
        formData.append(`section_${index}_heading`, section.heading);
        formData.append(`section_${index}_body`, section.body);
      });

      const response = await fetch(backend_url + '/upload_pac_times', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      alert('Upload successful!');
      
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
      
    } catch (error) {
      alert('Error uploading issue: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-md rounded-lg p-8 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Lock className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Admin Access</h1>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter admin password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition-colors"
            >
              Login
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Admin Portal</h1>
          <p className="text-xl text-gray-400">Upload new issues of PAC Times</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-md rounded-lg p-8"
        >
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Issue Number</label>
              <input
                type="number"
                value={issueNumber}
                onChange={(e) => setIssueNumber(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter issue number"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Issue Date</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter issue title"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Cover Image</label>
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                <label className="flex items-center justify-center cursor-pointer">
                  {coverImage ? (
                    <div className="flex items-center">
                      <Image className="h-6 w-6 text-purple-400 mr-2" />
                      <span>{coverImage.name}</span>
                      <button
                        type="button"
                        onClick={() => setCoverImage(null)}
                        className="ml-2 text-gray-400 hover:text-white"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Image className="h-6 w-6 text-gray-400 mr-2" />
                      <span className="text-gray-400">Choose cover image</span>
                    </>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleCoverImageSelect}
                    required
                  />
                </label>
              </div>
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
              {isSubmitting ? 'Uploading...' : 'Upload Issue'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}