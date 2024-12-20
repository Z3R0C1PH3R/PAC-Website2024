import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { PACTimes } from './pages/PACTimes';
import { PACTimesPage } from './pages/PACTimesPage';
import { AdminPortal } from './pages/AdminPortal';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-900 text-white">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pac-times" element={<PACTimes />} />
            <Route path="/pac-times/:issueNumber" element={<PACTimesPage />} />
            <Route path="/admin" element={<AdminPortal />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;