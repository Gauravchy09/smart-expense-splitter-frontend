import api from './api';

const settlementService = {
    recordPayment: async (paymentData) => {
        const response = await api.post('/settlements/', paymentData);
        return response.data;
    },
    getSettlements: async (groupId) => {
        const response = await api.get(`/settlements/group/${groupId}`);
        return response.data;
    }
};

export default settlementService;
