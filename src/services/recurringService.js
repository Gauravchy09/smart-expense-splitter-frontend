import api from './api';

const recurringService = {
    createRecurring: async (data) => {
        const response = await api.post('/recurring/', data);
        return response.data;
    },
    getRecurring: async (groupId) => {
        const response = await api.get(`/recurring/group/${groupId}`);
        return response.data;
    },
    triggerSpawn: async () => {
        const response = await api.post('/recurring/trigger');
        return response.data;
    }
};

export default recurringService;
