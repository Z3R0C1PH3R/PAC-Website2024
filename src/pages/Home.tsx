import { motion } from 'framer-motion';
import { Rocket, Users, BookOpen, Calendar, Telescope, Book, Star, School } from 'lucide-react';
import Logo from '/logo.svg';

export function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2070"
            alt="Space background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

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
                className="bg-slate-800/50 backdrop-blur-md p-6 rounded-lg"
              >
                <div className="mb-4">{activity.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{activity.title}</h3>
                <p className="text-gray-400">{activity.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-20 px-4 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Featured Events</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-slate-700/50 backdrop-blur-md rounded-lg overflow-hidden"
            >
              <img
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800"
                alt="Space"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Stargazing Night</h3>
                <p className="text-gray-400">Join us for a night of celestial observation at our observatory.</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-700/50 backdrop-blur-md rounded-lg overflow-hidden"
            >
              <img
                src="https://images.unsplash.com/photo-1462332420958-a05d1e002413?auto=format&fit=crop&w=800"
                alt="Space"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Physics Colloquium</h3>
                <p className="text-gray-400">Weekly discussions on breakthrough research in physics and astronomy.</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-700/50 backdrop-blur-md rounded-lg overflow-hidden"
            >
              <img
                src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800"
                alt="Space"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Rocket Launch Day</h3>
                <p className="text-gray-400">Experience the thrill of launching student-built model rockets.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}