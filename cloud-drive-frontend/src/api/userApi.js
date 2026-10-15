import api from './clientApi';

const userApi = {
    /** GET /api/user/me → UserResponse */
    getCurrentUser: async () => {
        const response = await api.get('/api/user/me');
        return response.data;
    },

    /**
     * PATCH /api/user/me với body UserRequest { fullName, email, phone }.
     * Backend ghi đè cả ba trường (kể cả khi null), nên luôn gửi đủ ba trường.
     * Backend trả void nên không có dữ liệu trả về.
     */
    updateCurrentUser: async ({ fullName, email, phone }) => {
        await api.patch('/api/user/me', { fullName, email, phone });
    },

    /** GET /api/user/packages → StoragePackageResponse[] */
    getPackages: async () => {
        const response = await api.get('/api/user/packages');
        return response.data;
    }
};

export default userApi;
export { userApi };
