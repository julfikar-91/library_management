import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Members from './pages/Members';
import Transactions from './pages/Transactions';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import StudentHistory from './pages/StudentHistory';
import StudentProfile from './pages/StudentProfile';
import FineManagement from './pages/FineManagement';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('mrem_admin_token');
    const role = localStorage.getItem('mrem_user_role');
    if (token) {
      setIsAuthenticated(true);
      setUserRole(role);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mrem_admin_token');
    localStorage.removeItem('mrem_user_role');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  if (loading) return null;

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<Login onLogin={(role) => { setIsAuthenticated(true); setUserRole(role); }} />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="flex h-screen overflow-hidden">
        <Sidebar onLogout={handleLogout} userRole={userRole} />
        <div className="flex-1 flex flex-col">
          {isAuthenticated && <Navbar userRole={userRole} />}
          <main className="flex-1 overflow-y-auto p-12 custom-scrollbar relative">
            <div className="max-w-[1600px] mx-auto">
            <Routes>
              {userRole === 'admin' ? (
                <>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/books" element={<Books />} />
                  <Route path="/members" element={<Members />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/fines" element={<FineManagement />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </>
              ) : (
                <>
                  <Route path="/profile" element={<StudentProfile />} />
                  <Route path="/books" element={<Books />} />
                  <Route path="/history" element={<StudentHistory />} />
                  <Route path="*" element={<Navigate to="/profile" replace />} />
                </>
              )}
            </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
