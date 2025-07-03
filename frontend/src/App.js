import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './global.css';
import LinkedInAIGenerator from './LinkedInAIGenerator';
import OneDayOneAI from './OneDayOneAI';

function Header() {
  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px',
      backgroundColor: '#007BFF',
      color: '#fff',
    }}>
      <h2 style={{ margin: 0 }}>AI Learnings Project</h2>
      <nav>
        <a href="/linkedin-ai-generator" style={{ color: '#fff', marginRight: '15px', textDecoration: 'none' }}>LinkedIn AI Generator</a>
        <a href="/one-day-one-ai" style={{ color: '#fff', textDecoration: 'none' }}>One Day One AI</a>
      </nav>
    </header>
  );
}

function App() {
  return (
    <Router>
      <div>
        <Header />
        <main style={{
          padding: '0px',
          margin: '0px',
          fontFamily: 'Arial, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Routes>
            <Route path="/" element={<Navigate to="/linkedin-ai-generator" />} />
            <Route path="/linkedin-ai-generator" element={<LinkedInAIGenerator />} />
            <Route path="/one-day-one-ai" element={<OneDayOneAI />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
