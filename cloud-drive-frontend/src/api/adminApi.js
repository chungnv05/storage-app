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
    },

    updateUserStatus: async (userId, status) => {
        const response = await api.put(`/api/admin/users/${userId}/status`, null, {
            params: { status }
        });
        return response.data;
    }
};

export default adminApi;
export { adminApi };

