import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import groupService from '../services/groupService';

const Dashboard = ({ user }) => {
    const [groups, setGroups] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDesc, setNewGroupDesc] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [groupsData, summaryData] = await Promise.all([
                    groupService.getGroups(),
                    groupService.getSummary()
                ]);
                setGroups(groupsData);
                setSummary(summaryData);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchData();
    }, [user]);

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            const newGroup = await groupService.createGroup({
                name: newGroupName,
                description: newGroupDesc
            });
            setGroups([...groups, newGroup]);
            setShowModal(false);
            setNewGroupName('');
            setNewGroupDesc('');
        } catch (err) {
            alert("Failed to create group");
        }
    };

    const getAvatarColor = (id) => {
        const colors = ['#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e', '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'];
        return colors[id % colors.length];
    };

    if (!user && !loading) return null;

    return (
        <div className="dashboard-container">
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2.5rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: '800' }}>Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>Welcome back, {user?.username}!</p>
                </div>
                <button
                    className="glass-button"
                    onClick={() => setShowModal(true)}
                    style={{
                        background: 'var(--primary-color)',
                        padding: '0.8rem 1.5rem',
                        fontSize: '1rem',
                        boxShadow: '0 4px 15px var(--primary-glow)'
                    }}
                >
                    <span style={{ fontSize: '1.2rem' }}>+</span> Create New Group
                </button>
            </header>

            {summary && (
                <section style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '3rem'
                }}>
                    <div className="glass-card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '4rem', opacity: 0.1 }}>📈</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '500' }}>Total You are Owed</div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--success-color)' }}>
                            ${summary.total_owed.toFixed(2)}
                        </div>
                    </div>
                    <div className="glass-card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '4rem', opacity: 0.1 }}>📉</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '500' }}>Total You Owe</div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--error-color)' }}>
                            ${summary.total_owe.toFixed(2)}
                        </div>
                    </div>
                    <div className="glass-card" style={{
                        padding: '1.5rem',
                        position: 'relative',
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(30, 41, 59, 0.7) 100%)'
                    }}>
                        <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '4rem', opacity: 0.1 }}>💰</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '500' }}>Net Balance</div>
                        <div style={{
                            fontSize: '2rem',
                            fontWeight: '800',
                            color: summary.net_balance >= 0 ? 'var(--success-color)' : 'var(--error-color)'
                        }}>
                            {summary.net_balance >= 0 ? '+' : ''}${summary.net_balance.toFixed(2)}
                        </div>
                    </div>
                </section>
            )}

            <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>My Groups</h2>
                    <span style={{
                        background: 'rgba(255,255,255,0.05)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '2rem',
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--glass-border)'
                    }}>
                        {groups.length} Groups
                    </span>
                </div>

                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="glass-card" style={{ height: '100px', opacity: 0.5, animation: 'pulse 1.5s infinite alternate' }}></div>
                        ))}
                    </div>
                ) : groups.length === 0 ? (
                    <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤝</div>
                        <h3>No groups yet</h3>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0.5rem auto 1.5rem' }}>
                            Split bills with roommates, friends, or family. Create your first group to get started!
                        </p>
                        <button className="glass-button" onClick={() => setShowModal(true)} style={{ background: 'var(--primary-color)', margin: '0 auto' }}>
                            + Create Your First Group
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {groups.map(group => (
                            <div
                                key={group.id}
                                className="glass-card"
                                onClick={() => navigate(`/groups/${group.id}`)}
                                style={{
                                    padding: '1.5rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1.25rem',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = 'var(--glass-border)';
                                }}
                            >
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '16px',
                                    background: `linear-gradient(135deg, ${getAvatarColor(group.id)} 0%, rgba(0,0,0,0.3) 100%)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '800',
                                    fontSize: '1.5rem',
                                    color: 'white',
                                    flexShrink: 0,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                }}>
                                    {group.name[0].toUpperCase()}
                                </div>
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <h3 style={{
                                        margin: '0 0 0.25rem 0',
                                        fontSize: '1.2rem',
                                        color: 'var(--text-primary)',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        fontWeight: '700'
                                    }}>{group.name}</h3>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '0.9rem',
                                        color: 'var(--text-secondary)',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {group.description || 'No description'}
                                    </p>
                                </div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>›</div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 2000,
                    animation: 'fadeIn 0.3s ease-out'
                }} onClick={() => setShowModal(false)}>
                    <div
                        className="glass-card"
                        style={{ width: '90%', maxWidth: '450px', padding: '2.5rem' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ marginTop: 0, fontSize: '1.8rem', fontWeight: '800' }}>Create New Group</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
                            Organize your expenses by creating a group for your trip, house, or project.
                        </p>
                        <form onSubmit={handleCreateGroup} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Group Name</label>
                                <input
                                    placeholder="e.g. Trip to Paris"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Description (Optional)</label>
                                <textarea
                                    placeholder="What is this group for?"
                                    value={newGroupDesc}
                                    onChange={(e) => setNewGroupDesc(e.target.value)}
                                    style={{ minHeight: '100px', resize: 'vertical' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    type="submit"
                                    className="glass-button"
                                    style={{ flex: 2, background: 'var(--primary-color)' }}
                                >
                                    Create Group
                                </button>
                                <button
                                    type="button"
                                    className="glass-button"
                                    onClick={() => setShowModal(false)}
                                    style={{ flex: 1, background: 'rgba(255,255,255,0.05)' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes pulse {
                    from { opacity: 0.3; }
                    to { opacity: 0.6; }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
