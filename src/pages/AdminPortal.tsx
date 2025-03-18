import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const backend_url = import.meta.env.VITE_BACKEND_URL;

export function AdminPortal() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check localStorage when component mounts
    return localStorage.getItem('isAuthenticated') === 'true';
  });
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
        localStorage.setItem('isAuthenticated', 'true');
        setIsAuthenticated(true);
      } else if (response.status === 401) {
        alert('Invalid password');
      }
    } catch (error) {
      alert('Error logging in, issue: ' + (error as Error).message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
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
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Admin Portal</h1>
            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300"
            >
              Logout
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <button 
              className="bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-lg transition-colors"
              onClick={()=> navigate('/admin/pac-events')}
            >
              Events
            </button>
            <button 
              className="bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-lg transition-colors"
              onClick={() => navigate('/admin/gallery')}
            >
              Photo Gallery
            </button>
            <button 
              className="bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-lg transition-colors"
              onClick={() => navigate('/admin/pac-times')}
            >
              PAC Times
            </button>
            <button 
              className="bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-lg transition-colors"
              onClick={() => navigate('/admin/reading-circle')}
            >
              Reading Circle
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}