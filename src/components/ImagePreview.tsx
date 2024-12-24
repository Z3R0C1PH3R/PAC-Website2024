import { useEffect, useState } from 'react';
import { Maximize2 } from 'lucide-react';

interface ImagePreviewProps {
  file?: File | null;
  url?: string;
  className?: string;
  showSize?: boolean;
}

export function ImagePreview({ file, url, className = "", showSize = true }: ImagePreviewProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string>('');

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Calculate file size
      const size = file.size;
      if (size < 1024) {
        setFileSize(`${size} B`);
      } else if (size < 1024 * 1024) {
        setFileSize(`${(size / 1024).toFixed(2)} KB`);
      } else {
        setFileSize(`${(size / (1024 * 1024)).toFixed(2)} MB`);
      }
    } else if (url) {
      setPreview(url);
      setFileSize('');
    } else {
      setPreview(null);
      setFileSize('');
    }
  }, [file, url]);

  const openFullscreen = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    if (preview) {
      window.open(preview, '_blank');
    }
  };

  if (!preview) return null;

  return (
    <div className="space-y-2">
      <div className="relative">
        <button
          onClick={openFullscreen}
          type="button" // Prevent form submission
          className="absolute top-2 left-2 p-2 bg-black/50 hover:bg-black/75 rounded-lg transition-colors"
          title="Open full size"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <img
          src={preview}
          alt="Preview"
          className={`rounded-lg object-contain ${className}`}
        />
      </div>
      {showSize && fileSize && (
        <p className="text-sm text-gray-400">Size: {fileSize}</p>
      )}
    </div>
  );
}
