import teamdata2425 from '../../TeamsData2024-25.json'
import teamdata2526 from '../../TeamsData2025-26.json'
import { motion, useInView } from 'framer-motion';
import { Users, BookUser, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { TeamBackground } from '../components/TeamBackground'

// Custom hook to get number of cards per row based on container width
function useCardsPerRow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cardsPerRow, setCardsPerRow] = useState(3);

  useEffect(() => {
    const updateCardsPerRow = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const cardWidth = 400; // Same as w-[400px]
        const gap = 32; // Same as gap-8 (2rem = 32px)
        const maxCards = Math.floor((containerWidth + gap) / (cardWidth + gap));
        setCardsPerRow(Math.max(1, maxCards));
      }
    };

    updateCardsPerRow();
    window.addEventListener('resize', updateCardsPerRow);
    return () => window.removeEventListener('resize', updateCardsPerRow);
  }, []);

  return { containerRef, cardsPerRow };
}

function TeamSection({ title, positions, teamData }: { title: string, positions: string|string[], teamData: any[] }) {
  const [visibleContacts, setVisibleContacts] = useState<number[]>([]);
  const { containerRef, cardsPerRow } = useCardsPerRow();

  const toggleContact = (index: number) => {
    setVisibleContacts(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <>
      {title && (
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-3xl text-center font-semibold mt-16 mb-8"
        >
          {title}
        </motion.h2>
      )}
      <div className="flex justify-center">
        <div ref={containerRef} className="flex flex-wrap gap-8 justify-center">
          {teamData.filter((member) => 
            typeof positions === 'string' 
              ? member.Position === positions
              : positions.includes(member.Position)
          ).map((member, index) => {
            // Calculate position in current row for stagger effect
            const rowPosition = index % cardsPerRow * 0.1;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: rowPosition }}
                className="relative aspect-[3/4] rounded-lg overflow-hidden w-[400px] group hover:bg-slate-800/50 transition-colors"
              >
                <img 
                  src={member.img} 
                  alt={member.Name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 from-10% via-black/65 via-65% to-black/1 pt-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-0.5">{member.Name}</h3>
                      <p className="text-gray-200 text-sm">{member.Field} {member.Position}</p>
                    </div>
                    {member.Email && (
                      <button
                        onClick={() => toggleContact(index)}
                        className="p-2 rounded-full mt-3"
                      >
                        <BookUser className="w-5 h-5 text-zinc-500 hover:text-zinc-100 transition-colors" />
                      </button>
                    )}
                  </div>
                  <div className={`overflow-hidden transition-all duration-300 ${
                    visibleContacts.includes(index) ? 'max-h-20 mt-2' : 'max-h-0'
                  }`}>
                    <p className="text-gray-300 text-sm">{member.Email}</p>
                    {['Overall Coordinator', 'CTM'].includes(member.Position) && member['Mobile Number'] && (
                      <p className="text-gray-300 text-sm">{member['Mobile Number']}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export function Teams() {
  const [selectedYear, setSelectedYear] = useState('2025-26');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const yearOptions = [
    { value: '2025-26', label: '2025-26', data: teamdata2526 },
    { value: '2024-25', label: '2024-25', data: teamdata2425 }
  ];
  
  const currentTeamData = yearOptions.find(option => option.value === selectedYear)?.data || teamdata2526;

  return (
    <div className="relative">
      <TeamBackground />
      <div className="relative z-10">
        <div className="min-h-screen pt-24 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Users className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-4xl font-bold mb-4"
              >
                Our Team
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-xl text-gray-400 mb-6"
              >
                Meet the passionate individuals behind Physics and Astronomy Club
              </motion.p>
              
              {/* Year Selection Dropdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="relative inline-block"
              >
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  <span>Academic Year: {selectedYear}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-20 min-w-full">
                    {yearOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedYear(option.value);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                          selectedYear === option.value ? 'bg-purple-600' : ''
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>

            <div className="space-y-16">
              <TeamSection positions={['Faculty President', 'Overall Coordinator']} title="" teamData={currentTeamData} />
              <TeamSection positions="Panel Member" title="Panel Members" teamData={currentTeamData} />
              <TeamSection positions="CTM" title="CTMs" teamData={currentTeamData} />
              <TeamSection positions="Coordinator" title="Coordinators" teamData={currentTeamData} />
              <TeamSection positions="Executive" title="Executives" teamData={currentTeamData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
