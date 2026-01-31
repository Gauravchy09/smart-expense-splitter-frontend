import api from './api';

const groupService = {
    getGroups: async () => {
        const response = await api.get('/groups/');
        return response.data;
    },
    getSummary: async () => {
        const response = await api.get('/groups/summary');
        return response.data;
    },
    getGroup: async (id) => {
        const response = await api.get(`/groups/${id}`);
        return response.data;
    },
    addMember: async (groupId, userId) => {
        const response = await api.post(`/groups/${groupId}/members/${userId}`);
        return response.data;
    },
    getBalances: async (groupId) => {
        const response = await api.get(`/groups/${groupId}/balances`);
        return response.data;
    },
    createGroup: async (groupData) => {
        const response = await api.post('/groups/', groupData);
        return response.data;
    }
};

export default groupService;
