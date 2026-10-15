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

/**
 * Backend trả lỗi dạng ProblemDetail ({ title, detail, errors }) — kể cả 401/403
 * từ SecurityExceptionHandler. Chuẩn hoá về một Error duy nhất để hook/page chỉ
 * cần đọc `message`, `status` và `fieldErrors` (lỗi validate theo từng trường).
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status ?? null;
        const problem = error.response?.data;

        let message;
        if (problem && typeof problem === 'object' && (problem.detail || problem.title)) {
            message = problem.detail || problem.title;
        } else if (!error.response) {
            message = 'Không thể kết nối tới máy chủ. Vui lòng thử lại sau.';
        } else {
            message = 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
        }

        const apiError = new Error(message);
        apiError.status = status;
        apiError.fieldErrors = problem?.errors || null;
        return Promise.reject(apiError);
    }
);

export default api;
