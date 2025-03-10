import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const backend_url = import.meta.env.VITE_BACKEND_URL;

export function PACEventsPage() {
  const { eventNumber } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Define TypeScript interfaces for better type safety
  interface Section {
    image?: string;
    heading: string;
    body: string;
    image_gallery_album_id?: string; // Move this to section level if needed
  }

  interface Event {
    event_number: string;
    title: string;
    event_date: string;
    cover_image: string;
    sections: Section[];
  }

  // Helper to convert URLs in text to hyperlinks
  const linkify = (text: string) => {
    return text.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
      part.match(/^https?:\/\//)
        ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">{part}</a>
        : part
    );
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`${backend_url}/get_pac_events`);
        if (!response.ok) {
          throw new Error('Failed to fetch PAC Events');
        }
        const data = await response.json();
        const foundEvent = data.events.find(
          (e: Event) => e.event_number === eventNumber
        );
        if (!foundEvent) {
          throw new Error(`Event #${eventNumber} not found`);
        }
        setEvent(foundEvent);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventNumber]);

  // Loading state component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
    </div>
  );

  // Error state component
  const ErrorDisplay = () => (
    <div className="flex items-center justify-center min-h-screen text-red-500">
      Error: {error || 'Event not found'}
    </div>
  );

  // Render loading state
  if (loading) return <LoadingSpinner />;

  // Render error state
  if (error || !event) return <ErrorDisplay />;

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Cover image with left alignment */}
          <div className="mb-12 flex justify-start">
            <img
              src={`${backend_url}${event.cover_image}`}
              alt={event.title}
              className="max-h-[80vh] object-contain rounded-lg shadow-lg"
              loading="lazy"
            />
          </div>

          {/* Content section */}
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
            <p className="text-purple-400 mb-12">
              Event #{event.event_number} - {event.event_date}
            </p>

            {/* Handle legacy events that don't have sections */}
            {event.sections ? (
              // Sections exist, render them
              event.sections.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="mb-16"
                >
                  {section.image && (
                    <div className="mb-6 flex justify-start">
                      <img
                        src={`${backend_url}${section.image}`}
                        alt={section.heading}
                        className="max-h-[500px] object-contain rounded-lg"
                      />
                    </div>
                  )}
                  {section.heading && (
                    <h2 className="text-2xl font-semibold mb-4">{section.heading}</h2>
                  )}
                  {section.body && (
                    <p className="text-gray-300 whitespace-pre-wrap">
                      {linkify(section.body)}
                    </p>
                  )}
                </motion.div>
              ))
            ) : (
              // Legacy event format - render heading/body from top level
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-16"
              >
                {event.heading && (
                  <h2 className="text-2xl font-semibold mb-4">{event.heading}</h2>
                )}
                {event.body && (
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {linkify(event.body)}
                  </p>
                )}
              </motion.div>
            )}

            {/* Image Gallery Link (if album ID exists) */}
            {event.image_gallery_album_id && (
              <div className="mt-8">
                <a 
                  href={`/gallery/${event.image_gallery_album_id}`} 
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg inline-block"
                >
                  View Event Gallery
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}