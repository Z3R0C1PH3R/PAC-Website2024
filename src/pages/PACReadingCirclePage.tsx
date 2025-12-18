import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const backend_url = import.meta.env.VITE_BACKEND_URL;

export function PACReadingCirclePage() {
  const { eventNumber } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define TypeScript interfaces for better type safety
  interface Section {
    image?: string;
    heading: string;
    body: string;
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
        const response = await fetch(`${backend_url}/get_reading_circle`);
        if (!response.ok) {
          throw new Error('Failed to fetch Reading Circle events');
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
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  // Error state component
  if (error || !event) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Error: {error || 'Event not found'}
      </div>
    );
  }

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
              Reading Circle #{event.event_number} - {event.event_date}
            </p>

            {[...event.sections].reverse().map((section, index) => (
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
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
