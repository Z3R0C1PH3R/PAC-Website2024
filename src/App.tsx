import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { PACTimes } from './pages/PACTimes';
import { PACTimesPage } from './pages/PACTimesPage';
import { AdminPortal } from './pages/AdminPortal';
import { PACTimesAdmin } from './pages/PACTimesAdmin';
import PACEventsAdmin from './pages/PACEventsAdmin.js';
import {Teams} from './pages/Teams.js';
import { PACEvents } from './pages/PACEvents.js';
import { PACEventsPage } from './pages/PACEventsPage.js';


function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-900 text-white">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pac-times" element={<PACTimes />} />
            <Route path="/pac-events" element={<PACEvents />} />
            <Route path="/pac-times/:issueNumber" element={<PACTimesPage />} />
            <Route path="/pac-events/:eventNumber" element={<PACEventsPage />} />
            <Route path="/admin" element={<AdminPortal />} />
            <Route path="/admin/pac-times" element={<PACTimesAdmin />} />
            <Route path="/admin/pac-events" element={<PACEventsAdmin/>} />
            <Route path="/teams" element={<Teams />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;