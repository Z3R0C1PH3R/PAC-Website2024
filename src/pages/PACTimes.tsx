import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

export function PACTimes() {
  const issues = [
    {
      id: 1,
      title: "The Mystery of Dark Matter",
      date: "March 2024",
      coverImage: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800",
      description: "Exploring the invisible force that shapes our universe"
    },
    {
      id: 2,
      title: "Quantum Computing Revolution",
      date: "February 2024",
      coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800",
      description: "The future of computation and its implications"
    },
    {
      id: 3,
      title: "Journey to the Stars",
      date: "January 2024",
      coverImage: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800",
      description: "Latest discoveries in stellar evolution"
    }
  ];

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
          <p className="text-xl text-gray-400">Our weekly magazine featuring the latest in physics and astronomy</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {issues.map((issue) => (
            <motion.div
              key={issue.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: issue.id * 0.1 }}
              className="bg-slate-800/50 backdrop-blur-md rounded-lg overflow-hidden"
            >
              <img
                src={issue.coverImage}
                alt={issue.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="text-sm text-purple-400 mb-2">{issue.date}</div>
                <h3 className="text-xl font-semibold mb-2">{issue.title}</h3>
                <p className="text-gray-400 mb-4">{issue.description}</p>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
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