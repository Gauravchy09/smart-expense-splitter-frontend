import React, { useState, useEffect } from 'react';

const categories = [
    { name: 'General', icon: '📦' },
    { name: 'Food', icon: '🍔' },
    { name: 'Transport', icon: '🚗' },
    { name: 'Rent', icon: '🏠' },
    { name: 'Shopping', icon: '🛍️' },
    { name: 'Entertainment', icon: '🍿' },
    { name: 'Health', icon: '🏥' }
];

const ManualExpenseModal = ({ isOpen, onClose, onSave, members, initialData }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState('General');
    const [currency, setCurrency] = useState('USD');
    const [selectedParticipants, setSelectedParticipants] = useState([]);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setDescription(initialData.description || '');
                setAmount(initialData.amount || '');
                setCategory(initialData.category || 'General');
                setCurrency(initialData.currency || 'USD');
                // Format date for input: handle both ISO strings and Date objects
                const d = initialData.date ? new Date(initialData.date) : new Date();
                setDate(d.toISOString().split('T')[0]);

                // If we have splits, select those users. Otherwise select all.
                if (initialData.splits && initialData.splits.length > 0) {
                    setSelectedParticipants(initialData.splits.map(s => s.user_id));
                } else {
                    setSelectedParticipants((members || []).map(m => m.user_id));
                }
            } else {
                // Reset for new expense
                setDescription('');
                setAmount('');
                setCategory('General');
                setCurrency('USD');
                setDate(new Date().toISOString().split('T')[0]);
                setSelectedParticipants((members || []).map(m => m.user_id));
            }
        }
    }, [isOpen, initialData, members]);

    if (!isOpen) return null;

    const toggleParticipant = (userId) => {
        if (selectedParticipants.includes(userId)) {
            setSelectedParticipants(selectedParticipants.filter(id => id !== userId));
        } else {
            setSelectedParticipants([...selectedParticipants, userId]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            alert("Please enter a valid amount");
            return;
        }

        if (selectedParticipants.length === 0) {
            alert("Please select at least one participant");
            return;
        }

        const splitAmount = numAmount / selectedParticipants.length;
        const splits = selectedParticipants.map(uid => ({
            user_id: uid,
            amount_owed: splitAmount
        }));

        onSave({
            id: initialData?.id, // Pass ID back if editing
            description,
            amount: numAmount,
            date,
            category,
            currency,
            splits
        });

        onClose();
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
                    maxWidth: '450px',
                    padding: '2.5rem',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800' }}>
                        {initialData ? '✏️ Edit Expense' : '💸 Add Expense'}
                    </h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Description</label>
                        <input
                            placeholder="What was it for?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                style={{ width: '100%' }}
                            >
                                {categories.map(cat => (
                                    <option key={cat.name} value={cat.name} style={{ background: '#1e293b' }}>
                                        {cat.icon} {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Amount</label>
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
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
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
                            required
                        />
                    </div>

                    {selectedParticipants.length > 0 && amount > 0 && (
                        <div style={{
                            background: 'rgba(99, 102, 241, 0.1)',
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Each person pays:</span>
                            <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary-color)' }}>
                                {currency} {(parseFloat(amount) / selectedParticipants.length).toFixed(2)}
                            </span>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" className="glass-button" style={{
                            flex: 2, background: 'var(--primary-color)',
                            boxShadow: '0 4px 15px var(--primary-glow)'
                        }}>
                            {initialData ? 'Update Expense' : 'Create Expense'}
                        </button>
                        <button type="button" onClick={onClose} className="glass-button" style={{
                            flex: 1, background: 'rgba(255,255,255,0.05)'
                        }}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManualExpenseModal;
