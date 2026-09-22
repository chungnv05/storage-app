import api from './clientApi';

const adminApi = {
    getAllUsers: async () => {
        const response = await api.get('/api/admin/users');
        return response.data;
    },

    getAllPackages: async () => {
        const response = await api.get('/api/admin/packages');
        return response.data;
    },

    getStats: async () => {
        const response = await api.get('/api/admin/stats');
        return response.data;
    }


};

export default adminApi;
export { adminApi };

