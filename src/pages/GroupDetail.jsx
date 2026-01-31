import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import groupService from '../services/groupService';
import expenseService from '../services/expenseService';
import OCRReviewModal from '../components/OCRReviewModal';
import AddMemberModal from '../components/AddMemberModal';
import ManualExpenseModal from '../components/ManualExpenseModal';
import SettlementsModal from '../components/SettlementsModal';
import settlementService from '../services/settlementService';
import recurringService from '../services/recurringService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import RecurringModal from '../components/RecurringModal';

const GroupDetail = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isScanning, setIsScanning] = useState(false);
    const [ocrData, setOcrData] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false); // Keep this for OCR review
    const [showSettlementModal, setShowSettlementModal] = useState(false); // New state for settlement modal
    const [showRecurringModal, setShowRecurringModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null); // New state for editing expense
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [showManualModal, setShowManualModal] = useState(false);
    const [balances, setBalances] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // Auto-trigger recurring spawn
                await recurringService.triggerSpawn();

                const groupData = await groupService.getGroup(id);
                setGroup(groupData);
                const expenseData = await expenseService.getExpenses(id);
                setExpenses(expenseData);
                const balanceData = await groupService.getBalances(id);
                setBalances(balanceData);
            } catch (err) {
                console.error("Error fetching group details", err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchDetails();
    }, [id, user]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsScanning(true);
        try {
            const result = await expenseService.scanReceipt(file);
            setOcrData(result);
            setShowReviewModal(true);
        } catch (err) {
            console.error("OCR Failed", err);
            alert("Failed to scan receipt. Make sure Tesseract is installed on the server.");
        } finally {
            setIsScanning(false);
        }
    };

    const handleConfirmOCR = async (finalData) => {
        try {
            const newExpense = await expenseService.createExpense({
                group_id: parseInt(id),
                description: finalData.description,
                amount: finalData.amount || 0,
                currency: 'USD',
                date: finalData.date || new Date().toISOString().split('T')[0],
                splits: finalData.splits
            });
            setExpenses([newExpense, ...expenses]);
            const balanceData = await groupService.getBalances(id);
            setBalances(balanceData);
            setShowReviewModal(false);
            setOcrData(null);
        } catch (err) {
            alert("Failed to save expense");
        }
    };

    const handleDeleteExpense = async (expenseId) => {
        if (!window.confirm("Are you sure you want to delete this expense?")) return;
        try {
            await expenseService.deleteExpense(expenseId);
            setExpenses(expenses.filter(e => e.id !== expenseId));
            const balanceData = await groupService.getBalances(id);
            setBalances(balanceData);
        } catch (err) {
            alert("Failed to delete expense");
        }
    };

    const handleAddMember = async (userId) => {
        try {
            const updatedGroup = await groupService.addMember(id, userId);
            setGroup(updatedGroup);
            const balanceData = await groupService.getBalances(id);
            setBalances(balanceData);
            setShowAddMemberModal(false);
        } catch (err) {
            alert("Failed to add member");
        }
    };

    const handleSaveManual = async (expenseData) => {
        try {
            if (expenseData.id) {
                // Update
                const updated = await expenseService.updateExpense(expenseData.id, {
                    ...expenseData,
                    group_id: parseInt(id)
                });
                setExpenses(expenses.map(e => e.id === updated.id ? updated : e));
            } else {
                // Create
                const newExpense = await expenseService.createExpense({
                    ...expenseData,
                    group_id: parseInt(id)
                });
                setExpenses([newExpense, ...expenses]);
            }
            const balanceData = await groupService.getBalances(id);
            setBalances(balanceData);
            setShowManualModal(false);
            setEditingExpense(null);
        } catch (err) {
            alert("Failed to save expense");
        }
    };

    const handleEditExpense = (expense) => {
        setEditingExpense(expense);
        setShowManualModal(true);
    };

    const handleRecordPayment = async (fromId, toId, amount) => {
        try {
            await settlementService.recordPayment({
                group_id: parseInt(id),
                payer_id: fromId,
                payee_id: toId,
                amount: amount
            });
            const balanceData = await groupService.getBalances(id);
            setBalances(balanceData);
        } catch (err) {
            alert("Failed to record payment");
        }
    };

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    const getAvatarColor = (userId) => {
        const colors = ['#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#ff9800', '#ff5722'];
        return colors[userId % colors.length];
    };

    const getCategoryIcon = (category) => {
        const cats = {
            'General': '📦',
            'Food': '🍔',
            'Transport': '🚗',
            'Rent': '🏠',
            'Shopping': '🛍️',
            'Entertainment': '🍿',
            'Health': '🏥'
        };
        return cats[category] || '📦';
    };

    const getChartData = () => {
        const dataMap = {};
        expenses.forEach(e => {
            const cat = e.category || 'General';
            dataMap[cat] = (dataMap[cat] || 0) + e.amount;
        });
        return Object.entries(dataMap).map(([name, value]) => ({ name, value }));
    };

    const COLORS = {
        'Food': '#FF6B6B',
        'Transport': '#4D96FF',
        'Rent': '#6BCB77',
        'Shopping': '#FFD93D',
        'Entertainment': '#9c27b0',
        'Health': '#03a9f4',
        'General': '#6366f1',
        'Others': '#94a3b8'
    };

    if (loading) return <div className="dashboard-container"><div className="glass-card">Loading group details...</div></div>;
    if (!group) return <div className="dashboard-container"><div className="glass-card">Group not found</div></div>;

    return (
        <div className="dashboard-container">
            <header style={{
                marginBottom: '3rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.5rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="glass-button"
                        style={{ padding: '0.6rem', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}
                    >
                        ←
                    </button>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '2.4rem', fontWeight: '800' }}>{group.name}</h1>
                        <p style={{ color: 'var(--text-secondary)', margin: '0.2rem 0 0 0', fontSize: '1.1rem' }}>{group.description}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }} className="no-print">
                    <button onClick={() => window.print()} className="glass-button" style={{
                        background: 'rgba(255,255,255,0.05)', padding: '0.8rem 1.2rem'
                    }}>
                        🖨️ Export PDF
                    </button>
                    <button onClick={() => setShowSettlementModal(true)} className="glass-button" style={{
                        background: 'var(--secondary-color)',
                        boxShadow: '0 4px 15px var(--secondary-glow)'
                    }}>
                        💰 Settlements
                    </button>
                    <button onClick={() => setShowRecurringModal(true)} className="glass-button" style={{
                        background: 'rgba(255,255,255,0.05)', padding: '0.8rem 1.2rem'
                    }}>
                        🔄 Recurring
                    </button>
                </div>
            </header>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem'
            }}>
                <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Spending Distribution</div>
                    <div style={{ height: '220px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={getChartData()}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {getChartData().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS.General} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--glass-border)',
                                        backdropFilter: 'blur(8px)',
                                        color: '#fff'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ paddingLeft: '20px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Group Spend</div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)' }}>{group.base_currency} {totalSpent.toFixed(2)}</div>
                    </div>
                    {balances && (
                        <div className="glass-card" style={{
                            padding: '1.5rem',
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(30, 41, 59, 0.7) 100%)'
                        }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Net Balance</div>
                            {(() => {
                                const myBalance = balances.balances.find(b => b.user_id === user.id)?.balance || 0;
                                return (
                                    <div style={{
                                        fontSize: '2rem',
                                        fontWeight: '800',
                                        color: myBalance >= 0 ? 'var(--success-color)' : 'var(--error-color)'
                                    }}>
                                        {myBalance >= 0 ? '+' : ''}{group.base_currency} {myBalance.toFixed(2)}
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div>
            </div>

            <div className="group-grid">
                {/* Left Column: Expenses */}
                <div className="expenses-section">
                    <div className="glass-card" style={{ height: '100%', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>Recent Expenses</h2>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Spent</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{group.base_currency} {totalSpent.toFixed(2)}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }} className="no-print">
                            <button
                                className="glass-button"
                                onClick={() => setShowManualModal(true)}
                                style={{
                                    flex: 1,
                                    background: 'var(--primary-color)',
                                    boxShadow: '0 4px 15px var(--primary-glow)'
                                }}
                            >
                                <span style={{ fontSize: '1.2rem' }}>+</span> Add Expense
                            </button>

                            <label className="glass-button" style={{
                                flex: 1,
                                background: 'rgba(255, 255, 255, 0.05)',
                                cursor: 'pointer'
                            }}>
                                {isScanning ? '⏳ Scanning...' : '📷 Scan Receipt'}
                                <input type="file" hidden accept="image/*" onChange={handleFileUpload} disabled={isScanning} />
                            </label>
                        </div>
                        {expenses.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)' }}>No expenses yet.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {expenses.map(exp => (
                                    <div key={exp.id} className="glass-card" style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '1rem 1.25rem',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        transition: 'var(--transition)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                            <div style={{
                                                width: '48px', height: '48px', borderRadius: '12px',
                                                background: 'rgba(255,255,255,0.05)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '1.5rem',
                                                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)'
                                            }}>
                                                {getCategoryIcon(exp.category)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{exp.description}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.2rem' }}>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                        {new Date(exp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        padding: '0.1rem 0.6rem',
                                                        borderRadius: '2rem',
                                                        background: 'rgba(99, 102, 241, 0.1)',
                                                        color: 'var(--primary-color)',
                                                        border: '1px solid rgba(99, 102, 241, 0.2)',
                                                        fontWeight: '600'
                                                    }}>
                                                        {exp.category}
                                                    </span>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                        • Paid by <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                                                            {group.members.find(m => m.user_id === exp.payer_id)?.user?.username || 'Member'}
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '1.2rem' }}>
                                                    {exp.currency} {exp.amount.toFixed(2)}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                    {exp.currency}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }} className="no-print">
                                                <button
                                                    onClick={() => handleEditExpense(exp)}
                                                    className="glass-button"
                                                    style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)' }}
                                                    title="Edit"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteExpense(exp.id)}
                                                    className="glass-button"
                                                    style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                                                    title="Delete"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ marginTop: 0, fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.25rem' }}>Balances</h3>
                        {balances ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {balances.balances.map(b => (
                                    <div key={b.user_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '28px', height: '28px', borderRadius: '50%',
                                                background: getAvatarColor(b.user_id),
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.7rem', fontWeight: 'bold'
                                            }}>
                                                {b.username[0].toUpperCase()}
                                            </div>
                                            <span style={{ fontSize: '0.95rem' }}>{b.username}</span>
                                        </div>
                                        <span style={{ fontWeight: '700', color: b.balance >= 0 ? 'var(--success-color)' : 'var(--error-color)' }}>
                                            {b.balance >= 0 ? '+' : ''}{group.base_currency} {b.balance.toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : <p style={{ color: 'var(--text-secondary)' }}>Loading balances...</p>}
                    </div>

                    <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(99, 102, 241, 0.05)' }}>
                        <h3 style={{ marginTop: 0, fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.25rem' }}>Suggested Settlements</h3>
                        {balances && balances.suggested_transactions.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {balances.suggested_transactions.map((tx, idx) => (
                                    <div key={idx} className="glass-card" style={{
                                        padding: '1rem', background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                            <div style={{ fontSize: '0.85rem' }}>
                                                <span style={{ fontWeight: '600', color: 'var(--primary-color)' }}>{tx.from_name}</span>
                                                <span style={{ color: 'var(--text-secondary)' }}> owes </span>
                                                <span style={{ fontWeight: '600', color: 'var(--secondary-color)' }}>{tx.to_name}</span>
                                            </div>
                                            <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>
                                                {group.base_currency} {tx.amount.toFixed(2)}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRecordPayment(tx.from_id, tx.to_id, tx.amount)}
                                            className="glass-button no-print"
                                            style={{
                                                width: '100%',
                                                padding: '0.5rem',
                                                fontSize: '0.8rem',
                                                borderRadius: '0.6rem',
                                                background: 'rgba(16, 185, 129, 0.1)',
                                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                                color: 'var(--success-color)'
                                            }}
                                        >
                                            Record Payment
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '1rem' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎉</div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>All settled up!</p>
                            </div>
                        )}
                    </div>

                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ marginTop: 0, fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.25rem' }}>Group Members</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {group.members && group.members.map(member => (
                                <div key={member.user_id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '10px',
                                        background: `linear-gradient(135deg, ${getAvatarColor(member.user_id)} 0%, rgba(0,0,0,0.2) 100%)`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 'bold', fontSize: '0.8rem', color: 'white',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                    }}>
                                        {(member.user?.username || '?')[0].toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '600', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            {member.user?.username || `User #${member.user_id}`}
                                            {member.user_id === group.created_by && <span title="Group Admin" style={{ fontSize: '0.8rem' }}>👑</span>}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{member.user?.email || 'No email'}</div>
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={() => setShowAddMemberModal(true)}
                                className="glass-button no-print"
                                style={{
                                    marginTop: '0.5rem',
                                    padding: '0.6rem',
                                    borderRadius: '0.75rem',
                                    border: '1px dashed var(--glass-border)',
                                    background: 'rgba(255,255,255,0.02)',
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.85rem'
                                }}
                            >
                                + Invite New Member
                            </button>
                        </div>
                        {showAddMemberModal && (
                            <AddMemberModal
                                isOpen={showAddMemberModal}
                                onClose={() => setShowAddMemberModal(false)}
                                onAdd={handleAddMember}
                                existingMembers={group.members}
                            />
                        )}
                    </div>
                </div>
            </div>
            {showManualModal && (
                <ManualExpenseModal
                    isOpen={showManualModal}
                    initialData={editingExpense}
                    onClose={() => {
                        setShowManualModal(false);
                        setEditingExpense(null);
                    }}
                    onSave={handleSaveManual}
                    members={group.members}
                />
            )}
            {showReviewModal && ocrData && (
                <OCRReviewModal
                    isOpen={showReviewModal}
                    data={ocrData}
                    members={group.members}
                    onClose={() => setShowReviewModal(false)}
                    onSave={handleConfirmOCR}
                />
            )}
            {showSettlementModal && (
                <SettlementsModal
                    isOpen={showSettlementModal}
                    onClose={() => setShowSettlementModal(false)}
                    groupId={parseInt(id)}
                    suggestedSettlements={balances?.suggested_transactions || []}
                    baseCurrency={group.base_currency}
                    onPaymentRecorded={async () => {
                        const balanceData = await groupService.getBalances(id);
                        setBalances(balanceData);
                    }}
                />
            )}
            {showRecurringModal && (
                <RecurringModal
                    isOpen={showRecurringModal}
                    onClose={() => setShowRecurringModal(false)}
                    groupId={parseInt(id)}
                    members={group.members}
                    baseCurrency={group.base_currency}
                />
            )}
        </div>
    );
};

export default GroupDetail;
