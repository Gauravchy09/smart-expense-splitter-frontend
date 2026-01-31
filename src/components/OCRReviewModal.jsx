import React, { useState } from 'react';

const categories = [
    { name: 'General', icon: '📦' },
    { name: 'Food', icon: '🍔' },
    { name: 'Transport', icon: '🚗' },
    { name: 'Rent', icon: '🏠' },
    { name: 'Shopping', icon: '🛍️' },
    { name: 'Entertainment', icon: '🍿' },
    { name: 'Health', icon: '🏥' }
];

const OCRReviewModal = ({ isOpen, onClose, onSave, data, members }) => {
    const [merchant, setMerchant] = useState(data.merchant || '');
    const [amount, setAmount] = useState(data.amount || 0);
    const [date, setDate] = useState(data.date || new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState('General');
    const [currency, setCurrency] = useState('USD');
    const [selectedParticipants, setSelectedParticipants] = useState(
        (members || []).map(m => m.user_id)
    );

    if (!isOpen) return null;

    const toggleParticipant = (userId) => {
        if (selectedParticipants.includes(userId)) {
            setSelectedParticipants(selectedParticipants.filter(id => id !== userId));
        } else {
            setSelectedParticipants([...selectedParticipants, userId]);
        }
    };

    const handleSave = () => {
        if (selectedParticipants.length === 0) {
            alert("Please select at least one participant");
            return;
        }

        const numAmount = parseFloat(amount);
        const splitAmount = numAmount / selectedParticipants.length;
        const splits = selectedParticipants.map(uid => ({
            user_id: uid,
            amount_owed: splitAmount
        }));

        onSave({
            merchant,
            amount: numAmount,
            date,
            category,
            currency,
            description: `Receipt from ${merchant || 'Unknown'}`,
            splits
        });
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex', justifyContent: 'center',
            alignItems: 'center', zIndex: 2000,
            animation: 'fadeIn 0.3s ease-out'
        }} onClick={onClose}>
            <div
                className="glass-card"
                style={{
                    width: '90%',
                    maxWidth: '480px',
                    padding: '2.5rem',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800' }}>🔍 Review Receipt</h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>
                    We've extracted the details from your receipt. Please verify them below.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Merchant / Description</label>
                        <input
                            value={merchant}
                            onChange={(e) => setMerchant(e.target.value)}
                            placeholder="e.g. Starbucks"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                {categories.map(cat => (
                                    <option key={cat.name} value={cat.name} style={{ background: '#1e293b' }}>
                                        {cat.icon} {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Total Amount</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    style={{ width: '80px', padding: '0.5rem' }}
                                >
                                    <option value="USD">$ USD</option>
                                    <option value="EUR">€ EUR</option>
                                    <option value="GBP">£ GBP</option>
                                    <option value="INR">₹ INR</option>
                                </select>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                            Split With ({selectedParticipants.length} people)
                        </label>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: '0.75rem',
                            border: '1px solid var(--glass-border)'
                        }}>
                            {members.map(member => (
                                <div
                                    key={member.user_id}
                                    onClick={() => toggleParticipant(member.user_id)}
                                    style={{
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '0.6rem',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        background: selectedParticipants.includes(member.user_id) ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                                        border: '1px solid ' + (selectedParticipants.includes(member.user_id) ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)'),
                                        transition: 'var(--transition)',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        fontWeight: selectedParticipants.includes(member.user_id) ? '600' : '400'
                                    }}
                                >
                                    <span>{selectedParticipants.includes(member.user_id) ? '✓' : '+'}</span>
                                    {member.user?.username || `User #${member.user_id}`}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                </div>

                {selectedParticipants.length > 0 && amount > 0 && (
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '1.5rem'
                    }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Each person pays:</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--success-color)' }}>
                            {currency} {(parseFloat(amount) / selectedParticipants.length).toFixed(2)}
                        </span>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button onClick={handleSave} className="glass-button" style={{
                        flex: 2, background: 'var(--primary-color)',
                        boxShadow: '0 4px 15px var(--primary-glow)'
                    }}>
                        Confirm & Save
                    </button>
                    <button onClick={onClose} className="glass-button" style={{
                        flex: 1, background: 'rgba(255,255,255,0.05)'
                    }}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OCRReviewModal;
