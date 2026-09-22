import api from './clientApi';

const adminApi = {
    getAllUsers: async () => {
        const response = await api.get('/api/admin/users')
        return response.data
    }
}
