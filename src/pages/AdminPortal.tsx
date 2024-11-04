import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image, FileText, X, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AdminPortal() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Replace with actual password validation
    if (password === 'pacadmin') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid password');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle file upload logic here
    console.log('Uploading file:', selectedFile);
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
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter issue number"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter issue title"
                required
              />
            </div>

            <div
              className={`mb-6 border-2 border-dashed rounded-lg p-8 text-center ${
                isDragging ? 'border-purple-500 bg-purple-500/10' : 'border-slate-600'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="flex items-center justify-between bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center">
                    <FileText className="h-6 w-6 text-purple-400 mr-3" />
                    <span>{selectedFile.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">Drag and drop your PDF file here</p>
                  <p className="text-sm text-gray-500">or</p>
                  <label className="mt-2 inline-block">
                    <span className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg cursor-pointer transition-colors">
                      Browse Files
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf"
                      onChange={handleFileSelect}
                    />
                  </label>
                </>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Cover Image</label>
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                <label className="flex items-center justify-center cursor-pointer">
                  <Image className="h-6 w-6 text-gray-400 mr-2" />
                  <span className="text-gray-400">Choose cover image</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
            >
              <Upload className="h-5 w-5 mr-2" />
              Upload Issue
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}