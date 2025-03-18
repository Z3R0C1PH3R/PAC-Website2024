import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const backend_url = import.meta.env.VITE_BACKEND_URL;

interface Album {
  album_number: string;
  title: string;
  album_date: string;
  description: string;
  photos: string[];
}

export function PhotoGalleryAlbum() {
  const { albumNumber } = useParams();
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const response = await fetch(`${backend_url}/get_photo_albums`);
        if (!response.ok) {
          throw new Error('Failed to fetch albums');
        }
        const data = await response.json();
        const foundAlbum = data.albums.find(
          (a: Album) => a.album_number === albumNumber
        );
        if (!foundAlbum) {
          throw new Error(`Album #${albumNumber} not found`);
        }
        setAlbum(foundAlbum);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbum();
  }, [albumNumber]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Error: {error || 'Album not found'}
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header with cover image */}
          <div className="mb-12 relative h-[50vh] rounded-lg overflow-hidden">
            <img
              src={`${backend_url}${album.cover_image}`}
              alt={album.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h1 className="text-4xl font-bold mb-2">{album.title}</h1>
              <p className="text-purple-400">
                Album #{album.album_number} - {album.album_date}
              </p>
              {album.description && (
                <p className="text-gray-300 mt-4 max-w-3xl">{album.description}</p>
              )}
            </div>
          </div>

          {/* Photo grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {album.photos.map((photo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="aspect-square cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={`${backend_url}${photo}`}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Full-screen photo viewer */}
      {selectedPhoto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <img
            src={`${backend_url}${selectedPhoto}`}
            alt="Selected photo"
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        </motion.div>
      )}
    </div>
  );
}
