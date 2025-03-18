import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';

const backend_url = import.meta.env.VITE_BACKEND_URL;

interface Album {
  album_number: string;
  title: string;
  album_date: string;
  cover_image: string;
  description: string;
}

export function PhotoGallery() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await fetch(`${backend_url}/get_photo_albums`);
        if (!response.ok) {
          throw new Error('Failed to fetch albums');
        }
        const data = await response.json();
        setAlbums(data.albums);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
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
          <Camera className="h-12 w-12 text-purple-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Photo Gallery</h1>
          <p className="text-xl text-gray-400">
            Browse our collection of memories
          </p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {albums.map((album, index) => (
            <motion.div
              key={album.album_number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-800/50 backdrop-blur-md rounded-lg overflow-hidden flex flex-col"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={`${backend_url}${album.cover_image}`}
                  alt={album.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between text-sm text-purple-400 mb-2">
                  <span>Album #{album.album_number}</span>
                  <span>{album.album_date}</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">{album.title}</h3>
                {album.description && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {album.description}
                  </p>
                )}
                <button 
                  onClick={() => navigate(`/gallery/${album.album_number}`)}
                  className="mt-auto bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center"
                >
                  View Album
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
