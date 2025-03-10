import { motion } from 'framer-motion';
import { Rocket, Users, BookOpen, Calendar, Telescope, Book, Star, School } from 'lucide-react';
import Logo from '/logo.svg';
import { MoonCanvas } from '../components/Moon';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const backend_url = import.meta.env.VITE_BACKEND_URL;

export function Home() {
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentEvents = async () => {
      try {
        const response = await fetch(`${backend_url}/get_pac_events?limit=3`);
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        setRecentEvents(data.events);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentEvents();
  }, []);

  const handleViewEvent = (eventNumber) => {
    navigate(`/pac-events/${eventNumber}`);
  };

  const navigateToAllEvents = () => {
    navigate('/pac-events');
  };

  return (
    <div className="relative">
      {/* Background */}
      <div className="fixed inset-0 bg-black">
        <MoonCanvas />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center">
          <div className="relative z-10 text-center px-4 -mt-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <img 
                src={Logo} 
                alt="PAC Logo" 
                className="w-48 h-48 md:w-64 md:h-64 mx-auto"
              />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              Physics and Astronomy Club, IITD
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto"
            >
              Exploring the mysteries of the universe, one discovery at a time
            </motion.p>
          </div>
        </section>

        {/* Activities Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-black/30 backdrop-blur-[2px] p-8 rounded-2xl">
              <h2 className="text-3xl font-bold text-center mb-16">What We Do</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    icon: <Telescope className="h-8 w-8 text-purple-400" />,
                    title: "Observatory",
                    description: "Access to our observatory for celestial observations"
                  },
                  {
                    icon: <Rocket className="h-8 w-8 text-purple-400" />,
                    title: "Rocketry",
                    description: "Design and launch model rockets"
                  },
                  {
                    icon: <Book className="h-8 w-8 text-purple-400" />,
                    title: "Reading Circle",
                    description: "Weekly discussions on physics and astronomy papers"
                  },
                  {
                    icon: <Star className="h-8 w-8 text-purple-400" />,
                    title: "Research",
                    description: "Engage in cutting-edge physics and astronomy research"
                  },
                  {
                    icon: <Calendar className="h-8 w-8 text-purple-400" />,
                    title: "Observation Sessions",
                    description: "Regular stargazing and astronomical observations"
                  },
                  {
                    icon: <School className="h-8 w-8 text-purple-400" />,
                    title: "Events",
                    description: "Workshops, talks, and educational sessions"
                  },
                  {
                    icon: <BookOpen className="h-8 w-8 text-purple-400" />,
                    title: "PAC Times",
                    description: "Our weekly astronomy and physics magazine"
                  },
                  {
                    icon: <Users className="h-8 w-8 text-purple-400" />,
                    title: "Community",
                    description: "Join a vibrant community of space enthusiasts"
                  }
                ].map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-slate-900/40 hover:bg-slate-800/50 transition-colors p-6 rounded-lg"
                  >
                    <div className="mb-4">{activity.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{activity.title}</h3>
                    <p className="text-gray-400">{activity.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Recent Events Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-black/30 backdrop-blur-[2px] p-8 rounded-2xl">
              <h2 className="text-3xl font-bold text-center mb-16">Recent Events</h2>
              
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : error ? (
                <div className="text-center text-red-500 py-12">
                  Error loading events: {error}
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-3 gap-8">
                    {recentEvents.map((event, index) => (
                      <motion.div
                        key={event.event_number}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-slate-900/40 hover:bg-slate-800/50 transition-colors rounded-lg overflow-hidden"
                      >
                        <img
                          src={`${backend_url}${event.cover_image}`}
                          alt={event.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-6">
                          <div className="text-sm text-purple-400 mb-2">
                            {event.event_date || 'No Event Date'}
                          </div>
                          <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                          <button 
                            onClick={() => handleViewEvent(event.event_number)}
                            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-10 text-center">
                    <button 
                      onClick={navigateToAllEvents}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                      View All Events
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}