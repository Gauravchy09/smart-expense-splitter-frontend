import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { Bell } from 'lucide-react';
import NotificationCenter from './NotificationCenter';

const Navbar = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = React.useState(false);

    const handleLogout = () => {
        authService.logout();
        if (onLogout) onLogout();
        navigate('/login');
    };

    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 2rem',
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--glass-border)',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
        }}>
            <Link to={user ? "/dashboard" : "/login"} style={{
                textDecoration: 'none',
                color: 'white',
                fontSize: '1.6rem',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <span style={{ fontSize: '1.8rem' }}>💎</span> SmartSplit
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                {user && (
                    <>
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="glass-button"
                                style={{
                                    padding: '0.6rem',
                                    borderRadius: '50%',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Bell size={20} />
                            </button>
                            <NotificationCenter
                                isOpen={showNotifications}
                                onClose={() => setShowNotifications(false)}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'var(--primary-color)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '0.9rem'
                            }}>
                                {user.username[0].toUpperCase()}
                            </div>
                            <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{user.username}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="glass-button"
                            style={{
                                padding: '0.5rem 1.2rem',
                                borderRadius: '0.75rem',
                                fontSize: '0.9rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'white'
                            }}
                        >
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
