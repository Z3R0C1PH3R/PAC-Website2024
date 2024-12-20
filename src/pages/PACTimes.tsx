import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';

const backend_url = import.meta.env.VITE_BACKEND_URL;

export function PACTimes() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await fetch(`${backend_url}/get_pac_times`);
        if (!response.ok) {
          throw new Error('Failed to fetch issues');
        }
        const data = await response.json();
        setIssues(data.issues);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  const handleReadIssue = (imagePath) => {
    window.open(`${backend_url}${imagePath}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <BookOpen className="h-12 w-12 text-purple-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">PAC Times</h1>
          <p className="text-xl text-gray-400">
            Our weekly magazine featuring the latest in physics and astronomy
          </p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {issues.map((issue, index) => (
            <motion.div
              key={issue.issue_number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-800/50 backdrop-blur-md rounded-lg overflow-hidden"
            >
              <img
                src={`${backend_url}${issue.image_path}`}
                alt={issue.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex justify-between text-sm text-purple-400 mb-2">
                  <span>{issue.issue_date || 'No Issue Date'}</span>
                  {/* <span>{issue.upload_date || ''}</span> */}
                </div>
                <h3 className="text-xl font-semibold mb-2">{issue.title}</h3>
                <p className="text-gray-400 mb-4">{issue.description}</p>
                <button 
                  onClick={() => handleReadIssue(issue.image_path)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Read Issue
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}