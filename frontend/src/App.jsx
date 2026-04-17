import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Members from './pages/Members';
import Transactions from './pages/Transactions';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="p-8 pb-16">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/books" element={<Books />} />
              <Route path="/members" element={<Members />} />
              <Route path="/transactions" element={<Transactions />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}


export default App;
