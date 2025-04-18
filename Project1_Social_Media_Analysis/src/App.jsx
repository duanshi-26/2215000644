import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import TopUsers from './components/TopUsers';
import TrendingPosts from './components/TrendingPosts';
import Feed from './components/Feed';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <h1>Social Media Analytics</h1>
          <ul className="nav-links">
            <li><Link to="/">Feed</Link></li>
            <li><Link to="/top-users">Top Users</Link></li>
            <li><Link to="/trending-posts">Trending Posts</Link></li>
          </ul>
        </nav>

        <div className="content">
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/top-users" element={<TopUsers />} />
            <Route path="/trending-posts" element={<TrendingPosts />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;