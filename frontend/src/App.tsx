import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SalesReports from './pages/SalesReports';
import UserReports from './pages/UserReports';
import CompletionReports from './pages/CompletionReports';
import Layout from './components/Layout';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <div className="app-layout">
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/sales-reports" element={<SalesReports />} />
              <Route path="/user-reports" element={<UserReports />} />
              <Route path="/completion-reports" element={<CompletionReports />} />
            </Routes>
          </Layout>
        </div>
      </div>
    </Router>
  );
}

export default App;
