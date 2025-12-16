import axios from 'axios';
import type { User, Scenario, UserProgress, ProgressStats, Achievement, UserAchievement } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth API
export const authAPI = {
    register: async (data: { email: string; password: string; name?: string; language?: string }) => {
        const response = await api.post<{ user: User; token: string }>('/auth/register', data);
        return response.data;
    },

    login: async (email: string, password: string) => {
        const response = await api.post<{ user: User; token: string }>('/auth/login', { email, password });
        return response.data;
    },

    getMe: async () => {
        const response = await api.get<User>('/auth/me');
        return response.data;
    },

    updateLanguage: async (language: string) => {
        const response = await api.patch<User>('/auth/language', { language });
        return response.data;
    },

    markWelcomeSeen: async () => {
        const response = await api.post<User>('/auth/welcome-seen');
        return response.data;
    },
};

// Scenarios API
export const scenariosAPI = {
    getAll: async () => {
        const response = await api.get<Scenario[]>('/scenarios');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get<Scenario>(`/scenarios/${id}`);
        return response.data;
    },

    complete: async (id: string, data: { score: number; mistakes: number; decisions: any }) => {
        const response = await api.post<UserProgress>(`/scenarios/${id}/complete`, data);
        return response.data;
    },
};

// Progress API
export const progressAPI = {
    getProgress: async () => {
        const response = await api.get<UserProgress[]>('/progress');
        return response.data;
    },

    getStats: async () => {
        const response = await api.get<ProgressStats>('/progress/stats');
        return response.data;
    },

    getScenarioProgress: async (scenarioId: string) => {
        const response = await api.get<UserProgress>(`/progress/scenario/${scenarioId}`);
        return response.data;
    },
};

// Achievements API
export const achievementsAPI = {
    getAll: async () => {
        const response = await api.get<Achievement[]>('/achievements');
        return response.data;
    },

    getUserAchievements: async () => {
        const response = await api.get<UserAchievement[]>('/achievements/user');
        return response.data;
    },

    checkAchievements: async () => {
        const response = await api.post<UserAchievement[]>('/achievements/check');
        return response.data;
    },
};

export default api;
