import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const backend_url = import.meta.env.VITE_BACKEND_URL;

export function PACTimesPage() {
  const { issueNumber } = useParams();
  const [issue, setIssue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const response = await fetch(`${backend_url}/get_pac_times`);
        if (!response.ok) {
          throw new Error('Failed to fetch issue');
        }
        const data = await response.json();
        const foundIssue = data.issues.find(
          (i: any) => i.issue_number === issueNumber
        );
        if (!foundIssue) {
          throw new Error('Issue not found');
        }
        setIssue(foundIssue);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [issueNumber]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Error: {error || 'Issue not found'}
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <img
            src={`${backend_url}${issue.cover_image}`}
            alt={issue.title}
            className="w-full h-64 object-cover rounded-lg mb-8"
          />
          <h1 className="text-4xl font-bold mb-4">{issue.title}</h1>
          <p className="text-purple-400 mb-8">Issue #{issue.issue_number} - {issue.issue_date}</p>

          {issue.sections.map((section: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-semibold mb-4">{section.heading}</h2>
              <p className="text-gray-300 mb-6 whitespace-pre-wrap">{section.body}</p>
              {section.image_path && (
                <img
                  src={`${backend_url}${section.image_path}`}
                  alt={section.heading}
                  className="w-full rounded-lg"
                />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}