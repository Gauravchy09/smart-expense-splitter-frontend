import api from './api';

const expenseService = {
    getExpenses: async (groupId) => {
        const response = await api.get(`/expenses/group/${groupId}`);
        return response.data;
    },
    createExpense: async (expenseData) => {
        const response = await api.post('/expenses/', expenseData);
        return response.data;
    },
    scanReceipt: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/ocr/scan', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
    deleteExpense: async (id) => {
        const response = await api.delete(`/expenses/${id}`);
        return response.data;
    },
    updateExpense: async (id, expenseData) => {
        const response = await api.put(`/expenses/${id}`, expenseData);
        return response.data;
    }
};

export default expenseService;
