import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image, X, Plus, Eye, Trash2, ArrowLeft, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { compressImage } from '../utils/imageCompression';
import { ImagePreview } from '../components/ImagePreview';

const backend_url = import.meta.env.VITE_BACKEND_URL;

export function PhotoGalleryAdmin() {
  const navigate = useNavigate();
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/admin');
    }
  }, [navigate]);

  const [showNewAlbumForm, setShowNewAlbumForm] = useState(false);
  const [existingAlbums, setExistingAlbums] = useState([]);
  const [albumNumber, setAlbumNumber] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [albumDate, setAlbumDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [coverQuality, setCoverQuality] = useState(80);
  const [photoQuality, setPhotoQuality] = useState(80);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);

  useEffect(() => {
    fetchExistingAlbums();
  }, []);

  const fetchExistingAlbums = async () => {
    try {
      const response = await fetch(`${backend_url}/get_photo_albums`);
      const data = await response.json();
      setExistingAlbums(data.albums);
    } catch (error) {
      console.error('Error fetching albums:', error);
    }
  };

  const handleCoverImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const compressed = await compressImage(file, coverQuality);
      setCoverImage(compressed);
    }
  };

  const handlePhotosSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files);
      const compressedPhotos = await Promise.all(
        newPhotos.map(photo => compressImage(photo, photoQuality))
      );
      setPhotos(prevPhotos => [...prevPhotos, ...compressedPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
  };

  const removeExistingPhoto = (url: string) => {
    setExistingPhotos(prev => prev.filter(photo => photo !== url));
  };

  const handleViewAlbum = (albumNumber: string) => {
    window.open(`/gallery/${albumNumber}`, '_blank');
  };

  const handleDeleteAlbum = async (albumNumber: string) => {
    if (window.confirm('Are you sure you want to delete this album?')) {
      try {
        const response = await fetch(`${backend_url}/delete_photo_album/${albumNumber}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchExistingAlbums();
        } else {
          const data = await response.json();
          throw new Error(data.error);
        }
      } catch (error) {
        alert('Error deleting album: ' + (error as Error).message);
      }
    }
  };

  const handleEditAlbum = (album: any) => {
    setAlbumNumber(album.album_number);
    setTitle(album.title);
    setDescription(album.description || '');
    setAlbumDate(album.album_date);
    setExistingPhotos(album.photos || []);
    setEditingAlbum(album);
    setShowNewAlbumForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!coverImage && !editingAlbum) || !albumNumber || !title) {
      alert('Please fill in at least album number, title, and cover image');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('album_number', albumNumber);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('album_date', albumDate);
      
      if (coverImage) {
        formData.append('cover_image', coverImage);
      }

      if (editingAlbum) {
        formData.append('is_edit', 'true');
        formData.append('old_cover_image', editingAlbum.cover_image);
      }

      // Add new photos
      photos.forEach((photo, index) => {
        formData.append(`photo_${index}`, photo);
      });

      // Add existing photos
      existingPhotos.forEach(photo => {
        formData.append('existing_photos[]', photo);
      });

      const response = await fetch(backend_url + '/upload_photo_album', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      alert('Upload successful!');
      fetchExistingAlbums();
      setShowNewAlbumForm(false);
      
      // Clear form
      setCoverImage(null);
      setPhotos([]);
      setAlbumNumber('');
      setTitle('');
      setDescription('');
      setAlbumDate(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
      });
      setEditingAlbum(null);
      setExistingPhotos([]);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading album: ' + (error as Error).message);
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
            <h1 className="text-4xl font-bold">Photo Gallery Management</h1>
            <button
              onClick={() => setShowNewAlbumForm(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Album
            </button>
          </div>

          {/* Existing Albums List */}
          <div className="grid gap-6">
            {existingAlbums.map((album: any) => (
              <motion.div
                key={album.album_number}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-slate-800/50 backdrop-blur-md rounded-lg p-6 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={`${backend_url}${album.cover_image}`}
                    alt={album.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold text-xl">Album #{album.album_number}</h3>
                    <p className="text-gray-400">{album.title}</p>
                    <p className="text-sm text-purple-400">{album.album_date}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleViewAlbum(album.album_number)}
                    className="p-2 hover:bg-slate-700 rounded-lg tooltip"
                    title="View Album"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleEditAlbum(album)}
                    className="p-2 hover:bg-purple-700 rounded-lg tooltip"
                    title="Edit Album"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteAlbum(album.album_number)}
                    className="p-2 hover:bg-red-600 rounded-lg tooltip"
                    title="Delete Album"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* New/Edit Album Form Modal */}
        {showNewAlbumForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">
                  {editingAlbum ? 'Edit Album' : 'Add New Album'}
                </h2>
                <button
                  onClick={() => {
                    setShowNewAlbumForm(false);
                    setEditingAlbum(null);
                    setPhotos([]);
                    setExistingPhotos([]);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Album Number</label>
                  <input
                    type="text"
                    value={albumNumber}
                    onChange={(e) => setAlbumNumber(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Album Date</label>
                  <input
                    type="date"
                    value={albumDate}
                    onChange={(e) => setAlbumDate(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Cover Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageSelect}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2"
                    required={!editingAlbum}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={coverQuality}
                      onChange={(e) => setCoverQuality(Number(e.target.value))}
                    />
                    <span className="text-sm text-purple-400">Quality: {coverQuality}%</span>
                  </div>
                  {coverImage && (
                    <ImagePreview file={coverImage} className="mt-4 max-h-48" />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Photos</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotosSelect}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={photoQuality}
                      onChange={(e) => setPhotoQuality(Number(e.target.value))}
                    />
                    <span className="text-sm text-purple-400">Quality: {photoQuality}%</span>
                  </div>
                </div>

                {/* New Photos Preview */}
                {photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <ImagePreview file={photo} className="w-full aspect-square object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Existing Photos Preview */}
                {existingPhotos.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">Existing Photos</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {existingPhotos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={`${backend_url}${photo}`}
                            alt={`Existing photo ${index + 1}`}
                            className="w-full aspect-square object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingPhoto(photo)}
                            className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg flex items-center justify-center ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Upload className="h-5 w-5 mr-2" />
                  {isSubmitting ? 'Uploading...' : (editingAlbum ? 'Update Album' : 'Create Album')}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
