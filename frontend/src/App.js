import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import W2Dashboard from './pages/W2Dashboard';
import Profile from './pages/Profile';
import DocumentUpload from './pages/DocumentUpload';
import TaxWizard from './pages/TaxWizard';
import Payment from './pages/Payment';
import SubmissionStatus from './pages/SubmissionStatus';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <div className="container mt-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/documents" element={<DocumentUpload />} />
          <Route path="/w2-dashboard" element={<W2Dashboard />} />
              <Route path="/tax-wizard" element={<TaxWizard />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/status" element={<SubmissionStatus />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;