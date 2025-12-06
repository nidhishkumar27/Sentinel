const API_URL = 'http://localhost:5000/api';

export const api = {
    // Generic fetch wrapper
    request: async (endpoint: string, options: RequestInit = {}) => {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `API Error: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("API Request Failed:", error);
            throw error;
        }
    },

    get: (endpoint: string) => api.request(endpoint),

    post: (endpoint: string, data: any) => api.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    delete: (endpoint: string) => api.request(endpoint, {
        method: 'DELETE'
    }),

    // Auth Helpers
    login: (credentials: any) => api.post('/auth/login', credentials),
    register: (data: any) => api.post('/auth/register', data),

    // Contact Helpers
    getContacts: () => api.get('/contacts'),

    // Alert Helpers
    // Alert Helpers
    getAlerts: async () => {
        const data = await api.get('/alerts');
        return data.map((item: any) => ({ ...item, id: item._id }));
    },
    createAlert: async (alert: any) => {
        const data = await api.post('/alerts', alert);
        return { ...data, id: data._id };
    },
    updateAlert: (id: string, data: any) => api.request(`/alerts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    })
};
