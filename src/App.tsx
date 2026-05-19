import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import CheckIn from './pages/CheckIn';
import CheckOut from './pages/CheckOut';
import RateSettings from './pages/RateSettings';
import Reports from './pages/Reports';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Sidebar />
        <main className="flex-1 p-8 ml-64">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/check-in" element={<CheckIn />} />
            <Route path="/check-out" element={<CheckOut />} />
            <Route path="/rate-settings" element={<RateSettings />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;