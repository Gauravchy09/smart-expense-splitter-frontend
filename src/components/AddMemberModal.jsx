import React, { useState, useEffect } from 'react';
import authService from '../services/authService';

const AddMemberModal = ({ isOpen, onClose, onAdd, existingMembers }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.length > 1) {
                setLoading(true);
                try {
                    const users = await authService.searchUsers(query);
                    // Filter out users who are already members
                    const filteredUsers = (users || []).filter(u =>
                        !(existingMembers || []).some(m => m.user_id === u.id)
                    );
                    setResults(filteredUsers);
                } catch (err) {
                    console.error("Search failed", err);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query, existingMembers]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex', justifyContent: 'center',
            alignItems: 'center', zIndex: 2001,
            animation: 'fadeIn 0.3s ease-out'
        }} onClick={onClose}>
            <div
                className="glass-card"
                style={{
                    width: '90%',
                    maxWidth: '420px',
                    padding: '2.5rem',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800' }}>👋 Add Member</h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                    Search for users by their username or email address to add them to your group.
                </p>

                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    <input
                        placeholder="Search users..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                    {loading && (
                        <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }}>
                            <div className="skeleton-pulse" style={{ width: '20px', height: '20px', borderRadius: '50%' }}></div>
                        </div>
                    )}
                </div>

                <div style={{
                    maxHeight: '250px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    paddingRight: '0.5rem'
                }}>
                    {loading && results.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Searching for users...</div>
                    ) : results.length === 0 ? (
                        query.length > 2 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                🔍 No users found for "{query}"
                            </div>
                        ) : null
                    ) : (
                        results.map(user => (
                            <div key={user.id} className="glass-card" style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '1rem', background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        background: 'var(--primary-color)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.8rem', fontWeight: 'bold'
                                    }}>
                                        {user.username[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '1rem' }}>{user.username}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onAdd(user.id)}
                                    className="glass-button"
                                    style={{
                                        padding: '0.4rem 1rem',
                                        borderRadius: '0.6rem',
                                        background: 'rgba(99, 102, 241, 0.1)',
                                        border: '1px solid rgba(99, 102, 241, 0.2)',
                                        color: 'var(--primary-color)',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    Add
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="glass-button"
                    style={{
                        width: '100%',
                        marginTop: '2rem',
                        background: 'rgba(255,255,255,0.05)',
                        borderColor: 'transparent'
                    }}
                >
                    Dismiss
                </button>
            </div>
        </div>
    );
};

export default AddMemberModal;
