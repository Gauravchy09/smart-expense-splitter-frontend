import React, { useState, useEffect } from 'react';
import recurringService from '../services/recurringService';

const RecurringModal = ({ isOpen, onClose, groupId, members, baseCurrency }) => {
    const [activeTab, setActiveTab] = useState('list');
    const [recurringExpenses, setRecurringExpenses] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form state
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [frequency, setFrequency] = useState('monthly');
    const [category, setCategory] = useState('General');
    const [selectedParticipants, setSelectedParticipants] = useState(members.map(m => m.user_id));

    useEffect(() => {
        if (isOpen && activeTab === 'list') {
            fetchRecurring();
        }
    }, [isOpen, activeTab]);

    const fetchRecurring = async () => {
        setLoading(true);
        try {
            const data = await recurringService.getRecurring(groupId);
            setRecurringExpenses(data);
        } catch (err) {
            console.error("Failed to fetch recurring", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) return alert("Invalid amount");
        if (selectedParticipants.length === 0) return alert("Select at least one participant");

        const splitAmount = numAmount / selectedParticipants.length;
        const splits = selectedParticipants.map(uid => ({
            user_id: uid,
            amount_owed: splitAmount
        }));

        try {
            await recurringService.createRecurring({
                group_id: groupId,
                payer_id: members[0].user_id, // Default to first member for now or current user
                description,
                amount: numAmount,
                currency: baseCurrency,
                category,
                frequency,
                splits,
                status: 'active'
            });
            setActiveTab('list');
            setDescription('');
            setAmount('');
        } catch (err) {
            alert("Failed to create recurring expense");
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex', justifyContent: 'center',
            alignItems: 'center', zIndex: 2000,
        }} onClick={onClose}>
            <div className="glass-card" style={{
                width: '95%', maxWidth: '500px', padding: '2.5rem',
                maxHeight: '90vh', overflowY: 'auto'
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ margin: 0 }}>🔄 Recurring</h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>✕</button>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)' }}>
                    <button onClick={() => setActiveTab('list')} style={{ background: 'none', border: 'none', color: activeTab === 'list' ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: 'bold', padding: '0.5rem 1rem', cursor: 'pointer' }}>Active</button>
                    <button onClick={() => setActiveTab('create')} style={{ background: 'none', border: 'none', color: activeTab === 'create' ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: 'bold', padding: '0.5rem 1rem', cursor: 'pointer' }}>+ New</button>
                </div>

                {activeTab === 'list' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {loading ? <p>Loading...</p> : recurringExpenses.length === 0 ? <p>No recurring expenses.</p> : (
                            recurringExpenses.map(re => (
                                <div key={re.id} className="glass-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div style={{ fontWeight: 'bold' }}>{re.description}</div>
                                        <div style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{re.currency} {re.amount}</div>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                        Repeat: {re.frequency} • Next: {new Date(re.next_spawn_date).toLocaleDateString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <input placeholder="Rent, Subscription, etc." value={description} onChange={e => setDescription(e.target.value)} required />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} required style={{ flex: 1 }} />
                            <select value={frequency} onChange={e => setFrequency(e.target.value)} style={{ width: '120px' }}>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>
                        <button type="submit" className="glass-button" style={{ background: 'var(--primary-color)' }}>Create Automation</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default RecurringModal;
