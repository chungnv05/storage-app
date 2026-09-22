import axios from 'axios';
import keycloak from '../auth/keycloak';


const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL, 
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    (config) => {
        if (keycloak.authenticated && keycloak.token) {
            config.headers['Authorization'] = `Bearer ${keycloak.token}`;
        }
        
        // Add Accept-Language header based on current i18next language
        const language = localStorage.getItem('i18nextLng') || 'vi';
        config.headers['Accept-Language'] = language;
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;