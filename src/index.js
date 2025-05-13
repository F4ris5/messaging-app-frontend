import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import Homepage from './Homepage/Homepage';
import Register from './Registrationpage/Register';
import reportWebVitals from './reportWebVitals';
import Login from './Loginpage/Loginpage';
import Chatpage from './Chatpage/Chatpage';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router basename="/messaging-app-frontend">
      <Routes>
        <Route path="/" element={<Homepage />} />,
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chat" element={<Chatpage />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();