import api from './clientApi';

const adminApi = {
    /** GET /api/admin/users → UserResponse[] (chỉ các tài khoản role USER) */
    getAllUsers: async () => {
        const response = await api.get('/api/admin/users');
        return response.data;
    },

    /** GET /api/admin/packages → StoragePackageResponse[] */
    getAllPackages: async () => {
        const response = await api.get('/api/admin/packages');
        return response.data;
    },

    /** GET /api/admin/stats → StatResponse */
    getStats: async () => {
        const response = await api.get('/api/admin/stats');
        return response.data;
    },

    /** PUT /api/admin/users/{userId}/status?status=ACTIVE|LOCKED → void */
    updateUserStatus: async (userId, status) => {
        await api.put(`/api/admin/users/${userId}/status`, null, {
            params: { status }
        });
    }
};

export default adminApi;
export { adminApi };
