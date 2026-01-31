import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GroupDetail from './pages/GroupDetail';
import Navbar from './components/Navbar';
import authService from './services/authService';
import './App.css'

function App() {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await authService.getCurrentUser();
                setCurrentUser(user);
            } catch (err) {
                setCurrentUser(null);
            }
        };
        fetchUser();
    }, []);

    const handleLogin = (user) => {
        setCurrentUser(user);
    };

    const handleLogout = () => {
        setCurrentUser(null);
    };

    return (
        <Router>
            <Navbar user={currentUser} onLogout={handleLogout} />
            <div className="app-container">
                <Routes>
                    <Route path="/login" element={<Login onLogin={handleLogin} />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard user={currentUser} />} />
                    <Route path="/groups/:id" element={<GroupDetail user={currentUser} />} />
                    <Route path="/" element={currentUser ? <Dashboard user={currentUser} /> : <Login onLogin={handleLogin} />} />
                </Routes>
            </div>
        </Router>
    )
}

export default App
