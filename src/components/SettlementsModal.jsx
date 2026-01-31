import React, { useState, useEffect } from 'react';
import settlementService from '../services/settlementService';

const SettlementsModal = ({ isOpen, onClose, groupId, suggestedSettlements, onPaymentRecorded, baseCurrency = 'USD' }) => {
    const [activeTab, setActiveTab] = useState('suggested');
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && activeTab === 'history') {
            fetchHistory();
        }
    }, [isOpen, activeTab]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const data = await settlementService.getSettlements(groupId);
            setHistory(data);
        } catch (err) {
            console.error("Failed to fetch history", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRecordPayment = async (settlement) => {
        try {
            await settlementService.recordPayment({
                group_id: groupId,
                payer_id: settlement.from_id || settlement.from_user_id,
                payee_id: settlement.to_id || settlement.to_user_id,
                amount: settlement.amount,
                currency: baseCurrency
            });
            onPaymentRecorded();
            if (activeTab === 'history') fetchHistory();
        } catch (err) {
            alert("Failed to record payment");
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
            animation: 'fadeIn 0.3s ease-out'
        }} onClick={onClose}>
            <div
                className="glass-card"
                style={{
                    width: '90%',
                    maxWidth: '600px',
                    padding: '2.5rem',
                    maxHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'column'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800' }}>💸 Settlements</h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                    <button
                        onClick={() => setActiveTab('suggested')}
                        style={{
                            background: 'none', border: 'none', color: activeTab === 'suggested' ? 'var(--primary-color)' : 'var(--text-secondary)',
                            fontWeight: '600', cursor: 'pointer', position: 'relative', padding: '0.5rem 1rem'
                        }}
                    >
                        Suggested
                        {activeTab === 'suggested' && <div style={{ position: 'absolute', bottom: '-1rem', left: 0, right: 0, height: '2px', background: 'var(--primary-color)' }} />}
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        style={{
                            background: 'none', border: 'none', color: activeTab === 'history' ? 'var(--primary-color)' : 'var(--text-secondary)',
                            fontWeight: '600', cursor: 'pointer', position: 'relative', padding: '0.5rem 1rem'
                        }}
                    >
                        History
                        {activeTab === 'history' && <div style={{ position: 'absolute', bottom: '-1rem', left: 0, right: 0, height: '2px', background: 'var(--primary-color)' }} />}
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
                    {activeTab === 'suggested' ? (
                        suggestedSettlements.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                                <p>Everything is settled! No pending payments.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {suggestedSettlements.map((s, idx) => (
                                    <div key={idx} className="glass-card" style={{ padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                                                <span style={{ color: 'var(--text-secondary)' }}>From</span>
                                                <span style={{ fontWeight: '700' }}>{s.from_name || s.from_username}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ color: 'var(--text-secondary)' }}>To</span>
                                                <span style={{ fontWeight: '700' }}>{s.to_name || s.to_username}</span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary-color)' }}>
                                                {baseCurrency} {s.amount.toFixed(2)}
                                            </div>
                                            <button
                                                onClick={() => handleRecordPayment(s)}
                                                className="glass-button"
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'var(--success-color)', borderColor: 'transparent' }}
                                            >
                                                Mark as Paid
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        loading ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading history...</div>
                        ) : history.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>No payments recorded yet.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {history.map(h => (
                                    <div key={h.id} style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '0.9rem' }}>
                                                <span style={{ fontWeight: '600' }}>{h.payer?.username || 'User'}</span>
                                                <span style={{ color: 'var(--text-secondary)', margin: '0 0.5rem' }}>paid</span>
                                                <span style={{ fontWeight: '600' }}>{h.payee?.username || 'User'}</span>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                                                {new Date(h.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div style={{ fontWeight: '700', color: 'var(--success-color)' }}>
                                            {h.currency} {h.amount.toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="glass-button"
                    style={{ marginTop: '2rem', width: '100%', background: 'rgba(255,255,255,0.05)', borderColor: 'transparent' }}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default SettlementsModal;
